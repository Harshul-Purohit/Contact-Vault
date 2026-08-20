"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { dbService } from "./api";
import { Session } from "./types";

/**
 * Helper to retrieve the current session server-side.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("contactvault_session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  try {
    return JSON.parse(sessionCookie.value) as Session;
  } catch {
    return null;
  }
}

/**
 * Logs in a user by validating credentials and setting the session cookie.
 */
export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password" };
  }

  let userToLogIn = null;

  try {
    const users = await dbService.getUsers();
    userToLogIn = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
  } catch (err) {
    console.error("API error during login:", err);
    return { error: "Failed to connect to database" };
  }

  if (!userToLogIn) {
    return { error: "Invalid email or password" };
  }

  const sessionData: Session = {
    userId: userToLogIn.id,
    userName: userToLogIn.name,
    email: userToLogIn.email,
  };

  const cookieStore = await cookies();
  cookieStore.set("contactvault_session", JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
  });

  // Redirect outside try-catch to allow Next.js redirect mechanism to handle it
  redirect("/contact");
}

/**
 * Registers a new user, saves them to database, and logs them in.
 */
export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    const users = await dbService.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { error: "Email is already registered" };
    }

    const newUser = await dbService.createUser({ name, email, password });

    const sessionData: Session = {
      userId: newUser.id,
      userName: newUser.name,
      email: newUser.email,
    };

    const cookieStore = await cookies();
    cookieStore.set("contactvault_session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  } catch (err) {
    console.error("API error during registration:", err);
    return { error: "Registration failed" };
  }

  redirect("/contact");
}

/**
 * Logs out the current user by clearing the session cookie.
 */
export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("contactvault_session");
  redirect("/login");
}

/**
 * Creates a new contact for the logged-in user.
 */
export async function createContact(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized. Please log in first." };
  }

  try {
    await dbService.createContact({
      name,
      email,
      userid: session.userId,
    });
  } catch (err) {
    console.error("API error creating contact:", err);
    return { error: "Failed to create contact" };
  }

  revalidatePath("/contact");
  redirect("/contact");
}

/**
 * Updates an existing contact.
 */
export async function updateContact(id: string, prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required" };
  }

  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    // Verify contact belongs to user before editing
    const existingContact = await dbService.getContactById(id);
    if (existingContact.userid !== session.userId) {
      return { error: "Unauthorized to edit this contact" };
    }

    await dbService.updateContact(id, {
      name,
      email,
      userid: session.userId,
    });
  } catch (err) {
    console.error("API error updating contact:", err);
    return { error: "Failed to update contact" };
  }

  revalidatePath("/contact");
  redirect("/contact");
}

/**
 * Deletes a contact.
 */
export async function deleteContact(id: string) {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  try {
    const existing = await dbService.getContactById(id);
    if (existing.userid !== session.userId) {
      throw new Error("Unauthorized");
    }
    await dbService.deleteContact(id);
  } catch (err) {
    console.error("API error deleting contact:", err);
    throw new Error("Failed to delete contact");
  }

  revalidatePath("/contact");
}

import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import { dbService } from "@/lib/api";
import EditForm from "./EditForm";

interface EditContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  let contact = null;

  try {
    contact = await dbService.getContactById(id);
  } catch (err) {
    console.error("Error fetching contact by ID:", err);
  }

  // Access validation: redirect if contact does not exist or does not belong to logged-in user
  if (!contact || contact.userid !== session.userId) {
    redirect("/contact");
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Contact</h2>
      <EditForm contact={contact} />
    </div>
  );
}

"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { updateContact } from "@/lib/actions";
import { Contact } from "@/lib/types";

export default function EditForm({ contact }: { contact: Contact }) {
  // Bind the contact's ID as the first parameter of the update action
  const updateContactWithId = updateContact.bind(null, contact.id);
  const [state, formAction, isPending] = useActionState(updateContactWithId, { error: "" });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={contact.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={contact.email}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {state?.error && (
        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
          {state.error}
        </div>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 cursor-pointer text-center"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
        <Link
          href="/contact"
          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 text-center"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

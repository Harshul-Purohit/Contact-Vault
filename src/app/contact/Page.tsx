import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, deleteContact } from "@/lib/actions";
import { dbService } from "@/lib/api";
import { Contact } from "@/lib/types";

export default async function ContactPage() {
  const session = await getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login");
  }

  let contacts: Contact[] = [];
  let errorMsg = "";

  try {
    const allContacts = await dbService.getContacts();
    // Filter contacts so that a user can only view their own contacts
    contacts = allContacts.filter((c) => c.userid === session.userId);
  } catch (err) {
    console.error("Failed to fetch contacts:", err);
    errorMsg = "Could not fetch contacts. Make sure the database is running (npm run server).";
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Contacts</h1>
        <Link
          href="/contact/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Add Contact
        </Link>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6 text-sm">
          {errorMsg}
        </div>
      )}

      {!errorMsg && contacts.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">You don't have any contacts saved yet.</p>
          <Link href="/contact/new" className="text-blue-600 hover:underline text-sm font-medium">
            Create your first contact
          </Link>
        </div>
      )}

      {contacts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center space-x-4">
                    <Link
                      href={`/contact/${contact.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                    <form action={deleteContact.bind(null, contact.id)}>
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-900 cursor-pointer text-sm font-medium"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useActionState } from "react";
import Link from "next/link";
import { createContact } from "@/lib/actions";

const initialState = {
  error: "",
};

export default function NewContactPage() {
  const [state, formAction, isPending] = useActionState(createContact, initialState);

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Add New Contact</h2>
        <Link href="/contact" className="text-sm text-gray-600 hover:text-blue-600">
          Cancel
        </Link>
      </div>

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
            placeholder="Jane Smith"
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
            placeholder="jane@example.com"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {state?.error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none disabled:bg-blue-300 cursor-pointer"
        >
          {isPending ? "Creating..." : "Save Contact"}
        </button>
      </form>
    </div>
  );
}
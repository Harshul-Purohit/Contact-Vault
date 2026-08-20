import Link from "next/link";
import { getSession } from "@/lib/actions";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="max-w-2xl mx-auto mt-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
        Welcome to ContactVault
      </h1>
      <p className="mt-6 text-lg text-gray-600 leading-relaxed">
        A lightweight contact management application built for practicing and understanding Next.js 
        concepts like Server Components, Server Actions, state management, and cookies.
      </p>
      
      <div className="mt-10 flex justify-center gap-4">
        {session ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Logged in as <span className="font-semibold text-gray-700">{session.email}</span>
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Go to Contacts
            </Link>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

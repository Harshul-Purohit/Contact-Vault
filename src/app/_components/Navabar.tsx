import Link from "next/link";
import React from "react";
import LogoutButton from "./LogoutButton";
import { getSession } from "@/lib/actions";

const Navbar = async () => {
  const session = await getSession();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          ContactVault
        </Link>
        <div className="flex items-center space-x-6">
          {session ? (
            <>
              <span className="text-gray-600 text-sm">
                Hello, <strong className="text-gray-800">{session.userName}</strong>
              </span>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 font-medium">
                Contacts
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-blue-600 font-medium">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

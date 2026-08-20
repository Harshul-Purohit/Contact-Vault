import React from "react";
import { logoutUser } from "@/lib/actions";

const LogoutButton = () => {
  return (
    <form action={logoutUser}>
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors cursor-pointer"
      >
        Logout
      </button>
    </form>
  );
};

export default LogoutButton;
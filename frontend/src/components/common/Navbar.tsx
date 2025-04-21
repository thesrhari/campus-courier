"use client";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import NotificationBell from "./NotificationBell"; // Create this component

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          Campus Courier
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-200">
                Dashboard
              </Link>
              <Link href="/tasks/new" className="hover:text-blue-200">
                Post Task
              </Link>
              <Link href="/my-tasks" className="hover:text-blue-200">
                My Tasks
              </Link>
              {/* Add NotificationBell Component Here */}
              <NotificationBell />
              <span className="hidden md:inline">Hi, {user.name}!</span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition duration-150"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link href="/signup" className="hover:text-blue-200">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

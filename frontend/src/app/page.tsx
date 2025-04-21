"use client"; // Needs to be a client component to use hooks

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useAuth from "@/hooks/useAuth"; // Use the hook
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if logged in and finished loading
    if (!loading && user) {
      router.replace("/dashboard"); // Use replace to avoid adding landing page to history
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  // If not loading and not logged in, show the landing page content
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
        <div className="text-center bg-white p-10 rounded-lg shadow-xl max-w-lg">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            Welcome to Campus Courier!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Need help with errands around campus? Or want to earn some cash by
            helping others? You're in the right place.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
            <Link
              href="/login"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-block px-8 py-3 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 transition duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
        <footer className="mt-10 text-gray-500 text-sm">
          © {new Date().getFullYear()} Campus Courier System
        </footer>
      </div>
    );
  }

  // If user is loaded but redirection hasn't happened yet (should be brief)
  // You could return null or another loading indicator, but redirection should be quick.
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <LoadingSpinner />
    </div>
  );
}

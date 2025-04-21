"use client";
import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import useAuth from "@/hooks/useAuth"; // Correct import for the hook
import AuthForm from "@/components/auth/AuthForm";
import LoadingSpinner from "@/components/common/LoadingSpinner"; // Import spinner

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [componentLoading, setComponentLoading] = useState(false); // Renamed internal loading state
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth(); // Get login, user, and auth loading state

  // --- Effect Hook for Redirection ---
  useEffect(() => {
    // Redirect IMMEDIATELY if user is found (and auth isn't loading initial state)
    // This prevents flashing the login page if already logged in
    if (!authLoading && user) {
      console.log("Login Page: User already logged in, redirecting...");
      router.replace("/dashboard"); // Use replace to avoid history entry
    }
  }, [user, authLoading, router]);
  // --- End Effect Hook ---

  const handleLogin = async (formData: any) => {
    setComponentLoading(true); // Start component loading
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/login", formData);
      if (response.data && response.data.token) {
        await login(response.data.token); // Call context login
        // Redirect is now handled by the useEffect hook watching 'user' state
      } else {
        setError("Login succeeded but failed to retrieve session.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
      console.error("Login error:", err);
    } finally {
      setComponentLoading(false); // Stop component loading
    }
  };

  // Prevent rendering the form if auth is still loading or user is already confirmed
  if (authLoading || (!authLoading && user)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // --- Render form if not logged in and auth check complete ---
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-center mb-4 text-sm">
            {error}
          </p>
        )}
        {/* Show spinner overlay if component is processing login */}
        {componentLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <AuthForm
            onSubmit={handleLogin}
            loading={componentLoading}
            isSignup={false}
          />
        )}

        {!componentLoading && ( // Hide link while component is loading
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500">
              Sign Up
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

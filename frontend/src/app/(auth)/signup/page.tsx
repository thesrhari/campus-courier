"use client";
import React, { useState, useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import useAuth from "@/hooks/useAuth"; // Correct import for the hook
import AuthForm from "@/components/auth/AuthForm";
import LoadingSpinner from "@/components/common/LoadingSpinner"; // Import spinner

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [componentLoading, setComponentLoading] = useState(false); // Renamed internal loading state
  const router = useRouter();
  const { signup, user, loading: authLoading } = useAuth(); // Get signup, user, and auth loading state

  // --- Effect Hook for Redirection ---
  useEffect(() => {
    // Redirect IMMEDIATELY if user is found (and auth isn't loading initial state)
    if (!authLoading && user) {
      console.log(
        "Signup Page: User logged in after signup/refresh, redirecting..."
      );
      router.replace("/dashboard"); // Use replace to avoid history entry
    }
  }, [user, authLoading, router]);
  // --- End Effect Hook ---

  const handleSignup = async (formData: any) => {
    setComponentLoading(true); // Start component loading
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/signup", formData);
      if (response.data && response.data.token) {
        await signup(response.data.token); // Call context signup
        // Redirect is now handled by the useEffect hook watching 'user' state
      } else {
        setError("Signup succeeded but failed to log in automatically.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
      console.error("Signup error:", err);
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
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        {error && (
          <p className="text-red-600 dark:text-red-400 text-center mb-4 text-sm">
            {error}
          </p>
        )}
        {/* Show spinner overlay if component is processing signup */}
        {componentLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <AuthForm
            onSubmit={handleSignup}
            loading={componentLoading}
            isSignup={true}
          />
        )}

        {!componentLoading && ( // Hide link while component is loading
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500">
              Login
            </a>
          </p>
        )}
      </div>
    </div>
  );
}

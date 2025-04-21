"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Use 'next/navigation' for App Router
import useAuth from "@/hooks/useAuth";

const useRequireAuth = (redirectTo = "/login") => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only run check if loading is finished
    if (!loading) {
      if (!user) {
        router.push(redirectTo);
      }
    }
  }, [user, loading, router, redirectTo]);

  // Optionally return loading state or user if needed by the component
  return { user, loading };
};

export default useRequireAuth;

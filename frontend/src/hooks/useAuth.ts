"use client";
// This file provides a hook to easily access the AuthContext

import { useContext } from "react";
// Assuming AuthContext is exported from AuthProvider. Adjust path if necessary.
import {
  AuthContext,
  AuthContextType,
} from "@/components/providers/AuthProvider";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This error is helpful during development if the hook is used outside the provider
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export the default hook function
export default useAuth;

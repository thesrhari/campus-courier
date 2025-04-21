"use client"; // This component uses client-side hooks

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axiosInstance";
import { User } from "@/types"; // Ensure User type is correctly defined and imported
import { disconnectSocket, getSocket } from "@/lib/socket"; // Ensure socket functions are correctly defined and imported
import LoadingSpinner from "../common/LoadingSpinner"; // Ensure LoadingSpinner component exists

// Define the interface for the context value
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean; // Indicates if currently fetching user or processing auth
  login: (token: string) => Promise<void>;
  logout: () => void;
  signup: (token: string) => Promise<void>;
}

// Create the context with an initial undefined value
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Initialize loading to true to check for token on mount
  const [loading, setLoading] = useState(true);

  // --- Function to fetch user data ---
  const fetchUser = async (authToken: string) => {
    console.log(
      "Attempting to fetch user with token:",
      authToken ? "Present" : "Absent"
    );
    // Don't necessarily set loading true here unless needed, handleAuthSuccess does
    try {
      // Added check to prevent fetching if token is invalid/missing
      if (!authToken) {
        throw new Error("No auth token provided for fetchUser");
      }
      const { data } = await axiosInstance.get("/auth/me", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("User fetched successfully:", data?.email);
      setUser(data);
      setToken(authToken); // Sync token state with the one used
      getSocket(); // Initialize/get socket connection now that user is confirmed
    } catch (error: any) {
      console.error(
        "Failed to fetch user:",
        error.response?.data || error.message
      );
      // Clear state if fetching user fails (e.g., invalid token)
      Cookies.remove("token");
      setToken(null);
      setUser(null);
      disconnectSocket();
    } finally {
      // Always set loading false after attempting fetch, regardless of outcome
      setLoading(false);
      console.log("fetchUser finished, loading set to false");
    }
  };

  // --- Effect to check token on initial load ---
  useEffect(() => {
    const currentToken = Cookies.get("token");
    console.log(
      "AuthProvider Mount/Token Check. Cookie token:",
      currentToken ? "Present" : "Absent"
    );
    if (currentToken) {
      setLoading(true); // Set loading true before fetching
      fetchUser(currentToken);
    } else {
      // No token found, definitely not loading user data
      setUser(null);
      setToken(null);
      setLoading(false); // Ensure loading is false
      disconnectSocket();
      console.log("No token found on mount, loading set to false");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial mount

  // --- Function to handle successful authentication (login/signup) ---
  const handleAuthSuccess = async (newToken: string) => {
    console.log("handleAuthSuccess called with new token.");
    setLoading(true); // Start loading indicator for auth processing/user fetch
    Cookies.set("token", newToken, {
      expires: 30,
      secure: process.env.NODE_ENV === "production",
    });
    // Set token state immediately
    setToken(newToken);
    // Fetch user details using the new token
    // setLoading(false) will happen inside fetchUser's finally block
    await fetchUser(newToken);
  };

  // --- Login function ---
  const login = async (newToken: string) => {
    await handleAuthSuccess(newToken);
  };

  // --- Signup function ---
  const signup = async (newToken: string) => {
    await handleAuthSuccess(newToken); // Same logic as login
  };

  // --- Logout function ---
  const logout = () => {
    console.log("Logout called");
    setLoading(true); // Indicate processing
    Cookies.remove("token");
    setToken(null);
    setUser(null);
    disconnectSocket();
    console.log("User logged out, state cleared.");
    // Use window.location for reliable redirect after state update cycle
    window.location.href = "/login";
    // setLoading(false); // Not strictly necessary before redirect
  };

  // --- Render ---
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, signup }}
    >
      {/* Show loading spinner primarily during the initial auth check */}
      {/* Subsequent loading states are handled within pages if needed */}
      {loading && !user && !token ? ( // Show only if truly loading initial state
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      ) : (
        children // Render children once initial check is done or user is available
      )}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook (assuming it's defined in hooks/useAuth.ts and imports AuthContext correctly)
// If useAuth is in its own file, this export might not be needed here.
// export { useAuth };

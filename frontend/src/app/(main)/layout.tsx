"use client";
import React, { ReactNode } from "react";
import Navbar from "@/components/common/Navbar";
import useRequireAuth from "@/hooks/useRequireAuth";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { loading, user } = useRequireAuth(); // Protect this layout

  if (loading || !user) {
    // Show loading or handle redirection state (useRequireAuth handles redirect)
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      {/* Optional Footer */}
      <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
        Campus Courier © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

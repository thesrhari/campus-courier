"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios"; // Import axios and AxiosError type
import axiosInstance from "@/lib/axiosInstance";
import TaskForm from "@/components/tasks/TaskForm";
// Removed TaskFormData import - we receive the final structure from TaskForm
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function NewTaskPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Receives the already structured data from TaskForm's onSubmit
  const handleCreateTask = async (processedFormData: any) => {
    // Rename parameter
    setLoading(true);
    setError(null);
    console.log("Data received from form in page:", processedFormData); // Log received data

    try {
      // --- REMOVE Redundant Validation and Data Prep ---
      // TaskForm component should have already validated and structured the data
      // based on the selected category before calling this onSubmit handler.

      // We can add a top-level check just in case
      if (!processedFormData || !processedFormData.category) {
        throw new Error("Invalid form data received from component.");
      }
      // --- End Removal ---

      console.log("Data being sent to backend:", processedFormData);
      await axiosInstance.post("/tasks", processedFormData); // Send the data directly
      alert("Task posted successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      // Catch block starts here, err is unknown
      let message = "Failed to post task. Please try again."; // Default error message

      // Check if it's an error deliberately thrown by our validation
      if (
        err instanceof Error &&
        (err.message.includes("stationery item") ||
          err.message.includes("File details") ||
          err.message.includes("Invalid category") ||
          err.message.includes("Invalid form data"))
      ) {
        message = err.message; // Use the validation error message
        console.error("Client-side validation error:", err.message);
      }
      // Handle Axios and other errors
      else if (axios.isAxiosError(err)) {
        console.error("Axios Error:", err.response?.data || err.message);
        if (err.response?.data?.errors) {
          message = `Validation Failed: ${Object.values(
            err.response.data.errors
          )
            .map((e: any) => e.message)
            .join(", ")}`;
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        } else {
          message = err.message;
        }
      } else if (err instanceof Error) {
        console.error("Generic Error:", err.message);
        message = err.message;
      } else {
        console.error("Unknown Error:", err);
        message = "An unexpected error occurred.";
      }

      setError(message); // Set the extracted or default error message
    } finally {
      setLoading(false);
    }
  }; // handleCreateTask ends here

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-black">
        Post a New Task
      </h1>
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {/* Render loading state or the form */}
      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        // TaskForm now handles internal validation and structuring before calling onSubmit
        <TaskForm onSubmit={handleCreateTask} loading={loading} />
      )}
    </div>
  );
}

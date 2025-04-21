"use client";
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Task } from "@/types";
import TaskList from "@/components/tasks/TaskList";
import LoadingSpinner from "@/components/common/LoadingSpinner";

enum TaskView {
  Posted = "posted",
  Accepted = "accepted",
}

export default function MyTasksPage() {
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [loadingPosted, setLoadingPosted] = useState(true);
  const [loadingAccepted, setLoadingAccepted] = useState(true);
  const [errorPosted, setErrorPosted] = useState<string | null>(null);
  const [errorAccepted, setErrorAccepted] = useState<string | null>(null);
  const [view, setView] = useState<TaskView>(TaskView.Posted);

  // --- Fetching logic (remains the same) ---
  useEffect(() => {
    const fetchPostedTasks = async () => {
      setLoadingPosted(true);
      setErrorPosted(null);
      try {
        const response = await axiosInstance.get("/tasks/my-posted");
        setPostedTasks(response.data);
      } catch (err) {
        console.error("Failed fetching posted:", err);
        setErrorPosted("Could not load.");
      } finally {
        setLoadingPosted(false);
      }
    };
    const fetchAcceptedTasks = async () => {
      setLoadingAccepted(true);
      setErrorAccepted(null);
      try {
        const response = await axiosInstance.get("/tasks/my-accepted");
        setAcceptedTasks(response.data);
      } catch (err) {
        console.error("Failed fetching accepted:", err);
        setErrorAccepted("Could not load.");
      } finally {
        setLoadingAccepted(false);
      }
    };
    fetchPostedTasks();
    fetchAcceptedTasks();
  }, []);

  // --- Calculations (remains the same) ---
  const totalSpending = useMemo(
    () =>
      postedTasks
        .filter((task) => task.status === "Completed")
        .reduce((sum, task) => sum + (task.price || 0), 0),
    [postedTasks]
  );
  const totalEarnings = useMemo(
    () =>
      acceptedTasks
        .filter((task) => task.status === "Completed")
        .reduce((sum, task) => sum + (task.price || 0), 0),
    [acceptedTasks]
  );
  const isLoading = loadingPosted || loadingAccepted;
  const formatAmount = (amount: number) => amount.toFixed(2);

  return (
    // Let background color come from body/layout
    <div>
      {/* Heading color inherits from body */}
      <h1 className="text-3xl font-bold mb-6 heading">My Tasks</h1>

      {/* Summary Box - Use simple background/border */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md flex flex-col md:flex-row justify-around items-center text-center space-y-4 md:space-y-0 md:space-x-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Spent (Completed)
          </p>
          <div className="text-2xl font-bold text-red-600 dark:text-red-500 mt-1 h-8 flex items-center justify-center">
            {isLoading ? <LoadingSpinner /> : `₹${formatAmount(totalSpending)}`}
          </div>
        </div>

        <div className="border-l border-gray-300 dark:border-gray-600 h-12 hidden md:block"></div>
        <hr className="w-full border-gray-300 dark:border-gray-600 md:hidden" />

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Earned (Completed)
          </p>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1 h-8 flex items-center justify-center">
            {isLoading ? <LoadingSpinner /> : `₹${formatAmount(totalEarnings)}`}
          </div>
        </div>
      </div>

      {/* Tabs - Use simple border/text colors */}
      <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {/* Tab Button - Posted */}
          <button
            onClick={() => setView(TaskView.Posted)}
            className={`${
              view === TaskView.Posted
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400" // Active tab style
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600" // Inactive tab style
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`} // Added focus style
          >
            Tasks I've Posted ({postedTasks.length})
          </button>
          {/* Tab Button - Accepted */}
          <button
            onClick={() => setView(TaskView.Accepted)}
            className={`${
              view === TaskView.Accepted
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400" // Active tab style
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600" // Inactive tab style
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`} // Added focus style
          >
            Tasks I've Accepted ({acceptedTasks.length})
          </button>
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && !totalSpending && !totalEarnings && (
        <div className="flex justify-center mt-10">
          {" "}
          <LoadingSpinner />{" "}
        </div>
      )}

      {/* Task Lists - Error messages use simple styling */}
      {view === TaskView.Posted && (
        <>
          {errorPosted && (
            <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded mb-4 text-sm">
              {errorPosted}
            </p>
          )}
          <TaskList tasks={postedTasks} />
        </>
      )}
      {view === TaskView.Accepted && (
        <>
          {errorAccepted && (
            <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded mb-4 text-sm">
              {errorAccepted}
            </p>
          )}
          <TaskList tasks={acceptedTasks} />
        </>
      )}
    </div>
  );
}

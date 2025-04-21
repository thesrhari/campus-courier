"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { Task } from "@/types";
import TaskList from "@/components/tasks/TaskList";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get("/tasks"); // Gets open tasks
        setTasks(response.data);
      } catch (err) {
        console.error("Failed to fetch tasks:", err);
        setError("Could not load available tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  return (
    // Let background inherit from layout/body
    <div>
      {/* Heading color should inherit */}
      <h1 className="text-3xl font-bold mb-6 heading">Available Tasks</h1>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center mt-10">
          {" "}
          <LoadingSpinner />{" "}
        </div>
      )}

      {/* Error State - Use simple styling */}
      {!loading && error && (
        <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded text-sm">
          {error}
        </p>
      )}

      {/* Task List */}
      {!loading && !error && <TaskList tasks={tasks} />}
    </div>
  );
}

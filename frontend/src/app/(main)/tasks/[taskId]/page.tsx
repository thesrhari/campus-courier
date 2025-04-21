"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";
import { Task } from "@/types";
import TaskDetails from "@/components/tasks/TaskDetails";
import MessagingInterface from "@/components/messaging/MessagingInterface";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Fetching and Action Handlers (Keep these as they were) ---
  const fetchTask = useCallback(async () => {
    if (!taskId) {
      setLoading(false);
      setError("Task ID missing.");
      return;
    }
    setLoading(true);
    setError(null);
    setTask(null);
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}`);
      setTask(response.data);
    } catch (err: any) {
      console.error("Fetch err:", err);
      setError(
        err.response?.status === 404
          ? "Task not found."
          : "Could not load task."
      );
    } finally {
      setLoading(false);
    }
  }, [taskId]);
  useEffect(() => {
    fetchTask();
  }, [fetchTask]);
  const handleAcceptTask = async () => {
    if (!taskId || task?.status !== "Open") return;
    setActionLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}/accept`);
      setTask(response.data);
      alert("Task accepted!");
    } catch (err: any) {
      console.error("Accept err:", err);
      setError(err.response?.data?.message || "Failed.");
    } finally {
      setActionLoading(false);
    }
  };
  const handleCompleteTask = async () => {
    if (!taskId || task?.status !== "InProgress") return;
    setActionLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put(`/tasks/${taskId}/complete`);
      setTask(response.data);
      alert("Task completed!");
    } catch (err: any) {
      console.error("Complete err:", err);
      setError(err.response?.data?.message || "Failed.");
    } finally {
      setActionLoading(false);
    }
  };
  // --- End Fetching / Actions ---

  return (
    // Use padding from the main layout, limit width, center it
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {" "}
      {/* Added space-y for spacing between components */}
      {/* --- Loading State --- */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          {" "}
          {/* More padding */}
          <LoadingSpinner />
        </div>
      )}
      {/* --- Error State --- */}
      {!loading && error && (
        // Use card styling for error message
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md text-center">
          <p>{error}</p>
        </div>
      )}
      {/* --- Task Details (Rendered within its own container) --- */}
      {!loading && !error && task && (
        <TaskDetails // Pass props down
          task={task}
          actionLoading={actionLoading}
          onAccept={handleAcceptTask}
          onComplete={handleCompleteTask}
        />
      )}
      {/* --- Messaging (Rendered within its own container) --- */}
      {/* Conditionally render based on task status/existence */}
      {!loading &&
        !error &&
        task &&
        (task.status === "InProgress" || task.status === "Completed") &&
        task.acceptedBy && (
          <MessagingInterface
            taskId={task._id}
            taskStatus={task.status}
            posterId={
              typeof task.postedBy === "string"
                ? task.postedBy
                : task.postedBy._id
            }
            accepterId={
              typeof task.acceptedBy === "string"
                ? task.acceptedBy
                : task.acceptedBy?._id
            }
          />
        )}
    </div>
  );
}

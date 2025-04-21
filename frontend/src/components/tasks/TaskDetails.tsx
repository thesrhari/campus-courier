"use client";
import React from "react";
import { Task, User, StationeryItem } from "@/types"; // Import specific types
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "../common/LoadingSpinner";
import { format } from "date-fns";

interface TaskDetailsProps {
  task: Task; // Assume task is always passed when this renders
  actionLoading: boolean;
  onAccept: () => void;
  onComplete: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  actionLoading,
  onAccept,
  onComplete,
}) => {
  const { user } = useAuth();
  const formatPrice = (price: number | null | undefined) =>
    (price ?? 0).toFixed(2);
  const isPoster =
    user?._id ===
    (typeof task.postedBy === "object" ? task.postedBy?._id : task.postedBy);
  const isAccepter =
    user?._id ===
    (typeof task.acceptedBy === "object"
      ? task.acceptedBy?._id
      : task.acceptedBy);
  const canAccept = user && !isPoster && task.status === "Open";
  const canComplete = user && isPoster && task.status === "InProgress";
  const getUserName = (userData: User | string | null | undefined): string => {
    if (!userData) return "N/A";
    if (typeof userData === "object" && userData.name) return userData.name;
    return "User";
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
      {/* --- Header --- */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-semibold">
          {task.title || `${task.category} Request`}
        </h1>
        {/* Category Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            task.category === "Stationery"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              : task.category === "Printouts"
              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {task.category}
        </span>
      </div>

      {/* --- Body --- */}
      <div className="p-4 md:p-6 space-y-5">
        {" "}
        {/* Increased spacing */}
        {/* --- Category Specific Details --- */}
        {task.category === "Stationery" && task.stationeryDetails && (
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
            <h4 className="text-md font-semibold mb-2">
              Stationery Items Requested
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2 text-sm">
              {task.stationeryDetails.items?.map((item, index) => (
                <li key={item._id || index}>
                  {" "}
                  {/* Use _id if backend adds it, else index */}
                  {item.name} - Quantity: {item.quantity}
                </li>
              ))}
            </ul>
            {task.stationeryDetails.additionalInfo && (
              <div className="mt-3">
                <strong className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Additional Info
                </strong>
                <p className="text-sm whitespace-pre-wrap">
                  {task.stationeryDetails.additionalInfo}
                </p>
              </div>
            )}
          </div>
        )}
        {task.category === "Printouts" && task.printoutDetails && (
          <div className="border-b border-gray-200 dark:border-gray-700 pb-5 space-y-3">
            <h4 className="text-md font-semibold mb-2">Printout Details</h4>
            {task.printoutDetails.fileName && (
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <strong className="font-medium text-gray-500 dark:text-gray-400">
                    File:
                  </strong>{" "}
                  {task.printoutDetails.fileName}{" "}
                  {task.printoutDetails.fileType
                    ? `(${task.printoutDetails.fileType})`
                    : ""}
                </p>
                {/* SIMULATED Download Button */}
                <button
                  onClick={() =>
                    alert(
                      "Download functionality requires file storage integration."
                    )
                  }
                  disabled={!task.printoutDetails.fileUrl} // Disable if no URL (not implemented yet)
                  title={
                    !task.printoutDetails.fileUrl
                      ? "File URL not available"
                      : "Download File (Simulated)"
                  }
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download
                </button>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p>
                <strong className="font-medium text-gray-500 dark:text-gray-400">
                  Pages:
                </strong>{" "}
                {task.printoutDetails.pages || "N/A"}
              </p>
              <p>
                <strong className="font-medium text-gray-500 dark:text-gray-400">
                  Color:
                </strong>{" "}
                {task.printoutDetails.color ? "Yes" : "No"}
              </p>
              <p>
                <strong className="font-medium text-gray-500 dark:text-gray-400">
                  Double-Sided:
                </strong>{" "}
                {task.printoutDetails.doubleSided ? "Yes" : "No"}
              </p>
            </div>
            {task.printoutDetails.additionalInfo && (
              <div className="mt-2">
                <strong className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Additional Info
                </strong>
                <p className="text-sm whitespace-pre-wrap">
                  {task.printoutDetails.additionalInfo}
                </p>
              </div>
            )}
          </div>
        )}
        {/* --- End Category Specific --- */}
        {/* --- Common Details --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Offered Price
            </strong>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              ₹{formatPrice(task.price)}
            </p>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Delivery Location
            </strong>
            <p>{task.deliveryLocation}</p>
          </div>
          {task.deadline && (
            <div>
              <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Deadline
              </strong>
              <p>{format(new Date(task.deadline), "PPP p")}</p>
            </div>
          )}
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Status
            </strong>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                task.status === "Open"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : task.status === "InProgress"
                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {" "}
              {task.status}{" "}
            </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Posted By
            </strong>
            <p>{getUserName(task.postedBy)}</p>
            {task.createdAt && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                on {format(new Date(task.createdAt), "PP")}
              </p>
            )}
          </div>
          {task.acceptedBy && (
            <div>
              <strong className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Accepted By
              </strong>
              <p>{getUserName(task.acceptedBy)}</p>
              {task.completedAt && (
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  Completed: {format(new Date(task.completedAt), "PP")}
                </p>
              )}
            </div>
          )}
        </div>
        {/* --- End Common Details --- */}
      </div>

      {/* --- Actions Footer --- */}
      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-start space-x-3">
          {canAccept && (
            <button
              onClick={onAccept}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow text-sm transition duration-150 disabled:opacity-50"
            >
              {" "}
              {actionLoading ? <LoadingSpinner /> : "Accept Task"}{" "}
            </button>
          )}
          {canComplete && (
            <button
              onClick={onComplete}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow text-sm transition duration-150 disabled:opacity-50"
            >
              {" "}
              {actionLoading ? <LoadingSpinner /> : "Mark Completed"}{" "}
            </button>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            {" "}
            {!canAccept &&
              !canComplete &&
              task.status !== "Completed" &&
              user && (
                <>
                  {" "}
                  {task.status === "Open" && isPoster && "Waiting..."}{" "}
                  {task.status === "InProgress" && isAccepter && "Waiting..."}{" "}
                  {task.status === "InProgress" &&
                    !isPoster &&
                    !isAccepter &&
                    "In progress."}{" "}
                </>
              )}{" "}
            {task.status === "Completed" && (
              <span className="text-green-700 dark:text-green-500 not-italic font-medium">
                Task Completed
              </span>
            )}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

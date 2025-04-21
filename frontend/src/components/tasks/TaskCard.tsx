import Link from "next/link";
import { Task, User } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const formatPrice = (price: number | null | undefined) =>
    (price ?? 0).toFixed(2);
  const getPosterName = (
    postedBy: User | string | null | undefined
  ): string => {
    if (!postedBy) return "Unknown";
    if (typeof postedBy === "object" && postedBy !== null && "name" in postedBy)
      return postedBy.name;
    return "You";
  };

  // Generate a summary based on category
  const getSummary = (task: Task): string | null => {
    if (task.category === "Stationery" && task.stationeryDetails?.items) {
      const count = task.stationeryDetails.items.length;
      return `${count} item${count !== 1 ? "s" : ""} requested`;
    }
    if (task.category === "Printouts" && task.printoutDetails?.fileName) {
      return `File: ${task.printoutDetails.fileName}`;
    }
    return null; // No summary for other types or if details missing
  };

  const summary = getSummary(task);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col justify-between h-full">
      <div>
        {/* Show Category Badge */}
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
            task.category === "Stationery"
              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              : task.category === "Printouts"
              ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" // Fallback
          }`}
        >
          {task.category}
        </span>

        {/* Use task Title if available, otherwise generate one */}
        <h3 className="text-lg font-semibold mb-1 line-clamp-2">
          {task.title || `${task.category} Request`}
        </h3>

        {/* Show Summary if available */}
        {summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
            {summary}
          </p>
        )}

        <p className="text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">Price:</span>{" "}
          <span className="font-medium text-green-600 dark:text-green-400">
            ₹{formatPrice(task.price)}
          </span>
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Posted by: {getPosterName(task.postedBy)}
          {task.createdAt &&
            ` (${formatDistanceToNow(new Date(task.createdAt))} ago)`}
        </p>
        {task.deadline && (
          <p className="text-red-600 dark:text-red-500 text-sm mb-3">
            {" "}
            Deadline: {new Date(task.deadline).toLocaleDateString()}{" "}
          </p>
        )}
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-3 ${
            task.status === "Open"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : task.status === "InProgress"
              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {task.status}
        </span>
      </div>
      <div className="mt-auto pt-3">
        <Link
          href={`/tasks/${task._id}`}
          className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default TaskCard;

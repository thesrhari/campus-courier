import React from "react";
import { Task } from "@/types";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  title?: string; // Optional title for the list
}

const TaskList: React.FC<TaskListProps> = ({ tasks, title }) => {
  return (
    <div>
      {title && <h2 className="text-2xl font-semibold mb-4">{title}</h2>}
      {tasks.length === 0 ? (
        <p className="text-gray-600 italic">No tasks found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;

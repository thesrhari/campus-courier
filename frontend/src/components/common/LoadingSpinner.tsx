import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
        role="status"
        aria-label="Loading..."
      ></div>
    </div>
  );
};

export default LoadingSpinner;

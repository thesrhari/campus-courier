"use client";
import React, { useState, FormEvent } from "react";
import LoadingSpinner from "../common/LoadingSpinner";

interface AuthFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
  isSignup?: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  loading,
  isSignup = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    // Form itself doesn't need background, inherits from card
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <div>
          {/* Label text color inherits */}
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {" "}
            Name{" "}
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required={isSignup}
            // Standard Input Styling for light/dark
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Your Name"
          />
        </div>
      )}
      <div>
        {/* Label text color inherits */}
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {" "}
          Email Address{" "}
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          // Standard Input Styling
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="you@example.com"
        />
      </div>
      <div>
        {/* Label text color inherits */}
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          {" "}
          Password{" "}
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          // Standard Input Styling
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="••••••••"
        />
      </div>
      <div>
        {/* Standard Button Styling */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner /> : isSignup ? "Sign Up" : "Login"}
        </button>
      </div>
    </form>
  );
};

export default AuthForm;

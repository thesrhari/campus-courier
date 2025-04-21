"use client";
import React, { useState, useEffect, useRef } from "react";
import { BellIcon } from "@heroicons/react/24/outline"; // Use Heroicons (npm install @heroicons/react)
import { Notification } from "@/types";
import axiosInstance from "@/lib/axiosInstance";
import { getSocket } from "@/lib/socket"; // Get socket instance
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to detect outside clicks

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/notifications");
      const fetchedNotifications: Notification[] = response.data;
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(); // Fetch on initial load

    // --- Socket Listener ---
    const socket = getSocket();
    if (socket) {
      const handleNewNotification = (notification: Notification) => {
        console.log("Received newNotification event:", notification);
        // Add to list (prepend) and update unread count
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        // Optional: Show a toast or subtle indicator
      };

      socket.on("newNotification", handleNewNotification);
      console.log("Listening for 'newNotification'");

      // Cleanup listener
      return () => {
        socket.off("newNotification", handleNewNotification);
        console.log("Stopped listening for 'newNotification'");
      };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    // Optional: Mark notifications as read when dropdown is opened
    // This might require an API call if you want to persist the read status immediately
    // Or just update the local count for simplicity in MVP
    if (!isOpen && unreadCount > 0) {
      // markNotificationsAsRead(); // Implement this function if needed
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    // Optimistically update UI
    setNotifications((prev) =>
      prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1)); // Ensure count doesn't go below 0

    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      // Refresh might be needed if optimistic update fails, or rely on it
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      // Revert optimistic update on failure (more complex state needed)
      // For MVP, maybe just log the error or show a message
    }
  };

  // Function to mark all visible as read (example)
  const markAllVisibleRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (unreadIds.length === 0) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    // API call (could be a single endpoint for batch update or multiple)
    try {
      // Example: Call individual endpoint for each (less efficient)
      await Promise.all(
        unreadIds.map((id) => axiosInstance.put(`/notifications/${id}/read`))
      );
      // Or ideally: await axiosInstance.put('/notifications/read-all'); (backend needs this endpoint)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      // Handle error / potentially revert UI state
    }
    setIsOpen(false); // Close dropdown after marking read
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-1 rounded-full text-gray-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 transform -translate-y-1/2 translate-x-1/2 rounded-full text-white bg-red-500 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="px-4 py-2 flex justify-between items-center border-b">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <button
                onClick={markAllVisibleRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No new notifications.
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification._id}
                  href={
                    notification.taskId ? `/tasks/${notification.taskId}` : "#"
                  } // Link to task if available
                  onClick={() => {
                    if (!notification.isRead) {
                      markNotificationRead(notification._id);
                    }
                    setIsOpen(false); // Close dropdown on click
                  }}
                  className={`block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 ${
                    !notification.isRead ? "bg-blue-50 font-medium" : ""
                  }`}
                >
                  <p className="truncate">{notification.message}</p>
                  <p
                    className={`text-xs ${
                      !notification.isRead ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </Link>
              ))
            )}
          </div>
          {/* Optional: View All link */}
          {/* <div className="px-4 py-2 border-t">
                <Link href="/notifications" onClick={() => setIsOpen(false)} className="text-sm text-blue-600 hover:underline block text-center">
                   View All Notifications
               </Link>
           </div> */}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

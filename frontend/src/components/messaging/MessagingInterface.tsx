"use client";
import React, { useState, useEffect, useRef } from "react";
import { type Socket } from "socket.io-client"; // Ensure Socket type is imported
import { Message } from "@/types"; // Ensure Message type is imported
import useAuth from "@/hooks/useAuth";
import axiosInstance from "@/lib/axiosInstance";
import LoadingSpinner from "../common/LoadingSpinner";
import { format } from "date-fns";
import { getSocket, joinTaskRoom, leaveTaskRoom } from "@/lib/socket"; // Ensure socket functions are imported

interface MessagingInterfaceProps {
  taskId: string;
  taskStatus: "Open" | "InProgress" | "Completed";
  posterId: string;
  accepterId?: string | null;
}

const MessagingInterface: React.FC<MessagingInterfaceProps> = ({
  taskId,
  taskStatus,
  posterId,
  accepterId,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling to bottom
  const messageListRef = useRef<HTMLDivElement>(null); // Ref for the scrollable message list container
  const socket = useRef<Socket | null>(null); // Ref to hold the socket instance, correctly typed

  // Function to scroll message list to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    // Use a slight delay to ensure the DOM has updated after new message added
    setTimeout(() => {
      if (messageListRef.current) {
        messageListRef.current.scrollTo({
          top: messageListRef.current.scrollHeight,
          behavior: behavior,
        });
      }
    }, 50);
  };

  // Function to fetch messages for the task
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    console.log(`Fetching messages for task ${taskId}`);
    try {
      const response = await axiosInstance.get(`/messages/task/${taskId}`);
      setMessages(response.data);
      scrollToBottom("auto"); // Scroll immediately after fetching
    } catch (err) {
      console.error("Msg fetch err:", err);
      setError("Could not load messages.");
    } finally {
      setLoading(false);
    }
  };

  // Effect to handle socket connection, listeners, and initial message fetch
  useEffect(() => {
    // Determine if messaging is relevant for the current status
    if (taskStatus === "InProgress" || taskStatus === "Completed") {
      fetchMessages(); // Fetch messages

      // Setup socket connection and listeners
      socket.current = getSocket();
      if (socket.current && taskId) {
        joinTaskRoom(taskId); // Join the specific task room

        // Listener for new messages pushed from the server
        const handleNewMsg = (msg: Message) => {
          console.log("Received new message via socket:", msg._id);
          // Add message only if it belongs to this task and isn't already present
          if (msg.taskId === taskId) {
            setMessages((prev) =>
              prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
            );
            scrollToBottom(); // Scroll down when a new message arrives
          }
        };
        socket.current.on("newMessage", handleNewMsg);

        // Cleanup function: leave room and remove listener when component unmounts or deps change
        return () => {
          if (socket.current && taskId) {
            console.log(`Leaving room ${taskId}`);
            leaveTaskRoom(taskId);
            socket.current.off("newMessage", handleNewMsg);
          }
        };
      } else {
        // Handle case where socket isn't ready
        console.warn("Socket connection not ready for messaging.");
        setLoading(false); // Ensure loading stops if socket fails
      }
    } else if (taskStatus === "Open") {
      // Task is open, no messaging needed
      setMessages([]); // Clear any potential stale messages
      setLoading(false); // Not loading messages
    } else {
      // Catch unexpected status or ensure loading stops
      setLoading(false);
    }
    // Re-run effect if taskId or taskStatus changes
  }, [taskId, taskStatus]);

  // Function to handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate before sending
    if (!newMessage.trim() || !user || sending || taskStatus !== "InProgress")
      return;

    setSending(true); // Indicate sending state
    setError(null);
    const messageToSend = newMessage; // Store message content
    setNewMessage(""); // Clear input field immediately

    try {
      // Send message to backend API
      // Backend is responsible for saving and broadcasting via socket
      await axiosInstance.post("/messages", {
        taskId: taskId,
        content: messageToSend,
      });
      // No optimistic update here, we rely on the socket broadcast for consistency
    } catch (err: any) {
      console.error("Send message error:", err);
      setError(err.response?.data?.message || "Failed to send message.");
      setNewMessage(messageToSend); // Restore message to input field on failure
    } finally {
      setSending(false); // Clear sending state
    }
  };

  // Determine user roles and permissions for messaging
  const isUserParticipant =
    user && (user._id === posterId || user._id === accepterId);
  const showMessagingArea =
    taskStatus === "InProgress" ||
    (taskStatus === "Completed" && messages.length > 0);
  const canSendMessage =
    user && taskStatus === "InProgress" && isUserParticipant;

  // --- Render Logic ---
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-white dark:bg-gray-800 overflow-hidden mt-8">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Task Chat</h2>
      </div>

      {/* Placeholder text when chat area is not shown */}
      {!showMessagingArea && (
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
          {taskStatus === "Open" &&
            "Messaging available once task is accepted."}
          {/* Note: InProgress check removed here as !showMessagingArea implies task is Open or Completed w/o messages */}
          {taskStatus === "Completed" &&
            messages.length === 0 &&
            "No messages exchanged."}
        </div>
      )}

      {/* Main Messaging Area */}
      {showMessagingArea && (
        <div
          className="flex flex-col"
          style={{ height: "50vh", minHeight: "300px" }} // Define chat area height
        >
          {/* Scrollable Message List */}
          <div
            ref={messageListRef}
            className="flex-grow p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
          >
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            )}
            {/* Error State */}
            {!loading && error && (
              <p className="text-red-600 dark:text-red-400 text-center p-2 bg-red-50 dark:bg-red-900/30 rounded text-sm">
                {error}
              </p>
            )}
            {/* Empty State (when InProgress) */}
            {!loading &&
              messages.length === 0 &&
              taskStatus === "InProgress" && (
                <p className="text-gray-500 dark:text-gray-400 italic text-center mt-4">
                  Start the conversation!
                </p>
              )}
            {/* Message Bubbles */}
            {messages.map((msg) => {
              const isSender =
                typeof msg.senderId === "object"
                  ? msg.senderId._id === user?._id
                  : msg.senderId === user?._id;
              return (
                <div
                  key={msg._id}
                  className={`flex ${
                    isSender ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-lg shadow-sm ${
                      isSender
                        ? "bg-blue-600 text-white" // Sender bubble style
                        : "bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" // Receiver bubble style
                    }`}
                  >
                    <p className="text-sm break-words whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isSender
                          ? "text-blue-200 opacity-90" // Sender timestamp style
                          : "text-gray-500 dark:text-gray-400 opacity-90" // Receiver timestamp style
                      } text-right`}
                    >
                      {/* Show sender name if available */}
                      {typeof msg.senderId === "object"
                        ? msg.senderId.name
                        : ""}{" "}
                      {/* Format timestamp */}
                      {format(new Date(msg.timestamp), "p")}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area / Footer */}
          <div className="flex-shrink-0">
            {/* Show input form only if user can send messages */}
            {canSendMessage && (
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type message..."
                  className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-150 disabled:opacity-50 flex items-center justify-center h-10"
                >
                  {sending ? <LoadingSpinner /> : "Send"}
                </button>
              </form>
            )}
            {/* Show status if task is completed */}
            {taskStatus === "Completed" && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                Messaging disabled (Task Completed)
              </div>
            )}
            {/* Show status if user is viewing chat but cannot send */}
            {taskStatus === "InProgress" &&
              !canSendMessage &&
              isUserParticipant && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                  You cannot send messages in this state.
                </div>
              )}
            {taskStatus === "InProgress" && !isUserParticipant && user && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                Viewing messages only.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingInterface;

import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

let socket: Socket | null = null;

export const getSocket = (): Socket | null => {
  if (!socket) {
    const token = Cookies.get("token");
    // Connect only if token exists maybe? Or connect always and let server handle auth
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
        auth: { token }, // Send token for authentication on connect
        autoConnect: true, // Connect automatically
      });

      socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        // Handle disconnection logic if needed (e.g., cleanup, retry)
        // Be careful with auto-reconnection loops
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
        // Handle connection errors (e.g., show message to user)
      });
    } else {
      console.error("Socket URL not defined in environment variables.");
    }
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
    console.log("Socket disconnected manually.");
  }
  socket = null; // Clear the instance
};

// Specific emit functions can be added here or called directly using getSocket()
export const joinTaskRoom = (taskId: string) => {
  getSocket()?.emit("joinTaskRoom", taskId);
};

export const leaveTaskRoom = (taskId: string) => {
  getSocket()?.emit("leaveTaskRoom", taskId);
};

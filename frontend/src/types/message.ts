import { User } from "./user";

export interface Message {
  _id: string;
  taskId: string;
  senderId: User | string; // Can be populated
  receiverId: User | string; // Should also be User | string if potentially not populated
  content: string;
  timestamp: string;
}

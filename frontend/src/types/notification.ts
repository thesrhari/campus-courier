export interface Notification {
  _id: string;
  userId: string;
  message: string;
  taskId?: string | null;
  isRead: boolean;
  createdAt: string;
}

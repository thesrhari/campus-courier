// src/types/task.ts
import { User } from "./user"; // Assuming User type is defined here

// Define structure for Stationery Items
export interface StationeryItem {
  _id?: string; // May not have ID from frontend form initially
  name: string;
  quantity: number;
}

// Define structure for Stationery Details
export interface StationeryTaskDetails {
  items: StationeryItem[];
  additionalInfo?: string;
}

// Define structure for Printout Details
export interface PrintoutTaskDetails {
  fileUrl?: string; // Optional for now, will be required with real upload
  fileName?: string;
  fileType?: string;
  pages?: number;
  color?: boolean;
  doubleSided?: boolean;
  additionalInfo?: string;
}

// Main Task type
export interface Task {
  _id: string;
  title?: string; // Optional now
  price: number;
  status: "Open" | "InProgress" | "Completed";
  postedBy: User | string;
  acceptedBy?: User | string | null;
  deliveryLocation: string; // Keep delivery location
  deadline?: string | null; // Keep deadline
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;

  // Category and specific details
  category: "Stationery" | "Printouts" | string; // Allow string for flexibility if new categories added
  stationeryDetails?: StationeryTaskDetails | null; // Optional based on category
  printoutDetails?: PrintoutTaskDetails | null; // Optional based on category

  // Removed: description, pickupLocation
}

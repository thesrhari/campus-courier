// src/types/forms.ts

export interface AuthFormData {
  /* ... unchanged ... */ name?: string;
  email: string;
  password?: string;
}

// --- Updated Task Form Data ---
export interface TaskFormData {
  category: "Stationery" | "Printouts" | ""; // Add category selection
  price: string | number;
  deliveryLocation: string;
  deadline: string | null;

  // Stationery specific fields (managed within the form component's state)
  stationeryItems?: { name: string; quantity: string | number }[]; // Quantity might be string from input
  stationeryInfo?: string;

  // Printout specific fields
  printoutFile?: File | null; // To hold the selected file object
  printoutFileName?: string; // Store filename separately for display/submission
  printoutFileType?: string; // Store MIME type
  printoutPages?: string | number;
  printoutColor?: boolean;
  printoutDoubleSided?: boolean;
  printoutInfo?: string;

  // Optional title (might be removed from form)
  title?: string;
}

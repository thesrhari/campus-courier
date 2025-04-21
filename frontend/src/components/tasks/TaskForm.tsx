"use client";
import React, { useState, FormEvent, ChangeEvent, useCallback } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import { TaskFormData } from "@/types/forms"; // Import updated type

interface TaskFormProps {
  onSubmit: (formData: any) => void;
  loading: boolean;
}

const STATIONERY_OPTIONS = [
  "Pen (Blue)",
  "Pen (Black)",
  "Pencil",
  "Eraser",
  "Sharpener",
  "Scale",
  "Notebook",
  "Record Book",
  "Assignment Book",
];

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, loading }) => {
  const [category, setCategory] = useState<TaskFormData["category"]>("");
  const [price, setPrice] = useState<string | number>("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deadline, setDeadline] = useState("");

  // --- Stationery State ---
  // Initialize with one item, ensuring quantity is a number for easier handling later
  const [stationeryItems, setStationeryItems] = useState<
    Array<{ name: string; quantity: number }>
  >([{ name: "", quantity: 1 }]);
  const [stationeryInfo, setStationeryInfo] = useState("");

  // --- Printout State --- (Keep as before)
  const [printoutFile, setPrintoutFile] = useState<File | null>(null);
  const [printoutFileName, setPrintoutFileName] = useState<string>("");
  const [printoutFileType, setPrintoutFileType] = useState<string>("");
  const [printoutPages, setPrintoutPages] = useState<string | number>("");
  const [printoutColor, setPrintoutColor] = useState<boolean>(false);
  const [printoutDoubleSided, setPrintoutDoubleSided] =
    useState<boolean>(false);
  const [printoutInfo, setPrintoutInfo] = useState("");

  // --- Handlers for Stationery Items ---
  const handleItemChange = (
    index: number,
    field: "name" | "quantity",
    value: string | number
  ) => {
    const updatedItems = [...stationeryItems];
    // Ensure quantity is stored as a number
    const newQuantity =
      field === "quantity" ? Number(value) || 0 : updatedItems[index].quantity; // Default to 0 if NaN
    const newName = field === "name" ? String(value) : updatedItems[index].name;

    updatedItems[index] = { name: newName, quantity: newQuantity };
    setStationeryItems(updatedItems);
  };

  const addItem = () => {
    setStationeryItems([...stationeryItems, { name: "", quantity: 1 }]); // Initialize new item correctly
  };

  const removeItem = (index: number) => {
    if (stationeryItems.length > 1) {
      const updatedItems = stationeryItems.filter((_, i) => i !== index);
      setStationeryItems(updatedItems);
    }
  };
  // --- End Stationery Handlers ---

  // --- File Input Handler (Keep as before) ---
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    /* ... unchanged ... */
    const file = event.target.files?.[0];
    if (file) {
      setPrintoutFile(file);
      setPrintoutFileName(file.name);
      setPrintoutFileType(file.type);
      console.log("File selected:", file.name, file.type);
      alert(
        "File selected. NOTE: Actual file upload is not implemented in this demo."
      );
    } else {
      setPrintoutFile(null);
      setPrintoutFileName("");
      setPrintoutFileType("");
    }
  };
  // --- End File Handler ---

  // --- Form Submission ---
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!category) {
      alert("Please select a task category.");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }
    if (!deliveryLocation.trim()) {
      alert("Please enter a delivery location.");
      return;
    }

    let taskDetails: any = {};
    let isValid = true;

    if (category === "Stationery") {
      console.log("--- Submitting Stationery ---"); // DEBUG
      console.log(
        "Raw stationeryItems state:",
        JSON.stringify(stationeryItems)
      ); // DEBUG

      // Filter for items that have a non-empty name AND a quantity greater than 0
      const validItems = stationeryItems
        .map((item) => ({
          name: item.name?.trim(), // Trim name
          quantity: Number(item.quantity) || 0, // Ensure quantity is number, default 0 if NaN
        }))
        .filter((item) => item.name && item.quantity > 0); // Check for trimmed name and positive quantity

      console.log("Filtered validItems:", JSON.stringify(validItems)); // DEBUG

      if (validItems.length === 0) {
        alert(
          "Please add at least one valid stationery item with a name and a quantity greater than 0."
        ); // More specific message
        isValid = false;
      }
      taskDetails = {
        category,
        price: Number(price),
        deliveryLocation: deliveryLocation.trim(),
        deadline: deadline || null,
        stationeryDetails: {
          items: validItems, // Send only valid items
          additionalInfo: stationeryInfo.trim(),
        },
      };
    } else if (category === "Printouts") {
      // Keep Printout logic as before
      if (!printoutFileName) {
        alert("Please select a file for printing.");
        isValid = false;
      }
      taskDetails = {
        category,
        price: Number(price),
        deliveryLocation: deliveryLocation.trim(),
        deadline: deadline || null,
        printoutDetails: {
          fileUrl: null,
          fileName: printoutFileName,
          fileType: printoutFileType,
          pages: printoutPages ? Number(printoutPages) : null,
          color: printoutColor,
          doubleSided: printoutDoubleSided,
          additionalInfo: printoutInfo.trim(),
        },
      };
    }

    if (isValid) {
      console.log("Submitting Task Details to Parent:", taskDetails); // DEBUG
      onSubmit(taskDetails);
    }
  };
  // --- End Form Submission ---

  return (
    // --- JSX Structure (Keep largely the same, ensure input types/values match state) ---
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
    >
      {/* Category Selection */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-1">
          Task Category*
        </label>
        <select
          id="category"
          name="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as TaskFormData["category"])
          }
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
        >
          <option value="" disabled>
            -- Select a Category --
          </option>
          <option value="Stationery">Stationery Request</option>
          <option value="Printouts">Printout Request</option>
        </select>
      </div>

      {/* Stationery Fields */}
      {category === "Stationery" && (
        <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md p-4 space-y-4">
          <legend className="text-sm font-medium px-1 text-gray-600 dark:text-gray-400">
            Stationery Details
          </legend>
          {stationeryItems.map((item, index) => (
            <div key={index} className="flex items-end space-x-2">
              <div className="flex-grow">
                <label
                  htmlFor={`item-name-${index}`}
                  className="block text-xs font-medium mb-1"
                >
                  Item Name*
                </label>
                <input
                  list={`stationery-options-${index}`}
                  id={`item-name-${index}`}
                  name={`item-name-${index}`}
                  type="text"
                  value={item.name}
                  // Pass string value to handler
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  // Required might be too strict here if allowing removal, validation done in submit
                  // required
                  placeholder="e.g., Pen, Notebook"
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-black dark:text-white"
                />
                <datalist id={`stationery-options-${index}`}>
                  {STATIONERY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </div>
              <div className="w-20">
                <label
                  htmlFor={`item-quantity-${index}`}
                  className="block text-xs font-medium mb-1"
                >
                  Quantity*
                </label>
                <input
                  id={`item-quantity-${index}`}
                  name={`item-quantity-${index}`}
                  type="number"
                  // Use item.quantity (which is number) for value, pass string to handler
                  value={item.quantity <= 0 ? "" : item.quantity} // Show empty if quantity is 0 or less
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  required
                  min="1" // Browser validation for minimum 1
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-black dark:text-white"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={stationeryItems.length <= 1}
                className="px-2 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove Item"
              >
                {" "}
                X{" "}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Another Item
          </button>
          <div>
            <label
              htmlFor="stationeryInfo"
              className="block text-sm font-medium mb-1"
            >
              Additional Info (Optional)
            </label>
            <textarea
              id="stationeryInfo"
              name="stationeryInfo"
              rows={2}
              value={stationeryInfo}
              onChange={(e) => setStationeryInfo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="e.g., Specific brand, color preference, no. of pages..."
            />
          </div>
        </fieldset>
      )}

      {/* Printout Fields */}
      {category === "Printouts" && (
        <fieldset className="border border-gray-300 dark:border-gray-600 rounded-md p-4 space-y-4">
          {" "}
          <legend className="text-sm font-medium px-1 text-gray-600 dark:text-gray-400">
            Printout Details
          </legend>{" "}
          <div>
            {" "}
            <label
              htmlFor="printoutFile"
              className="block text-sm font-medium mb-1"
            >
              File Upload*
            </label>{" "}
            <input
              id="printoutFile"
              name="printoutFile"
              type="file"
              onChange={handleFileChange}
              required={!printoutFileName}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 cursor-pointer"
            />{" "}
            {printoutFileName && (
              <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                Selected: {printoutFileName}
              </p>
            )}{" "}
            <p className="text-xs mt-1 text-orange-600 dark:text-orange-400">
              Note: File upload is simulated. Submit task after selecting.
            </p>{" "}
          </div>{" "}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {" "}
            <div>
              {" "}
              <label
                htmlFor="printoutPages"
                className="block text-xs font-medium mb-1"
              >
                No. of Pages (Approx)
              </label>{" "}
              <input
                type="number"
                id="printoutPages"
                name="printoutPages"
                min="1"
                value={printoutPages}
                onChange={(e) => setPrintoutPages(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-black dark:text-white"
              />{" "}
            </div>{" "}
            <div className="flex items-center space-x-4 pt-4">
              {" "}
              <div className="flex items-center">
                {" "}
                <input
                  type="checkbox"
                  id="printoutColor"
                  name="printoutColor"
                  checked={printoutColor}
                  onChange={(e) => setPrintoutColor(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />{" "}
                <label htmlFor="printoutColor" className="ml-2 block text-sm">
                  Color Print
                </label>{" "}
              </div>{" "}
              <div className="flex items-center">
                {" "}
                <input
                  type="checkbox"
                  id="printoutDoubleSided"
                  name="printoutDoubleSided"
                  checked={printoutDoubleSided}
                  onChange={(e) => setPrintoutDoubleSided(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />{" "}
                <label
                  htmlFor="printoutDoubleSided"
                  className="ml-2 block text-sm"
                >
                  Double-Sided
                </label>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <label
              htmlFor="printoutInfo"
              className="block text-sm font-medium mb-1"
            >
              Additional Info (Optional)
            </label>{" "}
            <textarea
              id="printoutInfo"
              name="printoutInfo"
              rows={2}
              value={printoutInfo}
              onChange={(e) => setPrintoutInfo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="e.g., Specific pages to print, binding instructions..."
            />{" "}
          </div>{" "}
        </fieldset>
      )}

      {/* Common Fields */}
      {category && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {" "}
          <div>
            {" "}
            <label htmlFor="price" className="block text-sm font-medium mb-1">
              Offered Price (₹)*
            </label>{" "}
            <input
              type="number"
              name="price"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0.01"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="e.g., 50.00"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label
              htmlFor="deliveryLocation"
              className="block text-sm font-medium mb-1"
            >
              Delivery Location*
            </label>{" "}
            <input
              type="text"
              name="deliveryLocation"
              id="deliveryLocation"
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
              placeholder="e.g., Hostel Block C, Room 101"
            />{" "}
          </div>{" "}
          <div>
            {" "}
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
            >
              Deadline (Optional)
            </label>{" "}
            <input
              type="date"
              name="deadline"
              id="deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white dark:[color-scheme:dark]"
            />{" "}
          </div>{" "}
        </div>
      )}

      {/* Submit Button */}
      {category && (
        <div>
          {" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {" "}
            {loading ? <LoadingSpinner /> : "Post Task"}{" "}
          </button>{" "}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            * Required field
          </p>{" "}
        </div>
      )}
    </form>
  );
};

export default TaskForm;

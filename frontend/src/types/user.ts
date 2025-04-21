export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string; // Optional fields based on backend response
}

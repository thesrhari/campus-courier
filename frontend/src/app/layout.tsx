import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider"; // Import AuthProvider

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Campus Courier System",
  description: "Post and complete tasks on campus",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Wrap the entire application with AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

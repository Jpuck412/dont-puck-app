import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dont Puck App",
  description: "Describe it. Build it. No credits, no excuses.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-bg text-base-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

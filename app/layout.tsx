import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { WorkoutProvider } from "@/context/workout-context";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "GetFit by Darsh | AI Meal Analyzer & Workouts",
  description:
    "Track your calories with AI-powered meal analysis and browse exercises by muscle group. Your complete fitness companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <WorkoutProvider>
          <Navbar />
          {children}
          <Toaster richColors position="bottom-right" />
        </WorkoutProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inria_Serif, Inter } from "next/font/google";
import { AuthProvider } from "@/features/auth/store/AuthContext";
import "./globals.css";

const inriaSerif = Inria_Serif({
  variable: "--font-inria-serif",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notes Taker App",
  description: "A notes-taking app with categorized notes, JWT-authenticated accounts, and autosaving inline editing.",
  applicationName: "Notes Taker App",
  keywords: ["notes", "notes app", "note taking", "task organizer", "productivity"],
  openGraph: {
    title: "Notes Taker App",
    description: "A notes-taking app with categorized notes, JWT-authenticated accounts, and autosaving inline editing.",
    siteName: "Notes Taker App",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inriaSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

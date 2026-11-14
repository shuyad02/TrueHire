import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TrueHire — College se Career tak, Ek Hi Platform",
  description: "India's first verified job training and hiring platform for students. Get hired with verified companies, learn in-demand skills, and build your career the right way.",
  keywords: "jobs india, student jobs, fresher jobs, verified jobs, online courses, skill training, campus hiring, TrueHire",
  openGraph: {
    title: "TrueHire — Get Hired, Not Ghosted",
    description: "India's first verified job + skill training platform for college students",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #1e293b',
              borderRadius: '0.75rem',
            },
          }}
        />
      </body>
    </html>
  );
}

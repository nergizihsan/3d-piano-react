import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner'
import { PianoErrorBoundary } from "@/components/error-boundary"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3d Piano React",
  description: "A 3D Piano React App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <PianoErrorBoundary>
          {children}
          <Toaster 
            position="bottom-right"
            theme="dark"
            toastOptions={{
              style: {
                background: '#2563eb', // Tailwind blue-600
                color: 'white',
                fontWeight: '600',
                border: 'none',
              }
            }}
          />
        </PianoErrorBoundary>
      </body>
    </html>
  );
}

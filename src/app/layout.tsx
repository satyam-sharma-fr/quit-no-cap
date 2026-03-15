import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { InstallPrompt } from "@/components/install-prompt";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: "Quit No Cap",
  description: "Hold each other accountable. No cap.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0C0C0E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable} antialiased`}>
        <AuthProvider>
          <InstallPrompt />
          {children}
          <Navbar />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#151518",
                border: "0.5px solid rgba(255,255,255,0.06)",
                color: "#E8E6E1",
                fontFamily: "var(--font-sans)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

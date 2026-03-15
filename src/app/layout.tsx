import type { Metadata, Viewport } from "next";
import { Urbanist, Fira_Code } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { InstallPrompt } from "@/components/install-prompt";
import { Toaster } from "@/components/ui/sonner";

const urbanist = Urbanist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
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
  themeColor: "#0A0A0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${urbanist.variable} ${firaCode.variable} antialiased`}>
        <AuthProvider>
          <InstallPrompt />
          {children}
          <Navbar />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(20px)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "#F0EDE6",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

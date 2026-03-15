import type { Metadata, Viewport } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { InstallPrompt } from "@/components/install-prompt";
import { Toaster } from "@/components/ui/sonner";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${sora.variable} ${jetbrainsMono.variable} antialiased grain`}
      >
        <AuthProvider>
          <InstallPrompt />
          {children}
          <Navbar />
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1c1c1e",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#fafafa",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

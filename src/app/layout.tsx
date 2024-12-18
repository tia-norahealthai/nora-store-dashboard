import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from 'sonner'
import { AuthProvider } from '@/components/providers/supabase-auth-provider'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { ThemeScript } from "@/lib/theme-script"
import { AppSidebar } from "@/components/app-sidebar"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Nora Store Dashboard",
  description: "Nora Store Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qoe4nom.css" />
        <ThemeScript />
      </head>
      <body className={`antialiased ${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <SonnerToaster />
      </body>
    </html>
  );
}

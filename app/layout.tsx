// app/layout.tsx
import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import Head from "next/head";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react"; // Directly use SessionProvider here
import { AuthProvider } from "@/next-auth/auth-provider"; // Use your custom AuthProvider
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChannelChat - AI chat for every YouTube channel",
  description: "Empower YouTube creators and their communities with AI-powered chatbots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#5bbad5" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body className={`${inter.className} animate-spin-slow`}>
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false} refetchWhenOffline={false}> {/* Wrap with SessionProvider */}
          <AuthProvider> {/* Use AuthProvider for additional session management without fetching the session */}
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
              {children}
            </ThemeProvider>
            <Toaster richColors />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
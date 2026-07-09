import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PLATFORM: Learn AI. Earn more.",
    template: "%s | PLATFORM",
  },
  description:
    "Master ChatGPT and modern AI tools in 10 minutes a day. Practical skills for work, business and side income. Made for Kenya.",
  applicationName: "PLATFORM",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PLATFORM",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
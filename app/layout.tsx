// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Ysabeau } from "next/font/google";
import "./globals.css";
import Providers from "@/component/Providers";
import { cn } from "@/lib/utils";

// const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const ysabeau = Ysabeau({
  subsets: ["latin"],
  variable: "--font-ysabeau-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luring Invite | Luxury Invitations",
    template: "%s | Luring Invite",
  },
  description:
    "Discover elegant, personalized invitations for weddings, anniversaries, birthdays, and every special occasion.",
  applicationName: "Luring Invite",
  keywords: [
    "luxury invitations",
    "digital invitations",
    "wedding invitations",
    "anniversary invitations",
    "personalized invitations",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#a86dcd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("font-sans", ysabeau.variable)}>
      <body className="min-h-screen antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

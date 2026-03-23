import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSupportButton from "@/components/WhatsAppSupportButton";

export const metadata: Metadata = {
  title: "THE SUITE | Luxury Room Booking",
  description: "Experience luxury redefined. Premium rooms, world-class amenities, and an unforgettable stay.",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
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
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-dark text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <WhatsAppSupportButton />
        <Footer />
      </body>
    </html>
  );
}

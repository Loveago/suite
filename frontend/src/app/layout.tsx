import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppSupportButton from "@/components/WhatsAppSupportButton";

export const metadata: Metadata = {
  title: "THE SUITE | Luxury Room Booking",
  description: "Experience luxury redefined. Premium rooms, world-class amenities, and an unforgettable stay.",
  icons: {
    icon: "/the-suite-logo.jpg",
    apple: "/the-suite-logo.jpg",
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
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-18117150103"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18117150103');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-dark text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <WhatsAppSupportButton />
        <Footer />
      </body>
    </html>
  );
}

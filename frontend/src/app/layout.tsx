import type { Metadata, Viewport } from "next";
import "../styles/globals.css";
import { Providers } from "@/components/ui/Providers";
import { Header } from "@/components/navbar/Header";
import { MobileNav } from "@/components/navbar/MobileNav";
import { PwaRegister } from "@/components/ui/PwaRegister";
import { Footer } from "@/components/footer/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Royal Spice | Premium Restaurant Ordering",
    template: "%s | Royal Spice"
  },
  description:
    "Order premium Indian, fast food, drinks, and desserts from Royal Spice with Razorpay, UPI, COD, reservations, and live order tracking.",
  keywords: ["restaurant ordering", "food delivery", "Razorpay", "UPI", "Royal Spice", "table reservation"],
  applicationName: "Royal Spice",
  manifest: "/manifest.json",
  openGraph: {
    title: "Royal Spice Restaurant Ordering",
    description: "A premium mobile-first food ordering experience.",
    images: ["/og-card.svg"],
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#d8232a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <PwaRegister />
          <div className="min-h-screen pb-24 md:pb-0">
            <Header />
            {children}
            <Footer />
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  );
}

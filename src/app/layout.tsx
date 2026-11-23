import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

// Body text font
const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Headings, buttons, logo — the "road sign" font
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: site.fullName,
    template: `%s | ${site.name}`, // e.g. "Toyota Corolla | Yebbie"
  },
  description: "Quality cars for sale from Yebbie. Browse photos and videos, then call or WhatsApp us to buy.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser(); // only the admin can be logged in

  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans" suppressHydrationWarning>
        <Navbar isAdmin={user?.role === "ADMIN"} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

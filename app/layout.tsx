import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://forgetechsummit.com"),
  title: "ForgeTech Summit 2026 | Invitation-Only Summit in Nairobi",
  description:
    "ForgeTech Summit 2026 brings senior executives, founders, innovators, and technology leaders to Nairobi for an exclusive invitation-only day of strategic insight, collaboration, and frontier innovation.",
  icons: {
    icon: "/favicon.svg",
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
      className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
    >
      <body
        className="font-sans bg-black text-white selection:bg-white selection:text-black"
        suppressHydrationWarning
      >
        {children}
        <script
          id="luma-checkout"
          src="https://embed.lu.ma/checkout-button.js"
          async
        ></script>
      </body>
    </html>
  );
}

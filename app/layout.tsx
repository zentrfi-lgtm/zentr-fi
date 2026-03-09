import type { Metadata } from "next";
import { Inter, Kanit } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "./providers";
import { FF_FRAMES_V2 } from "@/src/lib/featureFlags";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zentrfi — Zentra Finance",
  description:
    "Web4 AI travel orchestration platform powered by an autonomous swarm of agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {FF_FRAMES_V2 && (
          <>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="/frames/book/image?step=search" />
            <meta property="fc:frame:input:text" content="Where to? (e.g. LAX to JFK)" />
            <meta property="fc:frame:button:1" content="Search Flights" />
            <meta property="fc:frame:post_url" content="/frames/book" />
          </>
        )}
      </head>
      <body
        className={`${kanit.variable} ${inter.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <script async src="https://assets.duffel.com/components/v1/duffel-payments.js"></script>
      </body>
    </html>
  );
}

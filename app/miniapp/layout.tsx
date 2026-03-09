import type { Metadata, Viewport } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentrfi.com";

export const metadata: Metadata = {
  title: "Zentrfi — Book Flights",
  description: "Search and book flights on Base, powered by Zentrfi",
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${appUrl}/miniapp-preview.png`,
      button: {
        title: "Book Flight",
        action: {
          type: "launch_frame",
          name: "Zentrfi Travel",
          url: `${appUrl}/miniapp`,
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#0000fe",
        },
      },
    }),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white">
      {children}
    </div>
  );
}

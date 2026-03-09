"use client";

import "@rainbow-me/rainbowkit/styles.css";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { RainbowKitProvider, getDefaultConfig, lightTheme } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/miniapp-wagmi-connector";

function getWalletConnectProjectId(): string {
  // `next.config.ts` maps VITE_WALLETCONNECT_PROJECT_ID -> NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
  // Fallback to the project ID provided in the build prompt to avoid noisy 403s in dev
  // when env vars aren't set yet.
  return (
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    "5261912a5c184ed019675c830f491d1a"
  );
}

const config = getDefaultConfig({
  appName: "Zentrfi — Zentra Finance",
  projectId: getWalletConnectProjectId(),
  chains: [base, baseSepolia],
  ssr: true,
});

const miniAppConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  connectors: [farcasterFrame()],
});

const queryClient = new QueryClient();

function useIsMiniApp(): boolean {
  const [isMiniApp, setIsMiniApp] = React.useState(false);
  React.useEffect(() => {
    setIsMiniApp(
      typeof window !== "undefined" &&
        window.location.pathname.startsWith("/miniapp"),
    );
  }, []);
  return isMiniApp;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const isMiniApp = useIsMiniApp();
  const activeConfig = isMiniApp ? miniAppConfig : config;

  return (
    <WagmiProvider config={activeConfig}>
      <QueryClientProvider client={queryClient}>
        {isMiniApp ? (
          children
        ) : (
          <RainbowKitProvider
            theme={lightTheme({
              accentColor: "#0000fe",
              accentColorForeground: "#ffffff",
              borderRadius: "large",
              overlayBlur: "small",
            })}
          >
            {children}
          </RainbowKitProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


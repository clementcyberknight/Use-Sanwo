"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import { embeddedWallet } from "@civic/auth-web3/wagmi";

// 1) Build your Wagmi config and QueryClient **inside** a client component
const queryClient = new QueryClient();
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http() },
  connectors: [embeddedWallet()],
});

export function Providers({ children }: { children: React.ReactNode }) {
  const civicClientId = process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID!;
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider clientId={civicClientId}>
          {children}
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

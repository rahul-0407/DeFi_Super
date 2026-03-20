"use client";

import React, { ReactNode, useEffect, useState } from "react";

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";

import { WagmiProvider } from "wagmi";

import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  foundry
} from "wagmi/chains";

import { http } from "wagmi";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@rainbow-me/rainbowkit/styles.css";

// RainbowKit + Wagmi configuration
const config = getDefaultConfig({
  appName: "DeFi Super App",
  projectId: "a42354fe323a59f0aac50f9268fb301e",
  chains: [foundry, sepolia, mainnet, polygon, optimism, arbitrum, base],
  transports: {
    [foundry.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },

  ssr: true,
});

// React Query client
const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6366f1",
            accentColorForeground: "white",
            borderRadius: "large",
          })}
        >
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
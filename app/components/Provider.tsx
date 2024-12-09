"use client"

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config";


const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
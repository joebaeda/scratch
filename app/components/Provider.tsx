"use client"

import { WagmiProvider } from "wagmi";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config";


const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <AuthKitProvider config={{ rpcUrl: "https://10.rpc.thirdweb.com", relay: "https://relay.farcaster.xyz", domain: "scratchnism.vercel.app",}}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AuthKitProvider>
    </WagmiProvider>
  );
}
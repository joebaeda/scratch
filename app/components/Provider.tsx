"use client"

import { WagmiProvider } from "wagmi";
import { AuthKitProvider } from "@farcaster/auth-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/config";
import { SessionProvider } from "next-auth/react";


const queryClient = new QueryClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Provider({ children, session }: { children: React.ReactNode; session?: any; }) {
  return (
    <WagmiProvider config={config}>
      <SessionProvider session={session}>
      <AuthKitProvider config={{ rpcUrl: "https://10.rpc.thirdweb.com", relay: "https://relay.farcaster.xyz", domain: "scratchnism.vercel.app",}}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AuthKitProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
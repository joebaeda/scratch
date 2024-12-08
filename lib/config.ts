import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";
import { frameConnector } from "./frameConnector";

export const config = createConfig({
  chains: [base],
  ssr: true,
  connectors: [
    coinbaseWallet({
      appName: "Scratch",
      appLogoUrl: "https://scratchnism.vercel.app/scratch.png",
      preference: "smartWalletOnly",
    }),
    frameConnector(),
  ],
  transports: {
    [base.id]: http(),
  },
})
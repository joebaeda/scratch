"use client"

import "@farcaster/auth-kit/styles.css";
import { useAccount, useConnect } from "wagmi";
import { config } from "@/lib/config";
import {
  SignInButton,
  useProfile
} from "@farcaster/auth-kit";
import Mint from "./components/Mint";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const { isAuthenticated, profile } = useProfile();

  return (
    <main className="bg-slate-500">
      {address ? isAuthenticated ? (
        <Mint username={profile.username as string} pfp={profile.pfpUrl as string} />
      ) : (
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-3xl text-white font-extrabold">Scratch.</h1>
          <SignInButton hideSignOut />
        </div>
      ) : (
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-3xl text-white font-extrabold">Scratch.</h1>
          <button
            className="bg-[#7c65c1] p-4 text-white font-bold rounded-xl"
            onClick={() => connect({ connector: config.connectors[1] })
            }
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>
        </div>
      )}
    </main>
  );
}

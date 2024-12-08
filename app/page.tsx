"use client"

import "@farcaster/auth-kit/styles.css";
import { useAccount, useBalance, useDisconnect } from "wagmi";
import {
  SignInButton,
  useProfile
} from "@farcaster/auth-kit";
import { sdk } from "@farcaster/frame-sdk";
import Mint from "./components/Mint";
import { truncateAddress } from "@/lib/truncateAddress";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { Wallet } from "./components/Wallet";

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const { address, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const balance = useBalance({ address })
  const [isConnectWalletOpen, setConnectWalletOpen] = useState(false);
  const [isAccountOpen, setAccountOpen] = useState(false);

  const { isAuthenticated, profile } = useProfile();

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <></>;
  }

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

          <button onClick={() => setConnectWalletOpen(true)} className="p-2 rounded-xl text-lg bg-purple-500 text-white font-bold">
            Connect Wallet
          </button>

          {/* Wallet Options Modal */}
          {isConnectWalletOpen && (
            <div className="fixed p-4 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#ede2ca] rounded-2xl p-6 w-full max-w-md shadow-lg">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl text-gray-700 font-semibold">Login</h2>
                  <button
                    onClick={() => setConnectWalletOpen(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Wallet Options */}
                <Wallet onConnect={() => setConnectWalletOpen(false)} />
              </div>
            </div>
          )}

          {/* Account Modal */}
          {isAccountOpen && address && (
            <div className="fixed p-4 inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#ede2ca] rounded-2xl p-6 w-full max-w-md shadow-lg">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl text-gray-700 font-semibold">Account: {truncateAddress(address)}</h2>
                  <button
                    onClick={() => setAccountOpen(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xl text-gray-700 mb-3 font-semibold">Network: {chain?.name}</p>
                <p className="text-xl text-gray-700 mb-4 font-semibold">Balance: {parseFloat(formatEther(balance.data?.value as bigint)).toFixed(3)} {balance.data?.symbol}</p>
                <button onClick={() => disconnect()}>
                  Disconnect
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </main>
  );
}

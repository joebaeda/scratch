"use client"

import sdk, { type FrameContext } from "@farcaster/frame-sdk";
import Mint from "./components/Mint";
import { useEffect, useState } from "react";
import { Redirect } from "./components/Redirect";
import { useAccount } from "wagmi";

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const { address } = useAccount();

  useEffect(() => {
    const load = async () => {
      const frameContext = await sdk.context;
      setContext(frameContext);
      await sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  useEffect(() => {
    if (address) {
      // Trigger Farcaster login automatically
      sdk.actions.addFrame();
    }
  }, [address]);

  if (!isSDKLoaded) {
    return <div></div>;
  }

  if (!context?.user.fid) {
    return (
      <Redirect />
    );
  }

  return (
    <main>
        <Mint username={context?.user.displayName as string} pfp={context?.user.pfpUrl as string} />
    </main>
  );
}


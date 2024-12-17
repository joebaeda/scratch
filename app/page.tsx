"use client"

import sdk, { FrameContext } from "@farcaster/frame-sdk";
import Mint from "./components/Mint";
import { useEffect, useState } from "react";
import { Redirect } from "./components/Redirect";
import Loading from "./components/Loading";


export default function Home() {

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();

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

  if (!isSDKLoaded) {
    return <Redirect />;
  }

  if (!context?.client.added) {
    return (
      <Loading />
    );
  }

  return (
    <main>
      <Mint username={context.user.username as string} pfp={context.user.pfpUrl as string} />
    </main>
  );
}


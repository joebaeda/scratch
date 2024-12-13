"use client"

import sdk, { FrameContext } from "@farcaster/frame-sdk";
import Mint from "./components/Mint";
import { useEffect, useState } from "react";
import { Redirect } from "./components/Redirect";
import { useAccount } from "wagmi";


export default function Home() {
  const { address } = useAccount();

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

  useEffect(() => {
    if (address) {
      const addFrames = async () => {

        try {
          const result = await sdk.actions.addFrame();
          if (result.added) {
            if (result.notificationDetails) {
              const notifyKey = {
                url: result.notificationDetails?.url,
                token: result.notificationDetails?.token,
              }
              localStorage.setItem("notifyKey", JSON.stringify(notifyKey));
            }
          }

        } catch (error) {
          console.log(error)
        }
      }
      addFrames()
    }
  }, [address])

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
      <Mint username={context.user.displayName as string} pfp={context.user.pfpUrl as string} />
    </main>
  );
}


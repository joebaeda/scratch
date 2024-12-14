"use client"

import sdk, { FrameContext, FrameNotificationDetails } from "@farcaster/frame-sdk";
import Mint from "./components/Mint";
import { useEffect, useState } from "react";
import { Redirect } from "./components/Redirect";
import { setUserNotificationDetails } from "@/lib/kv";


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

  useEffect(() => {
    const addFrame = async () => {
      try {
        const result = await sdk.actions.addFrame();
        if (result.added) {
          if (result.notificationDetails) {
            setUserNotificationDetails(context?.client.clientFid as number, context?.client.notificationDetails as FrameNotificationDetails)
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
    addFrame()
  }, [context])

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


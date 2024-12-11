"use client"

import sdk, { type FrameContext } from "@farcaster/frame-sdk";
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
      // Trigger Farcaster login automatically
      const addFrames = async () => {
        try {

          const result = await sdk.actions.addFrame();

          if (result.added) {
            localStorage.setItem("userToken", result.notificationDetails?.token as string)
            localStorage.setItem("notifyUrl", result.notificationDetails?.url as string)

            // Notify the user of add frame to their client
            await fetch("/api/notify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: result.notificationDetails?.token as string,
                title: "Welcome to Scratch of Art Frame!",
                body: "Mint your own Scratch and keep it in your wallet until maximum supply is reached. There will be a surprise later!",
                url: result.notificationDetails?.url as string,
                targetUrl: `https://scratchnism.vercel.app`,
              }),
            });

          }

        } catch (error) {
          console.log({ error: error })
        }
      }
      addFrames();
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
      <Mint username={context.user.username as string} pfp={context.user.pfpUrl as string} />
    </main>
  );
}


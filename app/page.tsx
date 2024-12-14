"use client"

import sdk, { FrameContext } from "@farcaster/frame-sdk";
import Mint from "./components/Mint";
import { useEffect, useState } from "react";
import { Redirect } from "./components/Redirect";


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

            const response = await fetch('/api/send-notify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fid: context?.client.clientFid,
                title: "Welcome to Scratch of Art Frame!",
                body: "Scratch of Art Frame is now added to your client",
                notificationDetails: context?.client.notificationDetails,
              }),
            })

            const data = await response.json()
            if (data.success) {
              console.log('Notification sent successfully!')
            } else {
              console.log('Failed to send notification: ' + JSON.stringify(data.error))
            }
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


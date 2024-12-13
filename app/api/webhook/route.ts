import {
    ParseWebhookEvent,
    parseWebhookEvent,
    verifyAppKeyWithNeynar,
  } from "@farcaster/frame-node";
  import { NextRequest } from "next/server";
  import { sendFrameNotification } from "@/lib/notify";
  
  export async function POST(request: NextRequest) {
    const requestJson = await request.json();
  
    let data;
    try {
      data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
    } catch (e: unknown) {
      const error = e as ParseWebhookEvent.ErrorType;
  
      switch (error.name) {
        case "VerifyJsonFarcasterSignature.InvalidDataError":
        case "VerifyJsonFarcasterSignature.InvalidEventDataError":
          // The request data is invalid
          return Response.json(
            { success: false, error: error.message },
            { status: 400 }
          );
        case "VerifyJsonFarcasterSignature.InvalidAppKeyError":
          // The app key is invalid
          return Response.json(
            { success: false, error: error.message },
            { status: 401 }
          );
        case "VerifyJsonFarcasterSignature.VerifyAppKeyError":
          // Internal error verifying the app key (caller may want to try again)
          return Response.json(
            { success: false, error: error.message },
            { status: 500 }
          );
      }
    }
    
    const event = data.event;
  
    switch (event.event) {
      case "frame_added":
        if (event.notificationDetails) {
          await sendFrameNotification({
            title: "Welcome to Scratch Of Art",
            body: "Scratch Of Art Frame is now added to your client",
          });
        } else {
          return;
        }
  
        break;
      case "notifications_enabled":
        await sendFrameNotification({
          title: "Ding ding ding",
          body: "Notifications are now enabled",
        });
  
        break;
    }
  
    return Response.json({ success: true });
  }
import { FrameNotificationDetails } from "@farcaster/frame-sdk";
import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export async function getUserNotificationDetails(
    fid: string
): Promise<FrameNotificationDetails | null> {
    return await redis.get<FrameNotificationDetails>(fid);
}

export async function setUserNotificationDetails(
    fid: string,
    notificationDetails: FrameNotificationDetails
): Promise<void> {
    await redis.set(fid, notificationDetails);
}

export async function deleteUserNotificationDetails(
    fid: string
): Promise<void> {
    await redis.del(fid);
}
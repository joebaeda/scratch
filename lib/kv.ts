import { Redis } from "@upstash/redis";

const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export const setUserNotificationDetails = async (
    fid: number,
    token: string,
) => {
    return redis.set(`tokens:fid:${fid}`, token);
};

export const getUserNotificationDetails = async (fid: number) => {
    return redis.get<string>(`tokens:fid:${fid}`);
};

export const deleteUserNotificationDetails = async (fid: number) => {
    return redis.del(`tokens:fid:${fid}`);
};
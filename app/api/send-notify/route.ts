import { notificationDetailsSchema } from "@farcaster/frame-sdk";
import { NextRequest } from "next/server";
import { z } from "zod";
import { setUserNotificationDetails } from "@/lib/kv";
import { sendFrameNotification } from "@/lib/notify";

const requestSchema = z.object({
    fid: z.number(),
    notificationDetails: notificationDetailsSchema,
    title: z.string(), // Adding title as parameter
    body: z.string(),  // Adding body as parameter
});

export async function POST(request: NextRequest) {
    const requestJson = await request.json();
    const requestBody = requestSchema.safeParse(requestJson);

    if (requestBody.success === false) {
        return Response.json(
            { success: false, errors: requestBody.error.errors },
            { status: 400 }
        );
    }

    await setUserNotificationDetails(
        requestBody.data.fid,
        requestBody.data.notificationDetails
    );

    const { title, body } = requestBody.data;

    const sendResult = await sendFrameNotification({
        fid: requestBody.data.fid,
        title,
        body,
    });

    if (sendResult.state === "error") {
        return Response.json(
            { success: false, error: sendResult.error },
            { status: 500 }
        );
    } else if (sendResult.state === "rate_limit") {
        return Response.json(
            { success: false, error: "Rate limited" },
            { status: 429 }
        );
    }

    return Response.json({ success: true });
}
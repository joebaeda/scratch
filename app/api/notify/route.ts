import { SendNotificationRequest, sendNotificationResponseSchema } from "@farcaster/frame-sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for validating incoming request payload
const requestSchema = z.object({
    token: z.string(), // Target device token
    url: z.string(), // Notification service endpoint
    targetUrl: z.string(), // URL for redirection when the notification is clicked
    title: z.string().optional(), // Optional custom title
    body: z.string().optional(), // Optional custom body
});

// POST API handler
export async function POST(request: NextRequest) {
    try {
        // Parse and validate request JSON payload
        const requestJson = await request.json();
        const requestBody = requestSchema.safeParse(requestJson);

        if (!requestBody.success) {
            return NextResponse.json(
                { success: false, errors: requestBody.error.errors },
                { status: 400 }
            );
        }

        const { title, body, targetUrl, token, url } = requestBody.data;

        // Prepare payload for notification service
        const notificationPayload: SendNotificationRequest = {
            notificationId: crypto.randomUUID(),
            title: title as string, // Default title if not provided
            body: body as string, // Default body if not provided
            targetUrl,
            tokens: [token],
        };

        // Send notification to the external service
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(notificationPayload),
        });

        const responseJson = await response.json();

        // Handle the response from the notification service
        if (response.ok) {
            // Validate response schema
            const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
            if (!responseBody.success) {
                return NextResponse.json(
                    { success: false, errors: responseBody.error.errors },
                    { status: 500 }
                );
            }

            // Check for rate-limited tokens
            if (responseBody.data.result.rateLimitedTokens.length) {
                return NextResponse.json(
                    { success: false, error: "Rate limited", rateLimitedTokens: responseBody.data.result.rateLimitedTokens },
                    { status: 429 }
                );
            }

            return NextResponse.json({ success: true });
        } else {
            // Handle non-200 response from the notification service
            return NextResponse.json(
                { success: false, error: responseJson },
                { status: response.status }
            );
        }
    } catch (error) {
        // Handle unexpected errors
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

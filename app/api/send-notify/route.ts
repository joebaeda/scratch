import { NextRequest } from "next/server";
import { z } from "zod";
import { sendFrameNotification } from "@/lib/notify";

// Define request validation schema
const requestSchema = z.object({
    title: z.string(), // Adding title as parameter
    body: z.string(),  // Adding body as parameter
});

export async function POST(request: NextRequest) {
    try {
        // Parse and validate the incoming request JSON
        const requestJson = await request.json();
        const requestBody = requestSchema.safeParse(requestJson);

        if (!requestBody.success) {
            return new Response(
                JSON.stringify({ success: false, errors: requestBody.error.errors }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { title, body } = requestBody.data;

        // Call the send notification function
        const sendResult = await sendFrameNotification({ title, body });

        // Handle the result of sending notification
        if (sendResult.state === "error") {
            return new Response(
                JSON.stringify({ success: false, error: sendResult.error }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        if (sendResult.state === "rate_limit") {
            return new Response(
                JSON.stringify({ success: false, error: "Rate limited" }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        // Catch and handle unexpected errors
        return new Response(
            JSON.stringify({ success: false, error: error }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}

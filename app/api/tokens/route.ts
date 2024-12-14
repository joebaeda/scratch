import { NextRequest, NextResponse } from "next/server";
import { setUserNotificationDetails } from "@/lib/kv";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fid, token } = body;

        if (!fid || !token) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        await setUserNotificationDetails(fid, token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error storing notification token:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
import {
    SendNotificationRequest,
    sendNotificationResponseSchema,
} from "@farcaster/frame-sdk";

interface INotifyKey {
    url: string;
    token: string;
}

type SendFrameNotificationResult =
    | { state: "error"; error: unknown }
    | { state: "no_token" }
    | { state: "rate_limit" }
    | { state: "success" };

export async function sendFrameNotification({
    title,
    body,
}: {
    title: string;
    body: string;
}): Promise<SendFrameNotificationResult> {
    // Retrieve notifyKey from localStorage
    const storedNotifyKey = localStorage.getItem("notifyKey");

    if (!storedNotifyKey) {
        return { state: "no_token" };
    }

    // Parse the notifyKey
    let notifyKey: INotifyKey;
    try {
        notifyKey = JSON.parse(storedNotifyKey) as INotifyKey;
    } catch (error) {
        return { state: "error", error: error };
    }

    if (!notifyKey.url || !notifyKey.token) {
        return { state: "no_token" };
    }

    try {
        // Send the notification
        const response = await fetch(notifyKey.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                notificationId: crypto.randomUUID(),
                title,
                body,
                targetUrl: "https://scratchnism.vercel.app",
                tokens: [notifyKey.token],
            } satisfies SendNotificationRequest),
        });

        const responseJson = await response.json();

        if (response.status === 200) {
            const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
            if (!responseBody.success) {
                return { state: "error", error: responseBody.error.errors };
            }

            if (responseBody.data.result.rateLimitedTokens.length) {
                return { state: "rate_limit" };
            }

            return { state: "success" };
        } else {
            return { state: "error", error: responseJson };
        }
    } catch (error) {
        return { state: "error", error };
    }
}

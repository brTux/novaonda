
/**
 * Meta Conversions API (CAPI) Utility
 * 
 * This utility allows sending events directly from the server to Meta's Graph API.
 * Reference: https://developers.facebook.com/docs/marketing-api/conversions-api/
 */

interface MetaUser {
    ip?: string;
    userAgent?: string;
    email?: string; // Hashed (SHA-256)
    phone?: string; // Hashed (SHA-256)
    fbc?: string;   // Facebook click ID
    fbp?: string;   // Facebook browser ID
}

interface MetaEvent {
    eventName: "PageView" | "Lead" | "InitiateCheckout" | "Purchase" | "ViewContent";
    eventTime?: number;
    user: MetaUser;
    customData?: Record<string, any>;
    eventSourceUrl?: string;
    pixelId?: string; // Optional override
}

export async function sendMetaEvent(event: MetaEvent) {
    const accessToken = process.env.META_ACCESS_TOKEN;
    const pixelId = event.pixelId || process.env.META_PIXEL_ID;

    if (!accessToken || !pixelId) {
        console.warn("[MetaCAPI] Missing META_ACCESS_TOKEN or pixelId. Skipping event.");
        return { success: false, error: "Missing configuration" };
    }

    const payload = {
        data: [{
            event_name: event.eventName,
            event_time: event.eventTime || Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: event.eventSourceUrl,
            user_data: {
                client_ip_address: event.user.ip,
                client_user_agent: event.user.userAgent,
                fbc: event.user.fbc,
                fbp: event.user.fbp,
                // Add more user data here (hashed) if available
            },
            custom_data: event.customData,
        }],
        // test_event_code: process.env.META_TEST_EVENT_CODE // Optional: for testing in Events Manager
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.error) {
            console.error("[MetaCAPI] API Error:", data.error);
            return { success: false, error: data.error };
        }

        return { success: true, count: data.events_received };
    } catch (err) {
        console.error("[MetaCAPI] Network Error:", err);
        return { success: false, error: err };
    }
}

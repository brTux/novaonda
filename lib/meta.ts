
/**
 * Meta Conversions API (CAPI) Utility
 * 
 * This utility allows sending events directly from the server to Meta's Graph API.
 * Reference: https://developers.facebook.com/docs/marketing-api/conversions-api/
 */

import crypto from 'crypto';

/**
 * Meta Conversions API (CAPI) Utility
 */

interface MetaUser {
    ip?: string | null;
    userAgent?: string | null;
    email?: string | null; // Will be hashed
    phone?: string | null; // Will be hashed
    fbc?: string | null;   // Facebook click ID
    fbp?: string | null;   // Facebook browser ID
}

interface MetaEvent {
    eventName: "PageView" | "Lead" | "InitiateCheckout" | "Purchase" | "ViewContent";
    eventTime?: number;
    user: MetaUser;
    customData?: Record<string, any>;
    eventSourceUrl?: string;
    pixelId?: string;
    accessToken?: string;
    testEventCode?: string | null;
}

function hashData(data: string | null | undefined): string | null {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

export async function sendMetaEvent(event: MetaEvent) {
    const accessToken = event.accessToken || process.env.META_ACCESS_TOKEN;
    const pixelId = event.pixelId || process.env.META_PIXEL_ID;

    if (!accessToken || !pixelId) {
        console.warn(`[MetaCAPI] Skip sending ${event.eventName}: Missing pixelId or accessToken`);
        return { success: false, error: "Missing configuration" };
    }

    const payload = {
        data: [{
            event_name: event.eventName,
            event_time: event.eventTime || Math.floor(Date.now() / 1000),
            action_source: "system_generated",
            event_source_url: event.eventSourceUrl,
            user_data: {
                client_ip_address: event.user.ip,
                client_user_agent: event.user.userAgent,
                fbc: event.user.fbc,
                fbp: event.user.fbp,
                em: event.user.email ? [hashData(event.user.email)] : undefined,
                ph: event.user.phone ? [hashData(event.user.phone)] : undefined,
            },
            custom_data: {
                ...event.customData,
                currency: event.customData?.currency || "BRL",
            },
        }],
        test_event_code: event.testEventCode || undefined,
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

        console.log(`[MetaCAPI] Event ${event.eventName} sent for pixel ${pixelId}`);
        return { success: true, count: data.events_received };
    } catch (err) {
        console.error("[MetaCAPI] Network Error:", err);
        return { success: false, error: err };
    }
}

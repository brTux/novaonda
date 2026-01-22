"use server";

import { prisma } from "@/lib/prisma";
import { sendMetaEvent } from "@/lib/meta";
import { headers } from "next/headers";

export async function trackCtaClick(data: {
    pressellId: string;
    trackingId?: string;
    utmSource?: string;
    utmCampaign?: string;
    pixelId?: string;
}) {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const userAgent = headerList.get("user-agent") || "";
    const referer = headerList.get("referer") || "";

    // 1. Trigger Meta CAPI Event (InitiateCheckout or Lead)
    if (data.pixelId) {
        // We bypass the env-based pixelId in sendMetaEvent if we want to support multiple pixels
        // But the current sendMetaEvent uses process.env.META_PIXEL_ID.
        // Let's assume for now we use the global one or we might need to update lib/meta.ts to accept pixelId.

        await sendMetaEvent({
            eventName: "InitiateCheckout",
            user: {
                ip,
                userAgent,
            },
            customData: {
                pressell_id: data.pressellId,
                utm_source: data.utmSource,
                utm_campaign: data.utmCampaign,
            },
            eventSourceUrl: referer,
        });
    }

    // 2. We could also log this specific click in the database if needed
    // For now, LeadTracking is created on page load. 
    // We might want to update the LeadTracking record to mark it as 'Converted'
    if (data.trackingId) {
        try {
            await prisma.leadTracking.update({
                where: { id: data.trackingId },
                data: {
                    // We could add a 'converted' field to LeadTracking schema later
                    // or just use this point to know a conversion happened.
                }
            });
        } catch (err) {
            console.error("[trackCtaClick] Database error:", err);
        }
    }

    return { success: true };
}

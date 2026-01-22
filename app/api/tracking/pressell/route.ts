import { prisma } from "@/lib/prisma";
import { getGeoByIp } from "@/lib/geo";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { utms, ip: providedIp } = await request.json();

        // Get IP from headers or body
        const headerIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
        const ip = providedIp || headerIp || "127.0.0.1";

        const geo = await getGeoByIp(ip);

        const tracking = await prisma.leadTracking.create({
            data: {
                ip,
                city: geo?.city,
                state: geo?.region,
                latitude: geo?.lat,
                longitude: geo?.lon,
                utmSource: utms?.utm_source,
                utmMedium: utms?.utm_medium,
                utmCampaign: utms?.utm_campaign,
                utmContent: utms?.utm_content,
                utmTerm: utms?.utm_term,
            }
        });

        return NextResponse.json({ trackingId: tracking.id });
    } catch (error) {
        console.error("[TrackingAPI] Error:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}

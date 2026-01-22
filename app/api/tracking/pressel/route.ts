import { prisma } from "@/lib/prisma";
import { getGeoByIp } from "@/lib/geo";
import { NextResponse } from "next/server";
import { sendMetaEvent } from "@/lib/meta";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    try {
        const { utms, ip: providedIp, pressellId } = await request.json();

        // Capture Meta cookies
        const cookieList = await cookies();
        const fbc = cookieList.get("_fbc")?.value;
        const fbp = cookieList.get("_fbp")?.value;

        // Get IP from headers or body
        const headerIp = request.headers.get("x-forwarded-for")?.split(",")[0].trim();
        const ip = providedIp || headerIp || "127.0.0.1";
        const userAgent = request.headers.get("user-agent") || "";

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
                fbc,
                fbp,
                pressellId
            },
            include: {
                pressell: {
                    include: { bot: true }
                }
            }
        });

        // Trigger Meta CAPI Event (Lead)
        if (tracking.pressell?.bot?.pixelId && tracking.pressell?.bot?.capiToken) {
            await sendMetaEvent({
                eventName: "Lead",
                pixelId: tracking.pressell.bot.pixelId,
                accessToken: tracking.pressell.bot.capiToken,
                testEventCode: tracking.pressell.bot.testEventCode,
                user: {
                    ip,
                    userAgent,
                    fbc,
                    fbp
                },
                customData: {
                    utm_source: utms?.utm_source,
                    utm_campaign: utms?.utm_campaign,
                },
                eventSourceUrl: request.headers.get("referer") || "",
            });
        }

        return NextResponse.json({ trackingId: tracking.id });
    } catch (error) {
        console.error("[TrackingAPI] Error:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}

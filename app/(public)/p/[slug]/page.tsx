import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PressellRenderer from "@/components/marketing/PressellRenderer";
import Script from "next/script";

export default async function PublicPressellPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const pressell = await prisma.pressell.findUnique({
        where: { slug },
        include: { bot: true }
    });

    if (!pressell) return notFound();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500/30">
            {/* Meta Pixel */}
            {pressell.pixelId && (
                <>
                    <Script id="fb-pixel" strategy="afterInteractive">
                        {`
                            !function(f,b,e,v,n,t,s)
                            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)}(window, document,'script',
                            'https://connect.facebook.net/en_US/fbevents.js');
                            fbq('init', '${pressell.pixelId}');
                            fbq('track', 'PageView');
                        `}
                    </Script>
                </>
            )}

            <PressellRenderer
                pressell={JSON.parse(JSON.stringify(pressell))}
            />
        </div>
    );
}

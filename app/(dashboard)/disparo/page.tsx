import React from "react";
import { getCampaigns } from "@/app/actions/campaigns";
import { getBots } from "@/app/actions/bots";
import { getFlows } from "@/app/actions/flows";
import { getTags } from "@/app/actions/tags";
import BroadcastDashboard from "@/components/disparo/BroadcastDashboard";

export default async function DisparoPage() {
    const [campaigns, bots, flows, tags] = await Promise.all([
        getCampaigns(),
        getBots(),
        getFlows(),
        getTags()
    ]);

    return (
        <BroadcastDashboard
            campaigns={JSON.parse(JSON.stringify(campaigns))}
            bots={JSON.parse(JSON.stringify(bots))}
            flows={JSON.parse(JSON.stringify(flows))}
            availableTags={JSON.parse(JSON.stringify(tags))}
        />
    );
}

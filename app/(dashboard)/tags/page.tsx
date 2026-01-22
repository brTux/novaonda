import React from "react";
import { getTags } from "@/app/actions/tags";
import { getBots } from "@/app/actions/bots";
import { TagsManager } from "@/components/tags/TagsManager";

export default async function TagsPage() {
    // Parallel fetch
    const [tags, bots] = await Promise.all([
        getTags(),
        getBots()
    ]);

    return (
        <div className="h-full overflow-hidden flex flex-col bg-[#f8fafc] animate-in fade-in duration-500">
            <div className="p-6 md:p-10 flex flex-col gap-1 shrink-0">
                <h1 className="text-2xl font-bold text-[#2d3339]">Gerenciamento de Etiquetas</h1>
                <p className="text-sm text-[#555d66] font-medium">Crie e organize tags para segmentar seus leads de forma inteligente.</p>
            </div>

            <div className="flex-1 overflow-hidden px-6 md:px-10 pb-10">
                <TagsManager initialTags={tags} bots={bots} />
            </div>
        </div>
    );
}

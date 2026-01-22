import React from "react";
import { getConversations } from "@/app/actions/chat";
import { ChatInterface } from "@/components/chat/ChatInterface";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export default async function ChatPage() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const conversations = await getConversations();
    const bots = await prisma.bot.findMany({
        where: { userId: session.user.id },
        select: { id: true, name: true }
    });
    const flows = await prisma.flow.findMany({
        where: { bot: { userId: session.user.id }, status: 'PUBLISHED' },
        select: { id: true, name: true, botId: true }
    });

    return (
        <ChatInterface
            initialConversations={conversations}
            bots={bots}
            flows={flows}
        />
    );
}

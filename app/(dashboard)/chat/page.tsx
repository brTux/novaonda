import React from "react";
import { getConversations } from "@/app/actions/chat";
import { ChatInterface } from "@/components/chat/ChatInterface";

export default async function ChatPage() {
    const conversations = await getConversations();

    return (
        <ChatInterface initialConversations={conversations} />
    );
}

'use server';

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import * as schema from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getFlows() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const flows = await db.query.flows.findMany({
        where: ((flows: any, { exists }: any) => exists(
            db.select().from(schema.bots)
                .where(and(
                    eq(schema.bots.id, flows.botId),
                    eq(schema.bots.userId, session.user!.id!)
                ))
        )) as any,
        with: {
            nodes: true,
            bot: true
        },
        orderBy: [desc(schema.flows.updatedAt)],
    });

    return flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
        status: flow.status,
        botId: flow.botId,
        botName: flow.bot.name,
        steps: flow.nodes.length,
        triggers: "Sem gatilho", // Keyword triggers not yet in schema?
        updatedAt: flow.updatedAt
    }));
}

export async function createFlow(name: string, botId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const flowResult = await db.insert(schema.flows).values({
            name,
            botId,
            status: "DRAFT",
            isDefault: false
        }).returning();

        const flowId = flowResult[0].id;

        // Create default trigger node
        await db.insert(schema.flowNodes).values({
            flowId,
            type: "TRIGGER",
            data: { trigger: "start" },
            positionX: 100,
            positionY: 100
        });

        revalidatePath("/fluxos");
        return { success: true, flowId };
    } catch (error) {
        console.error("Create Flow Error", error);
        return { error: "Failed to create flow" };
    }
}

export async function getFlowById(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const flow = await db.query.flows.findFirst({
        where: eq(schema.flows.id, id),
        with: {
            nodes: true,
            edges: true,
            bot: true
        }
    });

    if (!flow || flow.bot.userId !== session.user.id) return null;

    // Transform database format back to React Flow format
    return {
        id: flow.id,
        name: flow.name,
        status: flow.status,
        nodes: flow.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: { x: node.positionX, y: node.positionY },
            data: node.data as any
        })),
        edges: flow.edges.map((edge) => ({
            id: edge.id,
            source: edge.sourceNodeId,
            sourceHandle: edge.sourceHandle,
            target: edge.targetNodeId,
            targetHandle: edge.targetHandle,
            animated: true
        }))
    };
}

export async function saveFlow(id: string, nodes: any[], edges: any[], status?: "DRAFT" | "PUBLISHED") {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // Verify ownership
        const flow = await db.query.flows.findFirst({
            where: eq(schema.flows.id, id),
            with: { bot: true }
        });

        if (!flow || flow.bot.userId !== session.user.id) return { error: "Unauthorized" };

        // Transaction to update connection
        await db.transaction(async (tx) => {
            // 1. Delete existing nodes and edges (simplest strategy for now)
            await tx.delete(schema.flowEdges).where(eq(schema.flowEdges.flowId, id));
            await tx.delete(schema.flowNodes).where(eq(schema.flowNodes.flowId, id));

            // 2. Insert Nodes
            if (nodes.length > 0) {
                await tx.insert(schema.flowNodes).values(
                    nodes.map(node => ({
                        id: node.id,
                        flowId: id,
                        type: node.type,
                        positionX: node.position.x,
                        positionY: node.position.y,
                        data: node.data
                    }))
                );
            }

            // 3. Insert Edges
            if (edges.length > 0) {
                await tx.insert(schema.flowEdges).values(
                    edges.map(edge => ({
                        id: edge.id,
                        flowId: id,
                        sourceNodeId: edge.source,
                        sourceHandle: edge.sourceHandle,
                        targetNodeId: edge.target,
                        targetHandle: edge.targetHandle,
                    }))
                );
            }

            // 4. Update Flow metadata
            const updateData: any = { updatedAt: new Date() };
            if (status) updateData.status = status;

            await tx.update(schema.flows)
                .set(updateData)
                .where(eq(schema.flows.id, id));
        });

        revalidatePath(`/fluxos/${id}`);
        return { success: true };

    } catch (error) {
        console.error("Save Flow Error", error);
        return { error: "Failed to save flow" };
    }
}
export async function generateShareCode(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const flow = await db.query.flows.findFirst({
            where: eq(schema.flows.id, id),
            with: { bot: true }
        });

        if (!flow || flow.bot.userId !== session.user.id) return { error: "Unauthorized" };

        if (flow.shareCode) return { success: true, shareCode: flow.shareCode };

        const shareCode = crypto.randomUUID().slice(0, 8);
        await db.update(schema.flows)
            .set({ shareCode })
            .where(eq(schema.flows.id, id));

        return { success: true, shareCode };
    } catch (error) {
        console.error("Generate Share Code Error", error);
        return { error: "Failed to generate share code" };
    }
}

export async function getFlowByShareCode(shareCode: string) {
    const flow = await db.query.flows.findFirst({
        where: eq(schema.flows.shareCode, shareCode),
        with: {
            nodes: true,
            edges: true
        }
    });

    if (!flow) return null;

    return {
        name: flow.name,
        nodes: flow.nodes.map((node) => ({
            type: node.type,
            position: { x: node.positionX, y: node.positionY },
            data: node.data as any
        })),
        edges: flow.edges.map((edge) => ({
            source: edge.sourceNodeId,
            sourceHandle: edge.sourceHandle,
            target: edge.targetNodeId,
            targetHandle: edge.targetHandle
        }))
    };
}

export async function importFlow(botId: string, flowData: any) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const flowResult = await db.insert(schema.flows).values({
            name: `${flowData.name} (Importado)`,
            botId,
            status: "DRAFT",
            isDefault: false
        }).returning();

        const flowId = flowResult[0].id;
        const nodeMapping: Record<string, string> = {};

        // 1. Insert Nodes
        for (const node of flowData.nodes) {
            const [newNode] = await db.insert(schema.flowNodes).values({
                flowId,
                type: node.type,
                positionX: node.position.x,
                positionY: node.position.y,
                data: node.data
            }).returning();
            nodeMapping[node.id] = newNode.id;
        }

        // 2. Insert Edges
        if (flowData.edges && flowData.edges.length > 0) {
            await db.insert(schema.flowEdges).values(
                flowData.edges.map((edge: any) => ({
                    flowId,
                    sourceNodeId: nodeMapping[edge.source] || edge.source,
                    sourceHandle: edge.sourceHandle,
                    targetNodeId: nodeMapping[edge.target] || edge.target,
                    targetHandle: edge.targetHandle,
                }))
            );
        }

        revalidatePath("/fluxos");
        return { success: true, flowId };
    } catch (error) {
        console.error("Import Flow Error", error);
        return { error: "Failed to import flow" };
    }
}

export async function getFullFlowForExport(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const flow = await db.query.flows.findFirst({
        where: eq(schema.flows.id, id),
        with: {
            nodes: true,
            edges: true,
            bot: true
        }
    });

    if (!flow || flow.bot.userId !== session.user.id) return null;

    return {
        name: flow.name,
        nodes: flow.nodes.map((node) => ({
            id: node.id,
            type: node.type,
            position: { x: node.positionX, y: node.positionY },
            data: node.data as any
        })),
        edges: flow.edges.map((edge) => ({
            id: edge.id,
            source: edge.sourceNodeId,
            sourceHandle: edge.sourceHandle,
            target: edge.targetNodeId,
            targetHandle: edge.targetHandle
        }))
    };
}

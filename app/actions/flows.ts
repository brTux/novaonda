'use server';

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFlows() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const flows = await prisma.flow.findMany({
        where: {
            bot: {
                userId: session.user.id
            }
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            nodes: { select: { id: true } } // Just to count steps
        }
    });

    return flows.map((flow: any) => ({
        id: flow.id,
        name: flow.name,
        status: flow.status,
        steps: flow.nodes.length,
        triggers: flow.keyword || "Sem gatilho",
        updatedAt: flow.updatedAt
    }));
}

export async function createFlow(name: string, botId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const flow = await prisma.flow.create({
            data: {
                name,
                botId,
                status: "DRAFT",
                nodes: {
                    create: {
                        type: "TRIGGER",
                        data: JSON.stringify({ trigger: "start" }),
                        positionX: 100,
                        positionY: 100
                    }
                }
            }
        });
        revalidatePath("/fluxos");
        return { success: true, flowId: flow.id };
    } catch (error) {
        console.error("Create Flow Error", error);
        return { error: "Failed to create flow" };
    }
}

export async function getFlowById(id: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const flow = await prisma.flow.findUnique({
        where: { id },
        include: {
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
        nodes: flow.nodes.map((node: any) => ({
            id: node.id,
            type: node.type,
            position: { x: node.positionX, y: node.positionY },
            data: JSON.parse(node.data)
        })),
        edges: flow.edges.map((edge: any) => ({
            id: edge.id,
            source: edge.sourceId,
            target: edge.targetId,
            animated: true
        }))
    };
}

export async function saveFlow(id: string, nodes: any[], edges: any[]) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // Verify ownership
        const flow = await prisma.flow.findUnique({
            where: { id },
            include: { bot: true }
        });
        if (!flow || flow.bot.userId !== session.user.id) return { error: "Unauthorized" };

        // Transaction to update connection
        await prisma.$transaction(async (tx: any) => {
            // 1. Delete existing nodes and edges (simplest strategy for now)
            // Note: In a real prod app, upserting would be better to preserve history/metrics
            await tx.edge.deleteMany({ where: { flowId: id } });
            await tx.flowNode.deleteMany({ where: { flowId: id } });

            // 2. Insert Nodes
            for (const node of nodes) {
                await tx.flowNode.create({
                    data: {
                        id: node.id, // Keep the same ID from frontend
                        flowId: id,
                        type: node.type,
                        positionX: node.position.x,
                        positionY: node.position.y,
                        data: JSON.stringify(node.data)
                    }
                });
            }

            // 3. Insert Edges
            for (const edge of edges) {
                await tx.edge.create({
                    data: {
                        id: edge.id,
                        flowId: id,
                        sourceId: edge.source,
                        targetId: edge.target
                    }
                });
            }

            // 4. Update Flow timestamp
            await tx.flow.update({
                where: { id },
                data: { updatedAt: new Date() }
            });
        });

        revalidatePath(`/fluxos/${id}`);
        return { success: true };

    } catch (error) {
        console.error("Save Flow Error", error);
        return { error: "Failed to save flow" };
    }
}

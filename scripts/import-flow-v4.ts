import { db } from "../lib/db";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";

const JSON_PATH = "c:\\Users\\Brendon Freitas\\Downloads\\_fluxo_v4____ia___gp_temporario___proibido___importado_.json";

async function main() {
    console.log("🚀 Starting Flow Import...");

    if (!fs.existsSync(JSON_PATH)) {
        console.error("❌ JSON file not found at:", JSON_PATH);
        return;
    }

    const rawData = fs.readFileSync(JSON_PATH, "utf8");
    const externalFlow = JSON.parse(rawData);

    // 1. Get Bot
    const bot = await db.query.bots.findFirst();
    if (!bot) {
        console.error("❌ No bots found in database. Create a bot first.");
        return;
    }
    console.log(`🤖 Target Bot: ${bot.name} (${bot.id})`);

    // 2. Create Flow
    const flowResult = await db.insert(schema.flows).values({
        name: externalFlow.name,
        botId: bot.id,
        status: "PUBLISHED",
        isDefault: false,
        description: "Importado do arquivo V4"
    }).returning();

    const flowId = flowResult[0].id;
    console.log(`📝 Flow Created: ${externalFlow.name} (ID: ${flowId})`);

    const nodeMapping: Record<string, string[]> = {}; // ExternalID -> Array of Internal IDs (for composites)
    const externalNodes = externalFlow.structure.nodes;
    const externalEdges = externalFlow.structure.edges;

    // 3. Process Nodes
    for (const node of externalNodes) {
        if (node.type === "trigger") {
            const [newNode] = await db.insert(schema.flowNodes).values({
                flowId,
                type: "TRIGGER",
                positionX: node.position.x,
                positionY: node.position.y,
                data: {
                    trigger: node.data.value || "start",
                    triggerType: node.data.triggerType === "new_lead" ? "NEW_LEAD" : "KEYWORD"
                }
            }).returning();
            nodeMapping[node.id] = [newNode.id];
        }
        else if (node.type === "input") {
            const [newNode] = await db.insert(schema.flowNodes).values({
                flowId,
                type: "INPUT",
                positionX: node.position.x,
                positionY: node.position.y,
                data: {
                    prompt: node.data.prompt,
                    variable: node.data.saveAs || "input_" + Date.now(),
                    timeout: node.data.timeout || 60,
                    inputType: node.data.inputType || "text"
                }
            }).returning();
            nodeMapping[node.id] = [newNode.id];
        }
        else if (node.type === "composite") {
            const compositeInternalIds: string[] = [];
            const elements = node.data.elements || [];

            let lastNodeId: string | null = null;

            for (let i = 0; i < elements.length; i++) {
                const el = elements[i];
                let type: any = "MESSAGE";
                let data: any = {};

                if (el.type === "text") {
                    type = "MESSAGE";
                    data = { text: el.content };
                } else if (el.type === "delay") {
                    type = "DELAY";
                    data = {
                        delay: el.duration,
                        showTyping: el.showTyping
                    };
                } else if (el.type === "audio") {
                    type = "AUDIO";
                    data = { url: el.url, caption: el.caption };
                } else if (el.type === "video") {
                    type = "VIDEO";
                    data = { url: el.url, caption: el.caption };
                } else if (el.type === "image" || el.type === "view_once_media") {
                    type = "IMAGE";
                    data = { url: el.url, caption: el.caption };
                } else if (el.type === "pix") {
                    type = "ACTION";
                    data = {
                        subType: "PIX",
                        amount: el.amount / 100, // External is cents? No, looking at 1999 for 19.99
                        description: el.description,
                        paidTag: el.tag
                    };
                }

                // Add node
                const [newNode] = await db.insert(schema.flowNodes).values({
                    flowId,
                    type,
                    positionX: node.position.x,
                    positionY: node.position.y + (i * 100), // Stack them visually
                    data
                }).returning();

                compositeInternalIds.push(newNode.id);

                // Connect to previous element in composite
                if (lastNodeId) {
                    await db.insert(schema.flowEdges).values({
                        flowId,
                        sourceNodeId: lastNodeId,
                        targetNodeId: newNode.id
                    });
                }
                lastNodeId = newNode.id;
            }

            nodeMapping[node.id] = compositeInternalIds;
        }
    }

    console.log(`✅ Processed ${Object.keys(nodeMapping).length} base nodes.`);

    // 4. Process Edges
    let edgeCount = 0;
    for (const edge of externalEdges) {
        const sourceIds = nodeMapping[edge.source];
        const targetIds = nodeMapping[edge.target];

        if (!sourceIds || !targetIds) {
            console.warn(`⚠️ Skipping edge: ${edge.source} -> ${edge.target} (Missing mapping)`);
            continue;
        }

        const internalSourceId = sourceIds[sourceIds.length - 1]; // Exit from last element
        const internalTargetId = targetIds[0]; // Enter at first element

        let sourceHandle = edge.sourceHandle;
        if (sourceHandle === "next") sourceHandle = "success";
        if (sourceHandle === "no-response") sourceHandle = "timeout";

        await db.insert(schema.flowEdges).values({
            flowId,
            sourceNodeId: internalSourceId,
            targetNodeId: internalTargetId,
            sourceHandle: sourceHandle || null
        });
        edgeCount++;
    }

    console.log(`✅ Created ${edgeCount} edges.`);
    console.log("✨ Import finished successfully!");
}

main().catch(error => {
    console.error("❌ Fatal Error:", error);
    process.exit(1);
});

import fs from "fs";
import path from "path";

const INPUT_PATH = "c:\\Users\\Brendon Freitas\\Downloads\\_fluxo_v4____ia___gp_temporario___proibido___importado_.json";
const OUTPUT_PATH = "c:\\Users\\Brendon Freitas\\Nova onda\\isyflow_converted.json";

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function main() {
    if (!fs.existsSync(INPUT_PATH)) {
        console.error("❌ Input file not found");
        return;
    }

    const rawData = fs.readFileSync(INPUT_PATH, "utf8");
    const externalFlow = JSON.parse(rawData);

    const isyNodes: any[] = [];
    const isyEdges: any[] = [];
    const nodeMapping: Record<string, string[]> = {};

    const externalNodes = externalFlow.structure.nodes;
    const externalEdges = externalFlow.structure.edges;

    // 1. Process Nodes
    for (const node of externalNodes) {
        if (node.type === "trigger") {
            const newNodeId = generateUUID();
            isyNodes.push({
                id: newNodeId,
                type: "TRIGGER",
                position: node.position,
                data: {
                    trigger: node.data.value || "start",
                    triggerType: node.data.triggerType === "new_lead" ? "NEW_LEAD" : "KEYWORD"
                }
            });
            nodeMapping[node.id] = [newNodeId];
        }
        else if (node.type === "input") {
            const newNodeId = generateUUID();
            isyNodes.push({
                id: newNodeId,
                type: "INPUT",
                position: node.position,
                data: {
                    prompt: node.data.prompt,
                    variable: node.data.saveAs || "input_" + Date.now(),
                    timeout: node.data.timeout || 60,
                    inputType: node.data.inputType || "text"
                }
            });
            nodeMapping[node.id] = [newNodeId];
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
                        amount: el.amount / 100,
                        description: el.description,
                        paidTag: el.tag
                    };
                }

                const newNodeId = generateUUID();
                isyNodes.push({
                    id: newNodeId,
                    type,
                    position: {
                        x: node.position.x,
                        y: node.position.y + (i * 150) // Adjust vertical spread
                    },
                    data
                });

                compositeInternalIds.push(newNodeId);

                if (lastNodeId) {
                    isyEdges.push({
                        id: generateUUID(),
                        source: lastNodeId,
                        target: newNodeId,
                        animated: true
                    });
                }
                lastNodeId = newNodeId;
            }

            nodeMapping[node.id] = compositeInternalIds;
        }
    }

    // 2. Process Edges
    for (const edge of externalEdges) {
        const sourceIds = nodeMapping[edge.source];
        const targetIds = nodeMapping[edge.target];

        if (!sourceIds || !targetIds) continue;

        const internalSourceId = sourceIds[sourceIds.length - 1];
        const internalTargetId = targetIds[0];

        let sourceHandle = edge.sourceHandle;
        if (sourceHandle === "next") sourceHandle = "success";
        if (sourceHandle === "no-response") sourceHandle = "timeout";

        isyEdges.push({
            id: generateUUID(),
            source: internalSourceId,
            sourceHandle: sourceHandle || null,
            target: internalTargetId,
            targetHandle: null,
            animated: true
        });
    }

    const output = {
        name: externalFlow.name,
        nodes: isyNodes,
        edges: isyEdges
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log("✅ Conversion finished! File saved at:", OUTPUT_PATH);
}

main();

import "dotenv/config";
import { broadcastWorker } from "../lib/worker";

console.log("🚀 Isy Flow Worker is starting...");

broadcastWorker.on("ready", () => {
    console.log("✅ Worker is ready and waiting for jobs.");
});

// Keep process alive
process.on("SIGINT", async () => {
    console.log("Shutting down worker...");
    await broadcastWorker.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down worker...");
    await broadcastWorker.close();
    process.exit(0);
});

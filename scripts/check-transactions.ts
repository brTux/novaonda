import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const transactions = await prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { conversation: true }
    });

    console.log('--- RECENT TRANSACTIONS ---');
    transactions.forEach(t => {
        console.log(`ID: ${t.id}`);
        console.log(`ExternalID: ${t.externalId}`);
        console.log(`Status: ${t.status}`);
        console.log(`Amount: ${t.amount}`);
        console.log(`Created: ${t.createdAt}`);
        console.log(`Bot: ${t.conversation.botId}`);
        console.log('---------------------------');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());

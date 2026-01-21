const path = require('path');
// Attempt to require @prisma/client from the project root node_modules
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
const { PrismaClient } = require(prismaClientPath);
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@isyflow.com';
    const password = 'admin'; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                name: 'Admin Isy Flow',
                password: hashedPassword,
                plan: 'ENTERPRISE',
                emailVerified: new Date(),
            },
        });

        console.log('Admin user created/updated:', user.email);
    } catch (e) {
        console.error('Error creating user:', e);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

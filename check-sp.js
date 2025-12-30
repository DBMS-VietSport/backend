const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const courtId = 1;
    const date = '2025-01-01'; // Use a future date or today

    console.log(`Running sp_receptionist_get_booking_slots_of_court for court ${courtId} on ${date}...`);
    try {
        const result = await prisma.$queryRawUnsafe(`EXEC sp_receptionist_get_booking_slots_of_court @court_id = ${courtId}, @date = '${date}'`);
        console.log('Result:');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('Error:', err);
    }
}

main().finally(() => prisma.$disconnect());

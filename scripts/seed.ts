/**
 * Database seed script
 * Creates test user and sample data
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  console.log('✓ Created test user:', user.email);

  // Create sample call logs
  const calls = await Promise.all([
    prisma.callLog.create({
      data: {
        userId: user.id,
        phone: '+12345678901',
        strategy: 'twilio',
        status: 'completed',
        amdResult: 'human',
        confidence: 0.85,
        twilioSid: 'CA' + Math.random().toString(36).substring(2, 15),
        rawEvents: [
          {
            CallSid: 'CAtest1',
            CallStatus: 'completed',
            AnsweredBy: 'human',
          },
        ],
      },
    }),
    prisma.callLog.create({
      data: {
        userId: user.id,
        phone: '+12345678902',
        strategy: 'twilio',
        status: 'completed',
        amdResult: 'machine',
        confidence: 0.92,
        twilioSid: 'CA' + Math.random().toString(36).substring(2, 15),
        rawEvents: [
          {
            CallSid: 'CAtest2',
            CallStatus: 'completed',
            AnsweredBy: 'machine',
          },
        ],
      },
    }),
    prisma.callLog.create({
      data: {
        userId: user.id,
        phone: '+12345678903',
        strategy: 'huggingface',
        status: 'completed',
        amdResult: 'undecided',
        confidence: 0.45,
        twilioSid: 'CA' + Math.random().toString(36).substring(2, 15),
        rawEvents: [
          {
            CallSid: 'CAtest3',
            CallStatus: 'completed',
            AnsweredBy: 'unknown',
          },
        ],
      },
    }),
  ]);

  console.log(`✓ Created ${calls.length} sample call logs`);
  console.log('\nSeed data:');
  console.log('- Email: test@example.com');
  console.log('- Note: Sign in with Google OAuth through the app');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

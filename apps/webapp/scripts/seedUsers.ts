import { validate } from 'uuid';
import { prisma } from '@charmverse/core/prisma-client';
import { randomName } from '@packages/utils/randomName';
import { uid } from '@packages/utils/strings';

const demoUsers = [
 { username: 'Maria Garcia', email: 'maria.garcia@example.com' },
 { username: 'James Wilson', email: 'james.wilson@example.com' },
 { username: 'Priya Sharma', email: 'priya.sharma@example.com' },
 { username: 'Carlos Mendez', email: 'carlos.mendez@example.com' },
 { username: 'Aisha Johnson', email: 'aisha.johnson@example.com' },
 { username: 'Lucas Silva', email: 'lucas.silva@example.com' },
 { username: 'Fatima Al-Rashid', email: 'fatima.alrashid@example.com' },
 { username: 'David Kim', email: 'david.kim@example.com' },
 { username: 'Elena Petrova', email: 'elena.petrova@example.com' },
 { username: 'Ahmed Hassan', email: 'ahmed.hassan@example.com' }
];

export async function seedUsers({ spaceDomainOrId, amount }: { spaceDomainOrId: string; amount: number }) {
 const query = validate(spaceDomainOrId) ? { id: spaceDomainOrId } : { domain: spaceDomainOrId };

 const space = await prisma.space.findUnique({ where: query });

 if (!space) {
 throw new Error(`Space ${spaceDomainOrId} not found`);
 }

 await prisma.$transaction(async (tx) => {
 for (let i = 0; i < amount; i++) {
 const demoUser = demoUsers[i % demoUsers.length];
 await tx.user.create({
 data: {
 username: demoUser.username,
 email: demoUser.email,
 path: uid(),
 spaceRoles: {
 create: {
 space: {
 connect: {
 id: space.id
 }
 }
 }
 }
 }
 });
 }
 });
}
seedUsers({ spaceDomainOrId: 'intense-roadmap-loon', amount: 10 }).then(() => console.log('done'));

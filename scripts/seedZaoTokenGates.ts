/**
 * Seed The ZAO's access gates into a CharmVerse space as real TokenGate and Role rows.
 *
 * Source of truth: @packages/config/zao `zaoTokenGates` (ZAOOS research governance/2657, KD2).
 * The membership API evaluates the same definitions live without a database; this script
 * materialises them so the space's join flow, role assignment (applyTokenGates) and the
 * token-gate settings UI see them. Idempotent: a gate is matched by its slug stored in
 * `resourceId.zaoGateId`, a role by name within the space.
 *
 * Run (needs DATABASE_URL and a wired Postgres; Zaal's spend decision, grill 2026-10-10 item 80):
 *   npm run script -- scripts/seedZaoTokenGates.ts <space-domain> <creator-user-id>
 * Dry run (prints what it would write, touches nothing):
 *   npm run script -- scripts/seedZaoTokenGates.ts <space-domain> <creator-user-id> --dry-run
 */
import { prisma } from '@charmverse/core/prisma-client';
import { zaoTokenGates } from '@packages/config/zao';

async function main() {
  const [spaceDomain, createdBy, flag] = process.argv.slice(2);
  const dryRun = flag === '--dry-run';
  if (!spaceDomain || !createdBy) {
    throw new Error('usage: seedZaoTokenGates.ts <space-domain> <creator-user-id> [--dry-run]');
  }
  const space = await prisma.space.findUnique({ where: { domain: spaceDomain }, select: { id: true } });
  if (!space) {
    throw new Error(`space not found: ${spaceDomain}`);
  }

  for (const def of zaoTokenGates) {
    const existingRole = await prisma.role.findFirst({ where: { spaceId: space.id, name: def.roleName, archived: false } });
    const existingGates = await prisma.tokenGate.findMany({ where: { spaceId: space.id, archived: false } });
    const existingGate = existingGates.find((g) => (g.resourceId as { zaoGateId?: string } | null)?.zaoGateId === def.id);

    console.log(
      `${def.id}: role ${existingRole ? 'exists' : 'create'} "${def.roleName}", gate ${existingGate ? 'exists' : 'create'}`
    );
    if (dryRun) {
      continue;
    }

    const role =
      existingRole ??
      (await prisma.role.create({
        data: { name: def.roleName, spaceId: space.id, createdBy, source: null }
      }));

    const gate =
      existingGate ??
      (await prisma.tokenGate.create({
        data: {
          spaceId: space.id,
          createdBy,
          conditions: def.conditions as object,
          resourceId: { zaoGateId: def.id, description: def.description },
          type: 'lit'
        }
      }));

    const linked = await prisma.tokenGateToRole.findFirst({ where: { tokenGateId: gate.id, roleId: role.id } });
    if (!linked) {
      await prisma.tokenGateToRole.create({ data: { tokenGateId: gate.id, roleId: role.id } });
    }
  }
  console.log(dryRun ? 'dry run complete, nothing written' : 'seed complete');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

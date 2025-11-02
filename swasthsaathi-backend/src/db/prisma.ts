import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function testPrismaConnection() {
  const p = getPrisma();
  await p.$queryRaw`SELECT 1`;
}

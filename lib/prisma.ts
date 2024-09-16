// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import config from "@/config"

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (config.nextEnv !== 'production') global.prisma = prisma;

export default prisma;
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import configEnv from "@/config"

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (configEnv.env !== 'production') global.prisma = prisma;

export default prisma;
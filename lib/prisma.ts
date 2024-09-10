// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import configEnv from "@/config"

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (configEnv.env !== 'production') global.prisma = prisma;

export default prisma;
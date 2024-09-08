// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import configEnv from "@/config"

declare global {
    var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (configEnv.env === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

export default prisma;
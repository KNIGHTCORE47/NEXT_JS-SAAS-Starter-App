import { PrismaClient } from '@prisma/client'

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

function prismaClientSingleton() {
    return new PrismaClient()
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
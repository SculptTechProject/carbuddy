/*
 ! Singleton PrismaClient initializer
 &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
 && This module makes sure we only ever spin up one PrismaClient instance,   &&
 && even in development when modules get reloaded repeatedly.                &&
 && Without this, you can exhaust your database connection pool              &&
 && (especially during hot-reloads). In production we skip the global cache  &&
 && to let you manage PrismaClient lifecycles explicitly.                    &&
 &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& 
 */
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

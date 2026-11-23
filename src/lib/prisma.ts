import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

// One shared database client for the whole app.
//
// Why the globalThis trick? In development, Next.js reloads your code every
// time you save a file. Without it, each reload would open a NEW set of
// database connections, and MySQL would soon say "too many connections".
// Storing the client on globalThis lets every reload reuse the same one.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// ============================================
// Prisma 客户端工厂
// 支持本地开发（SQLite）和生产环境（Cloudflare D1）
// ============================================
function createPrismaClient() {
  // 优先级：D1 URL（生产）> LIBSQL_URL（环境变量）> DATABASE_URL > 本地文件
  const databaseUrl =
    process.env.LIBSQL_URL ||
    process.env.DATABASE_URL ||
    "file:dev.db";

  const authToken =
    process.env.LIBSQL_AUTH_TOKEN ||
    process.env.DATABASE_AUTH_TOKEN;

  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: authToken || undefined,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 在开发环境中使用全局变量防止热重载时重复创建连接
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

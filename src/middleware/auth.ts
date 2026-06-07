/**
 * 认证中间件
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * 验证请求是否为已认证的管理员请求
 */
export function withAuth(handler: (req: NextRequest, userId: number) => Promise<Response>) {
  return async (req: NextRequest) => {
    const token = extractToken(req as unknown as Request);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "未提供认证令牌",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "认证令牌无效或已过期",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // 查库确认用户仍然存在
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.userId },
    });
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: "用户不存在或已被禁用",
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    return handler(req, payload.userId);
  };
}

/**
 * 从请求中获取当前用户 ID
 */
export function getUserId(req: NextRequest): number | null {
  const token = extractToken(req as unknown as Request);
  if (!token) return null;

  const payload = verifyToken(token);
  return payload?.userId ?? null;
}

/**
 * 检查请求是否来自管理员（验证 token 并检查 role）
 */
export function isAdmin(req: NextRequest): boolean {
  const token = extractToken(req as unknown as Request);
  if (!token) return false;

  const payload = verifyToken(token);
  return payload !== null && payload.role === "admin";
}

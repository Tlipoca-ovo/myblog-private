import { NextResponse } from "next/server";
import { successResponse } from "@/lib/api-response";

/**
 * 管理员登出接口
 * POST /api/auth/logout
 * JWT 是无状态的，logout 由客户端自行删除 token
 * 此接口用于记录审计日志（可选）
 */
export async function POST() {
  return NextResponse.json(successResponse({ message: "已退出登录" }));
}

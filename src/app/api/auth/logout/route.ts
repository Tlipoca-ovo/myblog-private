import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api-response";

/**
 * 管理员登出接口
 * POST /api/auth/logout
 * 清除认证 cookie
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json(successResponse({ message: "已退出登录" }));

  // 清除 admin_token cookie
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
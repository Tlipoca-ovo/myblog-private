import { NextRequest, NextResponse } from "next/server";
import { verifyAdminLogin } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { badRequest, unauthorized } from "@/lib/api-error";

/**
 * 管理员登录接口
 * POST /api/auth/login
 * 接收用户名和密码，返回 JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 参数校验
    if (!username || !password) {
      return NextResponse.json(badRequest("用户名和密码不能为空").toJSON(), { status: 400 });
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(badRequest("用户名和密码格式不正确").toJSON(), { status: 400 });
    }

    if (username.length < 3 || username.length > 32) {
      return NextResponse.json(badRequest("用户名长度应为 3-32 个字符").toJSON(), { status: 400 });
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(badRequest("密码长度应为 6-128 个字符").toJSON(), { status: 400 });
    }

    // 验证登录
    const result = await verifyAdminLogin(username, password);

    if (!result.success) {
      return NextResponse.json(unauthorized(result.error || "登录失败").toJSON(), { status: 401 });
    }

    // 设置 httpOnly cookie，前端无需自行存储 token
    // credentials: "include" 的同源请求会自动带上
    const response = NextResponse.json(successResponse({
      token: result.token,
      user: result.user,
    }));
    response.cookies.set("admin_token", result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 天，与 JWT_EXPIRES_IN 默认值一致
    });
    return response;
  } catch (error) {
    console.error("登录请求处理失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}
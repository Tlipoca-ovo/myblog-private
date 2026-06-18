import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 登录页路径（不需要认证）
const LOGIN_PATH = "/admin/login";
const LOGIN_PATH_SLASH = "/admin/login/";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 跳过静态资源和 Next.js 内部路径
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // admin/login 和 admin/login/ 本身不需要认证
  if (pathname === LOGIN_PATH || pathname === LOGIN_PATH_SLASH) {
    return NextResponse.next();
  }

  // admin 其他页面需要登录
  // 注意：middleware 运行在 Edge Runtime，无法执行 JWT 签名校验或查库，
  // 这里只做"是否有登录 cookie"的轻量判断（拦截未登录访问并重定向）。
  // 真正的 token 签名校验 + 用户存在性校验由 /api/* 路由在 Node Runtime 完成。
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
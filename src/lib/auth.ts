import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "./db";

// ============================================
// 密钥配置
// ============================================
// 生产环境必须显式配置 JWT_SECRET，否则任何人都能伪造 token
const JWT_SECRET = process.env.JWT_SECRET
  ?? (process.env.NODE_ENV === "production"
    ? throwMissingSecret()
    : "dev-secret-change-in-production");

/**
 * 模块加载时抛错（生产环境缺 JWT_SECRET）
 * 用函数包裹以便在三元表达式中保持类型为 string
 */
function throwMissingSecret(): string {
  throw new Error(
    "生产环境必须设置环境变量 JWT_SECRET（推荐用 `npx wrangler secret put JWT_SECRET` 配置）"
  );
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
const BCRYPT_ROUNDS = 12;

// 鉴权 cookie 名（与 middleware、login/logout 路由保持一致）
export const AUTH_COOKIE_NAME = "admin_token";

// ============================================
// 类型定义
// ============================================
export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    nickname: string;
  };
  error?: string;
}

// ============================================
// 密码工具
// ============================================

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * 验证密码
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT 工具
// ============================================

/**
 * 签发 JWT token
 */
export function signToken(payload: JwtPayload): string {
  if (!payload.userId || !payload.username) {
    throw new Error("JWT payload 缺少必需字段");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * 验证 JWT token
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * 从请求中提取 token
 * 优先读取 httpOnly cookie（同源 fetch / 浏览器导航会自动携带），
 * 其次回退到 Authorization: Bearer 请求头（保留对外部调用方的兼容）。
 */
export function extractToken(request: Request): string | null {
  // 1) 优先从 httpOnly cookie 读取
  // NextRequest 实现了 RequestCookie 接口；标准 Request 没有，则手动解析 cookie 头
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (match) {
      return decodeURIComponent(match.slice(AUTH_COOKIE_NAME.length + 1));
    }
  }

  // 2) 回退到 Authorization: Bearer 请求头
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

// ============================================
// 认证工具
// ============================================

/**
 * 验证管理员登录
 */
export async function verifyAdminLogin(
  username: string,
  password: string
): Promise<AuthResult> {
  try {
    const admin = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (!admin) {
      return { success: false, error: "用户名或密码错误" };
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return { success: false, error: "用户名或密码错误" };
    }

    const token = signToken({
      userId: admin.id,
      username: admin.username,
      role: "admin",
    });

    return {
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
      },
    };
  } catch (error) {
    console.error("管理员登录失败:", error instanceof Error ? error.message : error);
    return { success: false, error: "登录失败，请稍后重试" };
  }
}

/**
 * 验证当前请求的管理员身份
 */
export async function verifyAdminRequest(request: Request): Promise<JwtPayload | null> {
  const token = extractToken(request);
  if (!token) {
    return null;
  }
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }
  // 查库确认用户仍然存在
  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
  });
  if (!admin) {
    return null;
  }
  return payload;
}

/**
 * 获取管理员信息（通过 token）
 */
export async function getAdminFromToken(token: string): Promise<{ id: number; username: string; nickname: string } | null> {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      nickname: true,
    },
  });

  return admin;
}

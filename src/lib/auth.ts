import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { prisma } from "./db";

// ============================================
// 密钥配置
// ============================================
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];
const BCRYPT_ROUNDS = 12;

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
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
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

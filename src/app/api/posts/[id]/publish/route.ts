import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized, notFound, forbidden } from "@/lib/api-error";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * POST /api/posts/[id]/publish - 发布或下架文章
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token) {
      return NextResponse.json(unauthorized("未提供认证令牌").toJSON(), { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(unauthorized("认证令牌无效").toJSON(), { status: 401 });
    }

    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    const body = await request.json();
    const { action } = body;

    const existing = await prisma.post.findUnique({ where: { id: idNum } });
    if (!existing) {
      return NextResponse.json(notFound("文章不存在").toJSON(), { status: 404 });
    }

    if (existing.authorId !== payload.userId) {
      return NextResponse.json(forbidden("无权操作此文章").toJSON(), { status: 403 });
    }

    if (action !== "publish" && action !== "unpublish") {
      return NextResponse.json(
        { success: false, error: "action 必须是 publish 或 unpublish", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const newStatus = action === "publish" ? "published" : "draft";

    const post = await prisma.post.update({
      where: { id: idNum },
      data: {
        status: newStatus,  // 不设置 publishedAt（Schema 中不存在此字段）
      },
      include: {
        author: { select: { id: true, username: true, nickname: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json(successResponse({
      ...post,
      category: post.categories[0]?.category ?? null,
      tags: post.tags.map((pt) => pt.tag),
      message: action === "publish" ? "文章已发布" : "文章已下架",
    }));
  } catch (error) {
    console.error("发布/下架文章失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}
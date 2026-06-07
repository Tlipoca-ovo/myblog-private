import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { badRequest, unauthorized } from "@/lib/api-error";
import { conflict } from "@/lib/api-error";

/**
 * GET /api/posts - 获取文章列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const status = searchParams.get("status");
    const categorySlug = searchParams.get("category");
    const tagSlug = searchParams.get("tag");
    const keyword = searchParams.get("keyword");

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = { some: { tag: { slug: tagSlug } } };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, nickname: true } },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
          tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json(paginatedResponse(
      posts.map((p) => ({
        ...p,
        excerpt: p.description,  // 数据库字段是 description，API 兼容用 excerpt
        category: p.categories[0]?.category ?? null,
        tags: p.tags.map((pt) => pt.tag),
      })),
      page,
      pageSize,
      total
    ));
  } catch (error) {
    console.error("获取文章列表失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

/**
 * POST /api/posts - 创建文章
 */
export async function POST(request: NextRequest) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token) {
      return NextResponse.json(unauthorized("未提供认证令牌").toJSON(), { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(unauthorized("认证令牌无效").toJSON(), { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, status, tagIds } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(badRequest("标题不能为空").toJSON(), { status: 400 });
    }

    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9一-龥]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content: content || "",
        description: excerpt || "",  // excerpt 参数映射到数据库的 description 字段
        coverImage: coverImage || "",
        status: status || "draft",
        authorId: payload.userId,
        tags: tagIds?.length
          ? { create: tagIds.map((tagId: string) => ({ tagId: Number(tagId) })) }
          : undefined,
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
    }));
  } catch (error) {
    console.error("创建文章失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}
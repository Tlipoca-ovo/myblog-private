import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized, notFound, forbidden, conflict } from "@/lib/api-error";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/posts/[id] - 获取单个文章
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idNum = parseInt(id, 10);

    const post = await prisma.post.findUnique({
      where: { id: idNum },
      include: {
        author: { select: { id: true, username: true, nickname: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (!post) {
      return NextResponse.json(notFound("文章不存在").toJSON(), { status: 404 });
    }

    return NextResponse.json(successResponse({
      ...post,
      category: post.categories[0]?.category ?? null,
      excerpt: post.description,
      tags: post.tags.map((pt) => pt.tag),
    }));
  } catch (error) {
    console.error("获取文章失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

/**
 * PUT /api/posts/[id] - 更新文章
 */
export async function PUT(request: NextRequest, context: RouteContext) {
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
    const { title, slug, content, excerpt, coverImage, status, tagIds, categoryId } = body;

    const existing = await prisma.post.findUnique({ where: { id: idNum } });
    if (!existing) {
      return NextResponse.json(notFound("文章不存在").toJSON(), { status: 404 });
    }

    if (existing.authorId !== payload.userId) {
      return NextResponse.json(forbidden("无权修改此文章").toJSON(), { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.description = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (status !== undefined) updateData.status = status;

    if (slug !== undefined && slug !== existing.slug) {
      const slugExists = await prisma.post.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
      }
      updateData.slug = slug;
    }

    await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({ where: { postId: idNum } });
      await tx.postCategory.deleteMany({ where: { postId: idNum } });

      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        await tx.postTag.createMany({
          data: tagIds.map((tagId: string | number) => ({
            postId: idNum,
            tagId: typeof tagId === "string" ? parseInt(tagId, 10) : tagId,
          })),
        });
      }
      if (categoryId) {
        await tx.postCategory.create({
          data: {
            postId: idNum,
            categoryId: typeof categoryId === "string" ? parseInt(categoryId, 10) : categoryId,
          },
        });
      }
    });

    const post = await prisma.post.update({
      where: { id: idNum },
      data: updateData,
      include: {
        author: { select: { id: true, username: true, nickname: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    });

    return NextResponse.json(successResponse({
      ...post,
      category: post.categories[0]?.category ?? null,
      excerpt: post.description,
      tags: post.tags.map((pt) => pt.tag),
    }));
  } catch (error) {
    console.error("更新文章失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id] - 删除文章
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const existing = await prisma.post.findUnique({ where: { id: idNum } });
    if (!existing) {
      return NextResponse.json(notFound("文章不存在").toJSON(), { status: 404 });
    }

    if (existing.authorId !== payload.userId) {
      return NextResponse.json(forbidden("无权删除此文章").toJSON(), { status: 403 });
    }

    await prisma.$transaction([
      prisma.postTag.deleteMany({ where: { postId: idNum } }),
      prisma.postCategory.deleteMany({ where: { postId: idNum } }),
      prisma.post.delete({ where: { id: idNum } }),
    ]);

    return NextResponse.json(successResponse({ message: "文章已删除" }));
  } catch (error) {
    console.error("删除文章失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}
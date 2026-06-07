import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized, notFound, conflict } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    const category = await prisma.category.findUnique({ where: { id: idNum } });
    if (!category) {
      return NextResponse.json(notFound("分类不存在").toJSON(), { status: 404 });
    }
    return NextResponse.json(successResponse(category));
  } catch (error) {
    console.error("获取分类失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    const body = await request.json();
    const { name, slug, description, sortOrder } = body;

    const existing = await prisma.category.findUnique({ where: { id: idNum } });
    if (!existing) {
      return NextResponse.json(notFound("分类不存在").toJSON(), { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    if (slug !== undefined && slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
      }
      updateData.slug = slug;
    }

    const category = await prisma.category.update({ where: { id: idNum }, data: updateData });
    return NextResponse.json(successResponse(category));
  } catch (error) {
    console.error("更新分类失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const token = extractToken(request as unknown as Request);
    if (!token || !verifyToken(token)) {
      return NextResponse.json(unauthorized("认证失败").toJSON(), { status: 401 });
    }
    const { id } = await context.params;
    const idNum = parseInt(id, 10);

    const postCount = await prisma.postCategory.count({ where: { categoryId: idNum } });
    if (postCount > 0) {
      return NextResponse.json(
        conflict(`该分类下有 ${postCount} 篇文章，请先移除关联后再删除`).toJSON(),
        { status: 409 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { id: idNum } });
    if (!existing) {
      return NextResponse.json(notFound("分类不存在").toJSON(), { status: 404 });
    }
    await prisma.category.delete({ where: { id: idNum } });
    return NextResponse.json(successResponse({ message: "分类已删除" }));
  } catch (error) {
    console.error("删除分类失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

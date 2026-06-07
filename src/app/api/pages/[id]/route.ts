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
    const page = await prisma.page.findUnique({ where: { id: idNum } });
    if (!page) return NextResponse.json(notFound("页面不存在").toJSON(), { status: 404 });
    return NextResponse.json(successResponse(page));
  } catch (error) {
    console.error("获取页面失败:", error instanceof Error ? error.message : error);
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
    const { title, slug, content, isDefault, sortOrder } = body;

    const existing = await prisma.page.findUnique({ where: { id: idNum } });
    if (!existing) return NextResponse.json(notFound("页面不存在").toJSON(), { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (slug !== undefined && slug !== existing.slug) {
      const slugExists = await prisma.page.findUnique({ where: { slug } });
      if (slugExists) return NextResponse.json(conflict("Slug 已存在").toJSON(), { status: 409 });
      updateData.slug = slug;
    }

    const page = await prisma.page.update({ where: { id: idNum }, data: updateData });
    return NextResponse.json(successResponse(page));
  } catch (error) {
    console.error("更新页面失败:", error instanceof Error ? error.message : error);
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
    const existing = await prisma.page.findUnique({ where: { id: idNum } });
    if (!existing) return NextResponse.json(notFound("页面不存在").toJSON(), { status: 404 });
    await prisma.page.delete({ where: { id: idNum } });
    return NextResponse.json(successResponse({ message: "页面已删除" }));
  } catch (error) {
    console.error("删除页面失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { unauthorized, notFound, conflict, badRequest } from "@/lib/api-error";
import { extractToken, verifyToken } from "@/lib/auth";
import { isValidUrl } from "@/lib/slug";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    const link = await prisma.friendLink.findUnique({ where: { id: idNum } });
    if (!link) return NextResponse.json(notFound("友链不存在").toJSON(), { status: 404 });
    return NextResponse.json(successResponse(link));
  } catch (error) {
    console.error("获取友链失败:", error instanceof Error ? error.message : error);
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
    const { name, url, description, logo, sortOrder, isActive } = body;

    const existing = await prisma.friendLink.findUnique({ where: { id: idNum } });
    if (!existing) return NextResponse.json(notFound("友链不存在").toJSON(), { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined && url !== existing.url) {
      if (!isValidUrl(url)) {
        return NextResponse.json(badRequest("请输入合法的 URL").toJSON(), { status: 400 });
      }
      const urlExists = await prisma.friendLink.findFirst({ where: { url, NOT: { id: idNum } } });
      if (urlExists) {
        return NextResponse.json(conflict("该 URL 已被其他友链使用").toJSON(), { status: 409 });
      }
      updateData.url = url;
    }
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const link = await prisma.friendLink.update({ where: { id: idNum }, data: updateData });
    return NextResponse.json(successResponse(link));
  } catch (error) {
    console.error("更新友链失败:", error instanceof Error ? error.message : error);
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
    const existing = await prisma.friendLink.findUnique({ where: { id: idNum } });
    if (!existing) return NextResponse.json(notFound("友链不存在").toJSON(), { status: 404 });
    await prisma.friendLink.delete({ where: { id: idNum } });
    return NextResponse.json(successResponse({ message: "友链已删除" }));
  } catch (error) {
    console.error("删除友链失败:", error instanceof Error ? error.message : error);
    return NextResponse.json(errorResponse("服务器内部错误"), { status: 500 });
  }
}
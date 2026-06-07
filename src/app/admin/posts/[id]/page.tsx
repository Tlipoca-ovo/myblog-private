import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PostEditor } from "../components/PostEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  let post;
  let categories;
  let tags;

  try {
    post = await prisma.post.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    });
    categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    });
    tags = await prisma.tag.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("加载文章数据失败:", error);
    redirect("/admin/posts");
  }

  if (!post) {
    notFound();
  }

  return (
    <div>
      <AdminHeader title="编辑文章" description={`编辑 "${post.title}"`} />
      <PostEditor
        mode="edit"
        post={{
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.description || "",
          slug: post.slug,
          published: post.status === "published",
          categoryId: post.categories[0]?.category.id ?? 0,
          tagIds: post.tags.map((t) => t.tag.id),
          coverImage: post.coverImage || "",
        }}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}

import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PostList } from "./components/PostList";
import { Plus } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ page?: string; category?: string; keyword?: string }>;
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const categorySlug = params.category || "";
  const keyword = params.keyword || "";
  const pageSize = 20;

  const where: Record<string, unknown> = {};
  if (keyword) {
    where.title = { contains: keyword };
  }
  if (categorySlug) {
    where.categories = { some: { category: { slug: categorySlug } } };
  }

  const [posts, total, categories] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  interface PostForList {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  category: { id: number; name: string; slug: string } | null;
  tags: { id: number; name: string; slug: string }[];
}

const mappedPosts: PostForList[] = posts.map((p) => ({
  id: p.id,
  title: p.title,
  slug: p.slug,
  published: p.status === "published",
  createdAt: p.createdAt,
  category: p.categories[0]?.category ?? null,
  tags: p.tags.map((t) => t.tag),
}));

return (
  <div>
    <AdminHeader
      title="文章管理"
      description="管理博客文章"
      actions={
        <Link href="/admin/posts/new" className="admin-button-primary">
          <Plus size={18} />
          新建文章
        </Link>
      }
    />

    <PostList
      posts={mappedPosts}
        total={total}
        page={page}
        pageSize={pageSize}
        categories={categories}
        currentCategory={categorySlug}
        keyword={keyword}
      />
    </div>
  );
}
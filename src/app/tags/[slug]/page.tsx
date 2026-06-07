import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import { mapPostToCardPost, postCardInclude, type PostCardRecord } from "@/lib/post-mapper";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

interface TagPostPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: TagPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  return { title: tag ? `标签: ${tag.name}` : "标签" };
}

export default async function TagPostPage({ params, searchParams }: TagPostPageProps) {
  await connection();

  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10));
  const pageSize = 9;

  let tag: Awaited<ReturnType<typeof prisma.tag.findUnique>> = null;
  let posts: PostCardRecord[] = [];
  let total = 0;
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let tagsWithCount: { id: number; name: string; slug: string; color: string; postCount: number }[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    tag = await prisma.tag.findUnique({ where: { slug } });
  } catch (error) {
    console.error("标签数据加载失败:", error instanceof Error ? error.message : error);
  }
  if (!tag) notFound();

  try {
    const [fetchedPosts, fetchedTotal, fetchedCategories, fetchedTags, fetchedConfig] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published", tags: { some: { tagId: tag.id } } },
        include: postCardInclude,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where: { status: "published", tags: { some: { tagId: tag.id } } } }),
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.siteSettings.findFirst(),
    ]);
    posts = fetchedPosts;
    total = fetchedTotal;
    categories = fetchedCategories;
    tagsWithCount = fetchedTags.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      color: t.color || "",
      postCount: t._count.posts,
    }));
    siteConfig = fetchedConfig;
  } catch (error) {
    console.error("标签文章页数据加载失败:", error instanceof Error ? error.message : error);
  }

  const totalPages = Math.ceil(total / pageSize);

  // 将 Prisma 返回的 null 转换为 undefined，避免类型不匹配
  const safeCategories = categories.map((c) => ({ ...c, description: c.description ?? undefined }));

  return (
    <BlogLayout siteConfig={siteConfig || {}} categories={safeCategories} tags={tagsWithCount}>
      <div className={styles.page}>
        <div className={styles.header}>
          <span className={styles.tag} style={{ "--tag-color": tag.color } as React.CSSProperties}>
            {tag.name}
          </span>
          <span className={styles.count}>{total} 篇文章</span>
        </div>

        {posts.length > 0 ? (
          <>
            <div className={styles.grid}>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={mapPostToCardPost(post)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} baseUrl={`/tags/${slug}`} />
            )}
          </>
        ) : (
          <p className={styles.empty}>该标签下暂无文章</p>
        )}
      </div>
    </BlogLayout>
  );
}

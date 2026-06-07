import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { PostCard } from "@/components/blog/PostCard";
import { Pagination } from "@/components/blog/Pagination";
import { parseThemeColors, generateThemeCSS } from "@/lib/theme";
import { mapPostToCardPost, postCardInclude, type PostCardRecord } from "@/lib/post-mapper";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "首页",
};

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  await connection();

  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const pageSize = 12;

  let posts: PostCardRecord[] = [];
  let total = 0;
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let tagsWithCount: { id: number; name: string; slug: string; color: string; postCount: number }[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    const [fetchedPosts, fetchedTotal, fetchedCategories, fetchedTags, fetchedConfig] = await Promise.all([
      prisma.post.findMany({
        where: { status: "published" },
        include: postCardInclude,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where: { status: "published" } }),
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
    console.error("首页数据加载失败:", error instanceof Error ? error.message : error);
  }

  // 将 Prisma 返回的 null 转换为 undefined，避免类型不匹配
  const safeCategories = categories.map((c) => ({ ...c, description: c.description ?? undefined }));

  const tagsWithCountFinal = tagsWithCount;
  const siteConfigFinal = siteConfig;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <>
      {/* 动态主题样式 */}
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(parseThemeColors(siteConfigFinal?.themeColors || "")) }} />

      <BlogLayout
        siteConfig={siteConfigFinal || {}}
        categories={safeCategories}
        tags={tagsWithCountFinal}
        showSidebar={true}
      >
        {/* Hero 区域 */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>{siteConfig?.siteName || "我的博客"}</h1>
          <p className={styles.heroDescription}>
            {siteConfig?.siteDescription || "欢迎来到我的博客，分享技术与生活"}
          </p>
        </section>

        {/* 文章列表 */}
        {posts.length > 0 ? (
          <>
            <div className={styles.postGrid}>
              {posts.map((post) => {
                  return (
                    <PostCard
                      key={post.id}
                      post={mapPostToCardPost(post)}
                    />
                  );
                })}
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/"
              />
            )}
          </>
        ) : (
          <div className={styles.empty}>
            <p>暂无文章</p>
          </div>
        )}
      </BlogLayout>
    </>
  );
}

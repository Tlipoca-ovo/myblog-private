import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { PostCard } from "@/components/blog/PostCard";
import { mapPostToCardPost, postCardInclude, type PostCardRecord } from "@/lib/post-mapper";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  return searchParams.then(({ q }) => ({ title: q ? `搜索: ${q}` : "搜索" }));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await connection();

  const { q } = await searchParams;
  const query = (q || "").trim();

  let posts: PostCardRecord[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  if (query) {
    try {
      posts = await prisma.post.findMany({
        where: {
          status: "published",
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { content: { contains: query } },
          ],
        },
        include: postCardInclude,
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      console.error("搜索数据加载失败:", error instanceof Error ? error.message : error);
    }
  }

  try {
    siteConfig = await prisma.siteSettings.findFirst();
  } catch (error) {
    console.error("搜索页站点配置加载失败:", error instanceof Error ? error.message : error);
  }

  return (
    <BlogLayout siteConfig={siteConfig || {}} showSidebar={false}>
      <div className={styles.page}>
        <h1 className={styles.title}>
          {query ? `搜索结果: "${query}"` : "搜索"}
        </h1>
        {query ? (
          posts.length > 0 ? (
            <>
              <p className={styles.resultCount}>找到 {posts.length} 篇文章</p>
              <div className={styles.grid}>
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={mapPostToCardPost(post)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p>没有找到与 “{query}” 相关的文章</p>
              <p className={styles.tip}>试试其他关键词？</p>
            </div>
          )
        ) : (
          <p className={styles.hint}>在首页搜索框输入关键词开始搜索</p>
        )}
      </div>
    </BlogLayout>
  );
}

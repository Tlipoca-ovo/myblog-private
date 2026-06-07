import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Comments } from "@/components/blog/Comments";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { parseThemeColors, generateThemeCSS } from "@/lib/theme";
import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug, status: "published" },
    select: { title: true, description: true, coverImage: true },
  });
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.description || undefined,
    openGraph: {
      title: post.title,
      description: post.description || undefined,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  await connection();

  const { slug } = await params;

  let post: Awaited<ReturnType<typeof prisma.post.findUnique<{
  where: { slug: string; status: string };
  include: {
    author: { select: { id: true; username: true; nickname: true; avatar: true } };
    categories: { include: { category: { select: { id: true; name: true; slug: true } } } };
    tags: { include: { tag: { select: { id: true; name: true; slug: true; color: true } } } };
  };
}>>> | null = null;
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let tagsWithCount: { id: number; name: string; slug: string; color: string; postCount: number }[] = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    post = await prisma.post.findUnique({
      where: { slug, status: "published" },
      include: {
        author: { select: { id: true, username: true, nickname: true, avatar: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true, color: true } } } },
      },
    });
  } catch (error) {
    console.error("文章数据加载失败:", error instanceof Error ? error.message : error);
  }

  if (!post) notFound();

  // 增加浏览量（独立处理，避免阻塞页面渲染）
  try {
    await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    console.error("浏览量更新失败:", error instanceof Error ? error.message : error);
  }

  try {
    const [fetchedCategories, fetchedTags, fetchedConfig] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.tag.findMany({
        include: { _count: { select: { posts: true } } },
        orderBy: { name: "asc" },
      }),
      prisma.siteSettings.findFirst(),
    ]);
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
    console.error("侧边栏数据加载失败:", error instanceof Error ? error.message : error);
  }

  // 将 Prisma 返回的 null 转换为 undefined，避免类型不匹配
  const safeCategories = categories.map((c) => ({ ...c, description: c.description ?? undefined }));

  const themeColors = parseThemeColors(siteConfig?.themeColors || "");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(themeColors) }} />
      <ReadingProgress />
      <BlogLayout
        siteConfig={siteConfig || {}}
        categories={safeCategories}
        tags={tagsWithCount}
        showSidebar={false}
      >
        <article className={styles.article}>
          {/* 封面图 */}
          {post.coverImage && (
            <Image
              src={post.coverImage}
              alt={post.title}
              width={1200}
              height={675}
              className={styles.coverImage}
              unoptimized
            />
          )}

          {/* 元信息 */}
          <header className={styles.header}>
            <div className={styles.categories}>
              {post.categories.map((cat) => (
                <a key={cat.categoryId} href={`/categories/${cat.category.slug}`} className={styles.category}>
                  {cat.category.name}
                </a>
              ))}
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <span>{post.author.nickname}</span>
              <span>·</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </span>
              <span>·</span>
              <span>{post.views} 阅读</span>
            </div>
            {post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map((pt) => (
                  <a
                    key={pt.tagId}
                    href={`/tags/${pt.tag.slug}`}
                    className={styles.tag}
                    style={{ "--tag-color": pt.tag.color } as React.CSSProperties}
                  >
                    {pt.tag.name}
                  </a>
                ))}
              </div>
            )}
          </header>

          {/* 内容 */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 目录 */}
          <aside className={styles.tocContainer}>
            <TableOfContents content={post.content} />
          </aside>
        </article>

        {/* 评论 */}
        <Comments postId={post.id.toString()} />
      </BlogLayout>
    </>
  );
}

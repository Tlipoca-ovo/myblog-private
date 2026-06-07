import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import { TagCloud } from "@/components/blog/TagCloud";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "标签" };

export default async function TagsPage() {
  await connection();

  const [tags, siteConfig] = await Promise.all([
    prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.siteSettings.findFirst(),
  ]);

  const tagsWithCount = tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    color: t.color || "",
    postCount: t._count.posts,
  }));

  return (
    <BlogLayout siteConfig={siteConfig || {}} showSidebar={false}>
      <div className={styles.page}>
        <h1 className={styles.title}>标签</h1>
        <p className={styles.description}>按标签浏览所有文章</p>
        <TagCloud tags={tagsWithCount} />
      </div>
    </BlogLayout>
  );
}

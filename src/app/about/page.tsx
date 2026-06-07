import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "关于" };

export default async function AboutPage() {
  await connection();

  let page: Awaited<ReturnType<typeof prisma.page.findFirst>> = null;
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    const [fetchedPage, fetchedConfig] = await Promise.all([
      prisma.page.findFirst({ where: { slug: "about" } }),
      prisma.siteSettings.findFirst(),
    ]);
    page = fetchedPage;
    siteConfig = fetchedConfig;
  } catch (error) {
    console.error("关于页数据加载失败:", error instanceof Error ? error.message : error);
  }

  return (
    <BlogLayout siteConfig={siteConfig || {}} showSidebar={false}>
      <div className={styles.page}>
        <h1 className={styles.title}>关于</h1>
        <div className={styles.content}>
          {page?.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <div className={styles.defaultAbout}>
              <p>欢迎来到我的博客！</p>
              <p>这是一个使用 Next.js 和 Prisma 构建的现代化博客系统。</p>
              <p>在这里，我会分享技术心得、生活感悟以及各种有趣的知识。</p>
              <h2>关于我</h2>
              <p>我是一名热爱技术开发者，喜欢探索新技术，分享所学。</p>
              <h2>联系方式</h2>
              <p>如果你有任何问题或建议，欢迎通过以下方式联系我：</p>
              <ul>
                <li>Email: example@example.com</li>
                <li>GitHub: github.com/example</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </BlogLayout>
  );
}

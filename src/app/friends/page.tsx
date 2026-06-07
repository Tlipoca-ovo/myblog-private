import { prisma } from "@/lib/db";
import { BlogLayout } from "@/components/blog/BlogLayout";
import Image from "next/image";
import type { Metadata } from "next";
import { connection } from "next/server";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "友链" };

export default async function FriendsPage() {
  await connection();

  let friendLinks: Awaited<ReturnType<typeof prisma.friendLink.findMany>> = [];
  let siteConfig: Awaited<ReturnType<typeof prisma.siteSettings.findFirst>> = null;

  try {
    const [fetchedLinks, fetchedConfig] = await Promise.all([
      prisma.friendLink.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.siteSettings.findFirst(),
    ]);
    friendLinks = fetchedLinks;
    siteConfig = fetchedConfig;
  } catch (error) {
    console.error("友链页数据加载失败:", error instanceof Error ? error.message : error);
  }

  return (
    <BlogLayout siteConfig={siteConfig || {}} showSidebar={false}>
      <div className={styles.page}>
        <h1 className={styles.title}>友链</h1>
        <p className={styles.description}>感谢这些优秀的朋友们</p>
        {friendLinks.length > 0 ? (
          <div className={styles.grid}>
            {friendLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.card}
                title={link.description || ""}
              >
                {link.logo && (
                  <Image
                    src={link.logo}
                    alt={link.name}
                    width={40}
                    height={40}
                    className={styles.logo}
                    unoptimized
                  />
                )}
                <div className={styles.info}>
                  <span className={styles.name}>{link.name}</span>
                  {link.description && (
                    <span className={styles.desc}>{link.description}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>暂无友链</p>
        )}
      </div>
    </BlogLayout>
  );
}

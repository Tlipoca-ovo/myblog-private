import { prisma } from "@/lib/db";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FileText, FolderOpen, Tags, Link2, Eye, MessageSquare } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.css";

export default async function AdminDashboard() {
  let postCount = 0;
  let categoryCount = 0;
  let tagCount = 0;
  let friendCount = 0;
  let totalViews = 0;
  let commentCount = 0;

  try {
    const results = await Promise.all([
      prisma.post.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.friendLink.count(),
      prisma.post.aggregate({ _sum: { views: true } }),
      prisma.comment.count(),
    ]);
    postCount = results[0];
    categoryCount = results[1];
    tagCount = results[2];
    friendCount = results[3];
    totalViews = results[4]._sum.views || 0;
    commentCount = results[5];
  } catch (error) {
    console.error("仪表盘数据加载失败:", error instanceof Error ? error.message : error);
  }

  const stats = [
    {
      label: "文章总数",
      value: postCount,
      icon: FileText,
      color: "#3b82f6",
      href: "/admin/posts",
    },
    {
      label: "分类总数",
      value: categoryCount,
      icon: FolderOpen,
      color: "#10b981",
      href: "/admin/categories",
    },
    {
      label: "标签总数",
      value: tagCount,
      icon: Tags,
      color: "#f59e0b",
      href: "/admin/tags",
    },
    {
      label: "友链总数",
      value: friendCount,
      icon: Link2,
      color: "#8b5cf6",
      href: "/admin/friends",
    },
    {
      label: "总浏览量",
      value: totalViews,
      icon: Eye,
      color: "#ec4899",
      href: "/admin/posts",
    },
    {
      label: "评论总数",
      value: commentCount,
      icon: MessageSquare,
      color: "#06b6d4",
      href: "/admin/posts",
    },
  ];

  return (
    <div>
      <AdminHeader
        title="仪表盘"
        description="博客数据概览"
      />

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={styles.statCard}
          >
            <div className={styles.statIcon} style={{ color: stat.color, backgroundColor: `color-mix(in srgb, ${stat.color}, 10%)` }}>
              <stat.icon size={24} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stat.value.toLocaleString()}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.quickLinks}>
        <h2 className={styles.sectionTitle}>快捷操作</h2>
        <div className={styles.linksGrid}>
          <Link href="/admin/posts/new" className={styles.quickLink}>
            <FileText size={18} />
            写文章
          </Link>
          <Link href="/admin/categories" className={styles.quickLink}>
            <FolderOpen size={18} />
            管理分类
          </Link>
          <Link href="/admin/tags" className={styles.quickLink}>
            <Tags size={18} />
            管理标签
          </Link>
          <Link href="/admin/friends" className={styles.quickLink}>
            <Link2 size={18} />
            管理友链
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye } from "lucide-react";
import type { Post } from "@/types/blog";
import styles from "./PostCard.module.css";

interface PostCardProps {
  post: Post;
  variant?: "default" | "compact" | "featured";
}

export function PostCard({ post, variant = "default" }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (variant === "compact") {
    return (
      <article className={styles.compact}>
        <Link href={`/posts/${post.slug}`} className={styles.compactTitle}>
          {post.title}
        </Link>
        <span className={styles.compactDate}>{formattedDate}</span>
      </article>
    );
  }

  return (
    <article className={`${styles.card} ${variant === "featured" ? styles.featured : ""}`}>
      {/* 封面图 */}
      {post.coverImage && (
        <Link href={`/posts/${post.slug}`} className={styles.coverLink}>
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1200}
            height={675}
            className={styles.coverImage}
            unoptimized
          />
        </Link>
      )}

      {/* 内容 */}
      <div className={styles.content}>
        {/* 分类 */}
        {post.categories.length > 0 && (
          <div className={styles.categories}>
            {post.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className={styles.category}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* 标题 */}
        <h2 className={styles.title}>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>

        {/* 摘要 */}
        {variant === "featured" && post.excerpt && (
          <p className={styles.excerpt}>{post.excerpt}</p>
        )}

        {/* 元信息 */}
        <div className={styles.meta}>
          <span className={styles.metaItem}>
            <Calendar size={14} />
            {formattedDate}
          </span>
          <span className={styles.metaItem}>
            <Eye size={14} />
            {post.viewCount}
          </span>
        </div>

        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className={styles.tag}
                style={{ "--tag-color": tag.color } as React.CSSProperties}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

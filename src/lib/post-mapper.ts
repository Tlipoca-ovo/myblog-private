import type { Prisma } from "@/generated/prisma/client";
import type { PostGetPayload } from "@/generated/prisma/models/Post";
import type { Post as BlogPost } from "@/types/blog";

export const postCardInclude = {
  author: {
    select: { id: true, username: true, nickname: true, avatar: true },
  },
  categories: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  },
  tags: {
    include: {
      tag: { select: { id: true, name: true, slug: true, color: true } },
    },
  },
} as const satisfies Prisma.PostInclude;

export type PostCardRecord = PostGetPayload<{ include: typeof postCardInclude }>;

export function mapPostToCardPost(post: PostCardRecord): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.description || "",
    content: post.content,
    coverImage: post.coverImage || "",
    status: post.status as "draft" | "published",
    viewCount: post.views,
    author: {
      id: post.author.id,
      username: post.author.username,
      nickname: post.author.nickname,
      avatar: post.author.avatar || "",
    },
    categories: post.categories.map(({ category }) => category),
    tags: post.tags.map(({ tag }) => ({
      ...tag,
      color: tag.color || "",
    })),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

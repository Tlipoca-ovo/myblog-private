// 文章类型
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: "draft" | "published";
  viewCount: number;
  author: {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
  };
  categories: { id: number; name: string; slug: string }[];
  tags: { id: number; name: string; slug: string; color: string }[];
  createdAt: string;
  updatedAt: string;
  isPage?: boolean;
}


// 分类类型
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  postCount?: number;
}

// 标签类型
export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  postCount?: number;
}

// 页面类型
export interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  isDefault: boolean;
  sortOrder: number;
}

// 友链类型
export interface FriendLink {
  id: number;
  name: string;
  url: string;
  description?: string;
  logo: string;
  isActive: boolean;
}

// 站点配置类型
export interface SiteConfig {
  siteName: string;
  siteUrl: string;
  siteLogo: string;
  siteFavicon: string;
  siteDescription: string;
  themeMode: string;
  themeColors?: string;
  fonts?: string;
  layout?: string;
  homepageModules?: string;
  seoConfig?: string;
  socialLinks?: string;
}

// 目录项类型
export interface TocItem {
  id: string;
  text: string;
  level: number;
}
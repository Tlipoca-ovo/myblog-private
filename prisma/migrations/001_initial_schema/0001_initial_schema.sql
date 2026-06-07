-- 创建管理员用户表
CREATE TABLE `AdminUser` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `username` TEXT NOT NULL UNIQUE DEFAULT 'admin',
    `password` TEXT NOT NULL,
    `nickname` TEXT NOT NULL DEFAULT '博主',
    `avatar` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建文章表
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `title` TEXT NOT NULL,
    `slug` TEXT NOT NULL UNIQUE,
    `content` TEXT NOT NULL DEFAULT '',
    `description` TEXT,
    `coverImage` TEXT,
    `status` TEXT NOT NULL DEFAULT 'draft',
    `views` INTEGER NOT NULL DEFAULT 0,
    `isPage` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `authorId` INTEGER NOT NULL,
    FOREIGN KEY (`authorId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE
);
CREATE INDEX `Post_status_idx` ON `Post`(`status`);
CREATE INDEX `Post_authorId_idx` ON `Post`(`authorId`);

-- 创建分类表
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL UNIQUE,
    `slug` TEXT NOT NULL UNIQUE,
    `description` TEXT,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX `Category_slug_idx` ON `Category`(`slug`);

-- 创建标签表
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL UNIQUE,
    `slug` TEXT NOT NULL UNIQUE,
    `color` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX `Tag_slug_idx` ON `Tag`(`slug`);

-- 创建文章-分类关联表
CREATE TABLE `PostCategory` (
    `postId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `categoryId`),
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE
);

-- 创建文章-标签关联表
CREATE TABLE `PostTag` (
    `postId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `tagId`),
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE
);

-- 创建独立页面表
CREATE TABLE `Page` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `title` TEXT NOT NULL,
    `slug` TEXT NOT NULL UNIQUE,
    `content` TEXT NOT NULL DEFAULT '',
    `isDefault` INTEGER NOT NULL DEFAULT 0,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX `Page_slug_idx` ON `Page`(`slug`);

-- 创建友链表
CREATE TABLE `FriendLink` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `url` TEXT NOT NULL,
    `description` TEXT,
    `logo` TEXT,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建评论表
CREATE TABLE `Comment` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `content` TEXT NOT NULL,
    `authorName` TEXT NOT NULL,
    `authorEmail` TEXT,
    `authorUrl` TEXT,
    `isApproved` INTEGER NOT NULL DEFAULT 0,
    `isPinned` INTEGER NOT NULL DEFAULT 0,
    `ip` TEXT,
    `userAgent` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `postId` INTEGER NOT NULL,
    `parentId` INTEGER,
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE
);

-- 创建站点设置表
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `siteName` TEXT NOT NULL DEFAULT '我的博客',
    `siteDescription` TEXT,
    `siteKeywords` TEXT,
    `logo` TEXT,
    `favicon` TEXT,
    `authorName` TEXT,
    `authorAvatar` TEXT,
    `aboutContent` TEXT,
    `socialLinks` TEXT,
    `commentModeration` INTEGER NOT NULL DEFAULT 1,
    `commentRequireApproval` INTEGER NOT NULL DEFAULT 1,
    `themeColors` TEXT,
    `customCss` TEXT,
    `customHead` TEXT,
    `analyticsCode` TEXT,
    `googleSiteVerification` TEXT,
    `baiduSiteVerification` TEXT,
    `customNavigation` TEXT,
    `customModules` TEXT,
    `footerModules` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
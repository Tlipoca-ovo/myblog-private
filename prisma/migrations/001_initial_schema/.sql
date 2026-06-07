-- 初始化数据库结构
-- 创建所有表和索引

CREATE TABLE `AdminUser` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `username` TEXT NOT NULL UNIQUE DEFAULT 'admin',
    `password` TEXT NOT NULL,
    `nickname` TEXT NOT NULL DEFAULT '博主',
    `avatar` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);

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
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `authorId` INTEGER NOT NULL,
    FOREIGN KEY (`authorId`) REFERENCES `AdminUser`(`id`) ON DELETE CASCADE
);
CREATE INDEX `Post_status` ON `Post`(`status`);
CREATE INDEX `Post_authorId` ON `Post`(`authorId`);

CREATE TABLE `Category` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL UNIQUE,
    `slug` TEXT NOT NULL UNIQUE,
    `description` TEXT,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX `Category_slug` ON `Category`(`slug`);

CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL UNIQUE,
    `slug` TEXT NOT NULL UNIQUE,
    `color` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX `Tag_slug` ON `Tag`(`slug`);

CREATE TABLE `PostCategory` (
    `postId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `categoryId`),
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE
);

CREATE TABLE `PostTag` (
    `postId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `tagId`),
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE
);

CREATE TABLE `Page` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `title` TEXT NOT NULL,
    `slug` TEXT NOT NULL UNIQUE,
    `content` TEXT NOT NULL DEFAULT '',
    `isDefault` INTEGER NOT NULL DEFAULT 0,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX `Page_slug` ON `Page`(`slug`);

CREATE TABLE `FriendLink` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `url` TEXT NOT NULL,
    `description` TEXT,
    `logo` TEXT,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);

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
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `postId` INTEGER NOT NULL,
    `parentId` INTEGER,
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE
);

CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `siteName` TEXT NOT NULL DEFAULT '我的博客',
    `siteDescription` TEXT,
    `logo` TEXT,
    `favicon` TEXT,
    `customCss` TEXT,
    `themeColors` TEXT,
    `socialLinks` TEXT,
    `footerText` TEXT,
    `modules` TEXT,
    `navigation` TEXT,
    `analyticsCode` TEXT,
    `commentSettings` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `SeoSettings` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `siteTitle` TEXT,
    `siteDescription` TEXT,
    `ogImage` TEXT,
    `keywords` TEXT,
    `googleAnalyticsId` TEXT,
    `baiduAnalyticsId` TEXT,
    `customHeadCode` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE `ContentModule` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `key` TEXT NOT NULL UNIQUE,
    `title` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME NOT NULL DEFAULT (datetime('now')),
    `updatedAt` DATETIME NOT NULL DEFAULT (datetime('now'))
);
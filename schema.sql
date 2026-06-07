CREATE TABLE IF NOT EXISTS `AdminUser` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `username` TEXT NOT NULL,
    `password` TEXT NOT NULL,
    `nickname` TEXT NOT NULL DEFAULT '博主',
    `avatar` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(`username`)
);

CREATE TABLE IF NOT EXISTS `Category` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `slug` TEXT NOT NULL,
    `description` TEXT,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(`name`),
    UNIQUE(`slug`)
);

CREATE TABLE IF NOT EXISTS `Tag` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` TEXT NOT NULL,
    `slug` TEXT NOT NULL,
    `color` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(`name`),
    UNIQUE(`slug`)
);

CREATE TABLE IF NOT EXISTS `Post` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `title` TEXT NOT NULL,
    `slug` TEXT NOT NULL,
    `content` TEXT NOT NULL DEFAULT '',
    `description` TEXT,
    `coverImage` TEXT,
    `status` TEXT NOT NULL DEFAULT 'draft',
    `views` INTEGER NOT NULL DEFAULT 0,
    `isPage` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `authorId` INTEGER NOT NULL,
    UNIQUE(`slug`),
    FOREIGN KEY (`authorId`) REFERENCES `AdminUser`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `PostCategory` (
    `postId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `categoryId`),
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `PostTag` (
    `postId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `tagId`),
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `Page` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `title` TEXT NOT NULL,
    `slug` TEXT NOT NULL UNIQUE,
    `content` TEXT NOT NULL DEFAULT '',
    `isDefault` INTEGER NOT NULL DEFAULT 0,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `FriendLink` (
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

CREATE TABLE IF NOT EXISTS `Comment` (
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
    FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`parentId`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS `SiteSettings` (
    `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    `siteName` TEXT NOT NULL DEFAULT '我的博客',
    `siteDescription` TEXT,
    `siteKeywords` TEXT,
    `siteLogo` TEXT,
    `customCSS` TEXT,
    `themeColors` TEXT,
    `socialLinks` TEXT,
    `ICP` TEXT,
    `police` TEXT,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号（密码: admin123）
INSERT OR IGNORE INTO `AdminUser` (`username`, `password`, `nickname`) VALUES ('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5POEKi', '博主');

-- 插入默认站点设置
INSERT OR IGNORE INTO `SiteSettings` (`siteName`, `siteDescription`, `siteKeywords`) VALUES ('我的博客', '欢迎来到我的博客，分享技术与生活', '博客,技术,生活');
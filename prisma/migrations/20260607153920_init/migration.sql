/*
  Warnings:

  - You are about to alter the column `isApproved` on the `Comment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isPinned` on the `Comment` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isActive` on the `FriendLink` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isDefault` on the `Page` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `isPage` on the `Post` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - The primary key for the `SiteSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ICP` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `police` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `siteKeywords` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL DEFAULT 'admin',
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT '博主',
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AdminUser" ("avatar", "createdAt", "id", "nickname", "password", "updatedAt", "username") SELECT "avatar", "createdAt", "id", "nickname", "password", "updatedAt", "username" FROM "AdminUser";
DROP TABLE "AdminUser";
ALTER TABLE "new_AdminUser" RENAME TO "AdminUser";
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");
CREATE TABLE "new_Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "authorUrl" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "postId" INTEGER NOT NULL,
    "parentId" INTEGER,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Comment" ("authorEmail", "authorName", "authorUrl", "content", "createdAt", "id", "ip", "isApproved", "isPinned", "parentId", "postId", "updatedAt", "userAgent") SELECT "authorEmail", "authorName", "authorUrl", "content", "createdAt", "id", "ip", "isApproved", "isPinned", "parentId", "postId", "updatedAt", "userAgent" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX "Comment_isApproved_idx" ON "Comment"("isApproved");
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");
CREATE TABLE "new_FriendLink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FriendLink" ("createdAt", "description", "id", "isActive", "logo", "name", "sortOrder", "updatedAt", "url") SELECT "createdAt", "description", "id", "isActive", "logo", "name", "sortOrder", "updatedAt", "url" FROM "FriendLink";
DROP TABLE "FriendLink";
ALTER TABLE "new_FriendLink" RENAME TO "FriendLink";
CREATE TABLE "new_Page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Page" ("content", "createdAt", "id", "isDefault", "slug", "sortOrder", "title", "updatedAt") SELECT "content", "createdAt", "id", "isDefault", "slug", "sortOrder", "title", "updatedAt" FROM "Page";
DROP TABLE "Page";
ALTER TABLE "new_Page" RENAME TO "Page";
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
CREATE INDEX "Page_slug_idx" ON "Page"("slug");
CREATE TABLE "new_Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "coverImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "views" INTEGER NOT NULL DEFAULT 0,
    "isPage" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" INTEGER NOT NULL,
    CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "AdminUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Post" ("authorId", "content", "coverImage", "createdAt", "description", "id", "isPage", "slug", "status", "title", "updatedAt", "views") SELECT "authorId", "content", "coverImage", "createdAt", "description", "id", "isPage", "slug", "status", "title", "updatedAt", "views" FROM "Post";
DROP TABLE "Post";
ALTER TABLE "new_Post" RENAME TO "Post";
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_status_idx" ON "Post"("status");
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE TABLE "new_SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteName" TEXT NOT NULL DEFAULT '我的博客',
    "siteUrl" TEXT NOT NULL DEFAULT '',
    "siteLogo" TEXT NOT NULL DEFAULT '',
    "siteFavicon" TEXT NOT NULL DEFAULT '',
    "siteDescription" TEXT NOT NULL DEFAULT '',
    "themeMode" TEXT NOT NULL DEFAULT 'light',
    "themeColors" TEXT NOT NULL DEFAULT '{}',
    "fonts" TEXT NOT NULL DEFAULT '{}',
    "layout" TEXT NOT NULL DEFAULT '{}',
    "homepageModules" TEXT NOT NULL DEFAULT '[]',
    "seoConfig" TEXT NOT NULL DEFAULT '{}',
    "headCustom" TEXT NOT NULL DEFAULT '',
    "footerCustom" TEXT NOT NULL DEFAULT '',
    "customCSS" TEXT NOT NULL DEFAULT '',
    "navConfig" TEXT NOT NULL DEFAULT '[]',
    "commentConfig" TEXT NOT NULL DEFAULT '{}',
    "socialLinks" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("customCSS", "id", "siteDescription", "siteLogo", "siteName", "socialLinks", "themeColors", "updatedAt") SELECT coalesce("customCSS", '') AS "customCSS", "id", coalesce("siteDescription", '') AS "siteDescription", coalesce("siteLogo", '') AS "siteLogo", "siteName", coalesce("socialLinks", '[]') AS "socialLinks", coalesce("themeColors", '{}') AS "themeColors", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");

-- CreateIndex
CREATE INDEX "Config_key_idx" ON "Config"("key");

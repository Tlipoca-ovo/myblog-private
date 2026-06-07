-- 插入默认管理员账号（密码: admin123，已 bcrypt 加密）
-- 实际密码是 admin123，可在后台修改
INSERT OR IGNORE INTO AdminUser (id, username, password, nickname, avatar, createdAt, updatedAt)
VALUES (1, 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.NT3iVH3TW8pF3e', '博主', NULL, datetime('now'), datetime('now'));

-- 插入默认站点配置
INSERT OR IGNORE INTO SiteSettings (id, siteName, siteUrl, siteLogo, siteFavicon, siteDescription, themeMode, themeColors, fonts, layout, homepageModules, seoConfig, headCustom, footerCustom, customCSS, navConfig, commentConfig, socialLinks, updatedAt)
VALUES ('default', '博客模版', '', '', '', '一个高度可自定义的博客模版', 'light', '{}', '{}', '{}', '[]', '{}', '', '', '', '[]', '{}', '[]', datetime('now'));

-- 插入默认页面
INSERT OR IGNORE INTO Page (id, title, slug, content, isDefault, sortOrder, createdAt, updatedAt)
VALUES (1, '关于', 'about', '', 1, 0, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO Page (id, title, slug, content, isDefault, sortOrder, createdAt, updatedAt)
VALUES (2, '友链', 'links', '', 1, 1, datetime('now'), datetime('now'));

-- 插入默认分类
INSERT OR IGNORE INTO Category (id, name, slug, description, sortOrder, createdAt)
VALUES (1, '技术', 'tech', '技术相关文章', 1, datetime('now'));

INSERT OR IGNORE INTO Category (id, name, slug, description, sortOrder, createdAt)
VALUES (2, '生活', 'life', '生活随笔', 2, datetime('now'));
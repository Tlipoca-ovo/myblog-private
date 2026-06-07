-- 修复数据库结构的脚本

-- 1. 确保 SiteSettings 有 siteKeywords 列
-- (如果表已存在且没有该列才执行)
INSERT OR IGNORE INTO `SiteSettings` (`siteName`, `siteDescription`, `siteKeywords`) VALUES ('我的博客', '欢迎来到我的博客，分享技术与生活', '博客,技术,生活');
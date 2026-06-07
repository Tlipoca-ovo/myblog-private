/**
 * D1 数据库播种脚本
 * 使用 @prisma/adapter-libsql 连接 Cloudflare D1
 * 运行方式: npm run d1:seed
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

// 创建 libsql 适配器，连接本地 D1 或远程 D1
function createD1PrismaClient() {
  const databaseUrl =
    process.env.LIBSQL_URL ||
    process.env.DATABASE_URL ||
    "file:dev.db";

  const authToken =
    process.env.LIBSQL_AUTH_TOKEN ||
    process.env.DATABASE_AUTH_TOKEN;

  const adapter = new PrismaLibSql({
    url: databaseUrl,
    authToken: authToken || undefined,
  });

  return new PrismaClient({ adapter });
}

const prisma = createD1PrismaClient();

async function main() {
  console.log("开始播种数据库（D1）...");

  // ============================================
  // 1. 初始化管理员账户
  // ============================================
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!process.env.ADMIN_PASSWORD) {
    console.warn("⚠️ 警告: 未设置 ADMIN_PASSWORD 环境变量，使用默认密码 'admin123'");
  }

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: "admin" },
  });

  let admin;
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    admin = await prisma.adminUser.create({
      data: {
        username: "admin",
        password: hashedPassword,
        nickname: "博主",
      },
    });
    console.log(`管理员账户已创建: admin / ${adminPassword}`);
  } else {
    admin = existingAdmin;
    console.log(`管理员账户已存在: admin`);
  }

  // ============================================
  // 2. 初始化默认分类
  // ============================================
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "tech" },
      update: {},
      create: { name: "技术", slug: "tech", description: "技术文章", sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: "life" },
      update: {},
      create: { name: "生活", slug: "life", description: "生活随笔", sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: "notes" },
      update: {},
      create: { name: "笔记", slug: "notes", description: "学习笔记", sortOrder: 3 },
    }),
  ]);
  console.log(`分类已创建/更新: ${categories.map((c) => c.name).join(", ")}`);

  // ============================================
  // 3. 初始化默认标签
  // ============================================
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: "javascript" },
      update: {},
      create: { name: "JavaScript", slug: "javascript", color: "#F7DF1E" },
    }),
    prisma.tag.upsert({
      where: { slug: "typescript" },
      update: {},
      create: { name: "TypeScript", slug: "typescript", color: "#3178C6" },
    }),
    prisma.tag.upsert({
      where: { slug: "react" },
      update: {},
      create: { name: "React", slug: "react", color: "#61DAFB" },
    }),
    prisma.tag.upsert({
      where: { slug: "nextjs" },
      update: {},
      create: { name: "Next.js", slug: "nextjs", color: "#000000" },
    }),
    prisma.tag.upsert({
      where: { slug: "css" },
      update: {},
      create: { name: "CSS", slug: "css", color: "#264DE4" },
    }),
  ]);
  console.log(`标签已创建/更新: ${tags.map((t) => t.name).join(", ")}`);

  // ============================================
  // 4. 初始化默认页面
  // ============================================
  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "关于我",
      slug: "about",
      content: "# 关于我\n\n你好！这是一个基于 Next.js 的博客。",
      isDefault: true,
      sortOrder: 1,
    },
  });
  console.log("默认页面已创建: about");

  // ============================================
  // 5. 初始化默认友链
  // ============================================
  const existingFriendLink = await prisma.friendLink.findFirst({
    where: { url: "https://example.com" },
  });

  let friendLink;
  if (!existingFriendLink) {
    friendLink = await prisma.friendLink.create({
      data: {
        name: "示例网站",
        url: "https://example.com",
        description: "这是一个示例友链",
        isActive: true,
        sortOrder: 1,
      },
    });
    console.log(`默认友链已创建: ${friendLink.name}`);
  } else {
    friendLink = existingFriendLink;
    console.log(`默认友链已存在: ${friendLink.name}`);
  }

  // ============================================
  // 6. 初始化站点配置
  // ============================================
  const existingSettings = await prisma.siteSettings.findFirst();

  let siteSettings;
  if (!existingSettings) {
    siteSettings = await prisma.siteSettings.create({
      data: {
        siteName: "我的博客",
        siteDescription: "欢迎来到我的博客，分享技术与生活",
      },
    });
    console.log(`站点配置已初始化: ${siteSettings.siteName}`);
  } else {
    siteSettings = existingSettings;
    console.log(`站点配置已存在: ${siteSettings.siteName}`);
  }

  console.log("\n✅ 数据库播种完成！");
  console.log(`管理员登录信息: admin / ${adminPassword}`);
  console.log("\n请在生产环境及时修改默认密码！");
}

main()
  .catch((e) => {
    console.error("播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
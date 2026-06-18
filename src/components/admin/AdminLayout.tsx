"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Link2,
  Palette,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { label: "文章管理", href: "/admin/posts", icon: FileText },
  { label: "分类管理", href: "/admin/categories", icon: FolderOpen },
  { label: "标签管理", href: "/admin/tags", icon: Tags },
  { label: "页面管理", href: "/admin/pages", icon: FileText },
  { label: "友链管理", href: "/admin/friends", icon: Link2 },
  { divider: true },
  { label: "主题定制", href: "/admin/theme", icon: Palette },
  { label: "模块定制", href: "/admin/modules", icon: LayoutDashboard },
  { label: "导航定制", href: "/admin/navigation", icon: Menu },
  { divider: true },
  { label: "SEO 设置", href: "/admin/seo", icon: Settings },
  { label: "全局设置", href: "/admin/settings", icon: Settings },
  { label: "账号管理", href: "/admin/account", icon: Users },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    // 调用 logout API 清除 httpOnly cookie（客户端无法直接清除 httpOnly cookie）
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // API 调用失败时的兜底：尝试清除非 httpOnly 的同名 cookie
      // （httpOnly cookie 客户端清不掉，但保留此兜底无害）
      document.cookie = "admin_token=; Max-Age=0; path=/";
    }
    // 使用 window.location.href 强制完整页面导航
    window.location.href = "/admin/login";
  };

  return (
    <div className={styles.container}>
      {/* 侧边栏 */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            {!collapsed && <span className={styles.logoText}>博客管理</span>}
            {collapsed && <span className={styles.logoShort}>管</span>}
          </Link>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item, idx) =>
            "divider" in item ? (
              <div key={`divider-${idx}`} className={styles.divider} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${
                  (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href))
                    ? styles.active
                    : ""
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutButton} title="退出登录">
            <LogOut size={18} />
            {!collapsed && <span>退出</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className={styles.main}>
        {/* 顶部栏 */}
        <header className={styles.header}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={styles.toggleButton}
            aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <div className={styles.headerRight}>
            <Link href="/" target="_blank" className={styles.viewSite}>
              查看站点
            </Link>
          </div>
        </header>

        {/* 页面内容 */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
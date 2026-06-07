"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import styles from "./Navbar.module.css";

interface NavbarProps {
  siteName?: string;
  siteLogo?: string;
  navLinks?: { label: string; href: string }[];
  showSearch?: boolean;
  onSearchClick?: () => void;
}

export function Navbar({
  siteName = "我的博客",
  siteLogo,
  navLinks,
  showSearch = true,
  onSearchClick,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("auto");
    else setTheme("light");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const defaultNavLinks = [
    { label: "首页", href: "/" },
    { label: "分类", href: "/categories" },
    { label: "标签", href: "/tags" },
    { label: "友链", href: "/friends" },
    { label: "关于", href: "/about" },
  ];

  const links = navLinks?.length ? navLinks : defaultNavLinks;

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          {siteLogo ? (
            <Image
              src={siteLogo}
              alt={siteName}
              width={120}
              height={32}
              className={styles.logoImage}
              unoptimized
            />
          ) : (
            <span className={styles.logoText}>{siteName}</span>
          )}
        </Link>

        {/* 桌面端导航 */}
        <nav className={styles.desktopNav}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          {showSearch && (
            <button
              className={styles.iconButton}
              onClick={onSearchClick}
              aria-label="搜索"
            >
              <Search size={20} />
            </button>
          )}
          <button
            className={styles.iconButton}
            onClick={toggleTheme}
            aria-label="切换主题"
          >
            {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link href="/admin" className={styles.adminLink}>
            管理
          </Link>
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="菜单"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMobileMenuOpen && (
        <div id="mobile-menu" className={styles.mobileMenu}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileNavLink} ${pathname === link.href ? styles.active : ""}`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

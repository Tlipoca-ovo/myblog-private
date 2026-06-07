import Link from "next/link";
import Image from "next/image";
import type { FriendLink } from "@/types/blog";
import styles from "./Footer.module.css";

interface FooterProps {
  siteName?: string;
  siteDescription?: string;
  socialLinks?: { platform: string; url: string; icon?: string }[];
  friendLinks?: FriendLink[];
  copyright?: string;
}

export function Footer({
  siteName = "我的博客",
  siteDescription,
  socialLinks,
  friendLinks,
  copyright,
}: FooterProps) {
  const year = new Date().getFullYear();
  const defaultCopyright = `© ${year} ${siteName} All rights reserved.`;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* 关于 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>关于</h3>
          {siteDescription ? (
            <p className={styles.description}>{siteDescription}</p>
          ) : (
            <p className={styles.description}>
              这是一个使用 Next.js 构建的高度可定制博客模版。
            </p>
          )}
        </div>

        {/* 快速链接 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>快速链接</h3>
          <nav className={styles.links}>
            <Link href="/" className={styles.link}>首页</Link>
            <Link href="/categories" className={styles.link}>分类</Link>
            <Link href="/tags" className={styles.link}>标签</Link>
            <Link href="/about" className={styles.link}>关于</Link>
          </nav>
        </div>

        {/* 友链 */}
        {friendLinks && friendLinks.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>友链</h3>
            <div className={styles.friendLinks}>
              {friendLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.friendLink}
                  title={link.description}
                >
                  {link.logo ? (
                    <Image
                      src={link.logo}
                      alt={link.name}
                      width={20}
                      height={20}
                      className={styles.friendLogo}
                      unoptimized
                    />
                  ) : null}
                  <span>{link.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 社交媒体 */}
        {socialLinks && socialLinks.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>关注我</h3>
            <div className={styles.socialLinks}>
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 底部版权 */}
      <div className={styles.bottom}>
        <p className={styles.copyright}>{copyright || defaultCopyright}</p>
      </div>
    </footer>
  );
}

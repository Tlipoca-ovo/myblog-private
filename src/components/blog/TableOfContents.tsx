"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/types/blog";
import styles from "./TableOfContents.module.css";

interface TableOfContentsProps {
  content: string;
}

function extractTocItems(content: string): TocItem[] {
  const headingPattern = /<h([1-6])(?:\s[^>]*)?>(.*?)<\/h\1>/gi;
  return Array.from(content.matchAll(headingPattern), (match, index) => {
    const [heading, level, rawText] = match;
    const id = heading.match(/\sid=["']([^"']+)["']/i)?.[1] || `heading-${index}`;
    const text = rawText.replace(/<[^>]*>/g, "").trim();
    return { id, text, level: Number(level) };
  }).filter((item) => item.text.length > 0);
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const items = useMemo(() => extractTocItems(content), [content]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="文章目录">
      <h3 className={styles.title}>目录</h3>
      <ul className={styles.list}>
        {items.map((item) => (
          <li
            key={item.id}
            className={`${styles.item} ${item.level === 2 ? styles.level2 : item.level === 3 ? styles.level3 : styles.level4}`}
          >
            <a
              href={`#${item.id}`}
              className={`${styles.link} ${activeId === item.id ? styles.active : ""}`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";

import { useEffect, useState } from "react";
import styles from "./ReadingProgress.module.css";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article") || document.querySelector("main");
      if (!article) return;

      const articleHeight = article.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrolled = window.scrollY - article.offsetTop + windowHeight * 0.1;
      const total = articleHeight - windowHeight + windowHeight * 0.2;

      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.bar} style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="阅读进度" />
    </div>
  );
}

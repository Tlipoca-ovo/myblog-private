"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Save,
  Send,
  ArrowLeft,
} from "lucide-react";
import styles from "./PostEditor.module.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface PostData {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  categoryId: number | string;
  tagIds: number[];
  coverImage: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface PostEditorProps {
  mode: "create" | "edit";
  post?: PostData;
  categories: Category[];
  tags: Tag[];
}

export function PostEditor({ mode, post, categories, tags }: PostEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [published] = useState(post?.published ?? false);
  const [categoryId, setCategoryId] = useState(post?.categoryId || "");
  const [selectedTags, setSelectedTags] = useState<number[]>(post?.tagIds || []);
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const generateSlug = useCallback(() => {
    if (!title) return;
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9一-龥]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(base);
  }, [title]);

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) {
      setError("请输入文章标题");
      return;
    }
    if (!content.trim()) {
      setError("请输入文章内容");
      return;
    }

    setError("");
    setSaving(true);

    const payload = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      slug: slug.trim() || undefined,
      status: publish ? "published" : "draft",
      categoryId: categoryId || null,
      tagIds: selectedTags,
      coverImage: coverImage.trim() || null,
    };

    try {
      const url =
        mode === "create"
          ? "/api/posts"
          : `/api/posts/${post!.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "保存失败");
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <button
          onClick={() => router.push("/admin/posts")}
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          返回列表
        </button>

        <div className={styles.toolbarActions}>
          {error && (
            <span className={styles.error}>{error}</span>
          )}
          <button
            onClick={() => handleSave(false)}
            className={styles.saveButton}
            disabled={saving}
          >
            <Save size={18} />
            {saving ? "保存中..." : "保存草稿"}
          </button>
          <button
            onClick={() => handleSave(true)}
            className={styles.publishButton}
            disabled={saving}
          >
            <Send size={18} />
            {published ? "更新发布" : "发布文章"}
          </button>
        </div>
      </div>

      {/* 主编辑区 */}
      <div className={styles.editorLayout}>
        {/* 左侧：编辑器 */}
        <div className={styles.mainEditor}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="文章标题..."
            className={styles.titleInput}
          />

          <div className={styles.contentEditor}>
            <MDEditor
              value={content}
              onChange={(val) => setContent(val || "")}
              height="100%"
              preview="edit"
              data-color-mode="light"
            />
          </div>
        </div>

        {/* 右侧：设置面板 */}
        <div className={styles.sidebar}>
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>发布设置</h3>
            <div className={styles.panelField}>
              <label className={styles.panelLabel}>状态</label>
              <div className={styles.statusBadge}>
                {published ? "已发布" : "草稿"}
              </div>
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>分类</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={styles.panelSelect}
            >
              <option value="">选择分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>标签</h3>
            <div className={styles.tagList}>
              {tags.length === 0 ? (
                <p className={styles.noTags}>暂无标签</p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={`${styles.tagButton} ${
                      selectedTags.includes(tag.id) ? styles.tagSelected : ""
                    }`}
                  >
                    {tag.name}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>文章摘要</h3>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="输入文章摘要（可选）..."
              className={styles.panelTextarea}
              rows={3}
            />
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>永久链接</h3>
            <div className={styles.slugField}>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug"
                className={styles.panelInput}
              />
              <button
                type="button"
                onClick={generateSlug}
                className={styles.slugGenerate}
                title="从标题生成"
              >
                自动
              </button>
            </div>
          </div>

          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>封面图片 URL</h3>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/cover.jpg"
              className={styles.panelInput}
            />
            {coverImage && (
              <Image
                src={coverImage}
                alt="封面预览"
                width={400}
                height={120}
                className={styles.coverPreview}
                unoptimized
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

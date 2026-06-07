"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import styles from "./PageManager.module.css";

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
);

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
}

interface PageManagerProps {
  initialPages: Page[];
}

export function PageManager({ initialPages }: PageManagerProps) {
  const router = useRouter();
  const [pages] = useState(initialPages);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim() || !newSlug.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle.trim(), slug: newSlug.trim(), content: newContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewTitle("");
        setNewSlug("");
        setNewContent("");
        setIsCreating(false);
        router.refresh();
      } else {
        setError(data.error || "创建失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editTitle.trim() || !editSlug.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: editTitle.trim(), slug: editSlug.trim(), content: editContent }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingId(null);
        router.refresh();
      } else {
        setError(data.error || "更新失败");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个页面吗？")) return;
    const res = await fetch(`/api/pages/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  };

  const startEdit = (page: Page) => {
    setEditingId(page.id);
    setEditTitle(page.title);
    setEditSlug(page.slug);
    setEditContent(page.content);
  };

  return (
    <div className={styles.container}>
      {/* 新建 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{isCreating ? "新建页面" : "添加页面"}</h2>
          {!isCreating ? (
            <button onClick={() => setIsCreating(true)} className={styles.addButton}>
              <Plus size={18} />
              新建页面
            </button>
          ) : (
            <button onClick={() => setIsCreating(false)} className={styles.cancelButton}>取消</button>
          )}
        </div>

        {isCreating && (
          <div className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="页面标题"
              className={styles.titleInput}
            />
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="URL slug（如 about）"
              className={styles.input}
            />
            <div className={styles.editorWrapper}>
              <MDEditor value={newContent} onChange={(v) => setNewContent(v || "")} height={300} data-color-mode="light" />
            </div>
            <button onClick={handleCreate} disabled={saving} className={styles.saveButton}>
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        )}
      </div>

      {/* 列表 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>页面列表</h2>
          <span className={styles.count}>{pages.length} 个页面</span>
        </div>

        {pages.length === 0 ? (
          <div className={styles.empty}>暂无页面</div>
        ) : (
          <div className={styles.list}>
            {pages.map((page) => (
              <div key={page.id} className={styles.item}>
                {editingId === page.id ? (
                  <div className={styles.editForm}>
                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={styles.titleInput} />
                    <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="slug" className={styles.input} />
                    <div className={styles.editorWrapper}>
                      <MDEditor value={editContent} onChange={(v) => setEditContent(v || "")} height={250} data-color-mode="light" />
                    </div>
                    <div className={styles.editActions}>
                      <button onClick={() => handleUpdate(page.id)} disabled={saving} className={styles.saveButton}>{saving ? "保存中..." : "保存"}</button>
                      <button onClick={() => setEditingId(null)} className={styles.cancelButton}>取消</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{page.title}</span>
                      <span className={styles.itemSlug}>/{page.slug}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <a href={`/${page.slug}`} target="_blank" className={styles.actionBtn} title="查看"><Eye size={16} /></a>
                      <button onClick={() => startEdit(page)} className={styles.actionBtn} title="编辑"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(page.id)} className={`${styles.actionBtn} ${styles.danger}`} title="删除"><Trash2 size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
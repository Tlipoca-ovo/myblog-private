"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import styles from "./TagManager.module.css";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface TagManagerProps {
  initialTags: Tag[];
}

export function TagManager({ initialTags }: TagManagerProps) {
  const router = useRouter();
  const [tags] = useState(initialTags);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName.trim(), slug: newSlug.trim() || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewName("");
        setNewSlug("");
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
    if (!editName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: editName.trim(), slug: editSlug.trim() || undefined }),
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
    if (!confirm("确定要删除这个标签吗？")) return;
    const res = await fetch(`/api/tags/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  };

  return (
    <div className={styles.container}>
      {/* 新建 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>添加标签</h2>
          {!isCreating ? (
            <button onClick={() => setIsCreating(true)} className={styles.addButton}>
              <Plus size={18} />
              新建标签
            </button>
          ) : (
            <button onClick={() => setIsCreating(false)} className={styles.cancelButton}>取消</button>
          )}
        </div>

        {isCreating && (
          <div className={styles.formRow}>
            {error && <div className={styles.error}>{error}</div>}
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="标签名称"
              className={styles.input}
            />
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="slug（可选）"
              className={styles.input}
            />
            <button onClick={handleCreate} disabled={saving} className={styles.saveButton}>
              {saving ? "保存中..." : "保存"}
            </button>
          </div>
        )}
      </div>

      {/* 列表 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>标签列表</h2>
          <span className={styles.count}>{tags.length} 个标签</span>
        </div>

        {tags.length === 0 ? (
          <div className={styles.empty}>暂无标签</div>
        ) : (
          <div className={styles.tagCloud}>
            {tags.map((tag) => (
              <div key={tag.id} className={styles.tagItem}>
                {editingId === tag.id ? (
                  <div className={styles.editRow}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={styles.input}
                    />
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      placeholder="slug"
                      className={styles.input}
                    />
                    <button onClick={() => handleUpdate(tag.id)} disabled={saving} className={styles.saveButton}>保存</button>
                    <button onClick={() => setEditingId(null)} className={styles.cancelButton}>取消</button>
                  </div>
                ) : (
                  <div className={styles.tagChip}>
                    <Tag size={14} />
                    <span>{tag.name}</span>
                    <button onClick={() => { setEditingId(tag.id); setEditName(tag.name); setEditSlug(tag.slug); }} className={styles.actionBtn}><Edit size={14} /></button>
                    <button onClick={() => handleDelete(tag.id)} className={`${styles.actionBtn} ${styles.danger}`}><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
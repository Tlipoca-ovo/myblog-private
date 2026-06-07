"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import styles from "./CategoryManager.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories] = useState(initialCategories);
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
      const res = await fetch("/api/categories", {
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
      const res = await fetch(`/api/categories/${id}`, {
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
    if (!confirm("确定要删除这个分类吗？文章不会被删除。")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  return (
    <div className={styles.container}>
      {/* 新建表单 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{isCreating ? "新建分类" : "添加分类"}</h2>
          {!isCreating ? (
            <button onClick={() => setIsCreating(true)} className={styles.addButton}>
              <Plus size={18} />
              新建分类
            </button>
          ) : (
            <button onClick={() => setIsCreating(false)} className={styles.cancelButton}>取消</button>
          )}
        </div>

        {isCreating && (
          <div className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formRow}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="分类名称"
                className={styles.input}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="slug（可选，自动生成）"
                className={styles.input}
              />
              <button onClick={handleCreate} disabled={saving} className={styles.saveButton}>
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 分类列表 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>分类列表</h2>
          <span className={styles.count}>{categories.length} 个分类</span>
        </div>

        {categories.length === 0 ? (
          <div className={styles.empty}>暂无分类</div>
        ) : (
          <div className={styles.list}>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.item}>
                <div className={styles.itemIcon}>
                  <GripVertical size={16} />
                </div>

                {editingId === cat.id ? (
                  <div className={styles.editForm}>
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
                    <button onClick={() => handleUpdate(cat.id)} disabled={saving} className={styles.saveButton}>
                      保存
                    </button>
                    <button onClick={() => setEditingId(null)} className={styles.cancelButton}>
                      取消
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{cat.name}</span>
                      <span className={styles.itemSlug}>/{cat.slug}</span>
                    </div>
                    <div className={styles.itemActions}>
                      <button onClick={() => startEdit(cat)} className={styles.actionBtn} title="编辑">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className={`${styles.actionBtn} ${styles.danger}`} title="删除">
                        <Trash2 size={16} />
                      </button>
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
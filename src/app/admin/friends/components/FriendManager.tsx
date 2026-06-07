"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import styles from "./FriendManager.module.css";

interface FriendLink {
  id: number;
  name: string;
  url: string;
  description?: string | null;
  avatar?: string | null;
  sortOrder: number;
}

interface FriendManagerProps {
  initialFriends: FriendLink[];
}

export function FriendManager({ initialFriends }: FriendManagerProps) {
  const router = useRouter();
  const [friends] = useState(initialFriends);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName.trim(),
          url: newUrl.trim(),
          description: newDescription.trim() || undefined,
          avatar: newAvatar.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewName("");
        setNewUrl("");
        setNewDescription("");
        setNewAvatar("");
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
    if (!editName.trim() || !editUrl.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/friends/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName.trim(),
          url: editUrl.trim(),
          description: editDescription.trim() || undefined,
          avatar: editAvatar.trim() || undefined,
        }),
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
    if (!confirm("确定要删除这个友链吗？")) return;
    const res = await fetch(`/api/friends/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("删除失败");
    }
  };

  const startEdit = (friend: FriendLink) => {
    setEditingId(friend.id);
    setEditName(friend.name);
    setEditUrl(friend.url);
    setEditDescription(friend.description || "");
    setEditAvatar(friend.avatar || "");
  };

  return (
    <div className={styles.container}>
      {/* 新建 */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>{isCreating ? "添加友链" : "新建友链"}</h2>
          {!isCreating ? (
            <button onClick={() => setIsCreating(true)} className={styles.addButton}>
              <Plus size={18} />
              新建友链
            </button>
          ) : (
            <button onClick={() => setIsCreating(false)} className={styles.cancelButton}>取消</button>
          )}
        </div>

        {isCreating && (
          <div className={styles.form}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGrid}>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="网站名称" className={styles.input} />
              <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="网站 URL" className={styles.input} />
              <input type="url" value={newAvatar} onChange={(e) => setNewAvatar(e.target.value)} placeholder="头像 URL（可选）" className={styles.input} />
              <input type="text" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="网站描述（可选）" className={`${styles.input} ${styles.fullWidth}`} />
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
          <h2 className={styles.cardTitle}>友链列表</h2>
          <span className={styles.count}>{friends.length} 个友链</span>
        </div>

        {friends.length === 0 ? (
          <div className={styles.empty}>暂无友链</div>
        ) : (
          <div className={styles.list}>
            {friends.map((friend) => (
              <div key={friend.id} className={styles.item}>
                {editingId === friend.id ? (
                  <div className={styles.editForm}>
                    <div className={styles.formGrid}>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="网站名称" className={styles.input} />
                      <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} placeholder="URL" className={styles.input} />
                      <input type="url" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="头像 URL" className={styles.input} />
                      <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="描述" className={`${styles.input} ${styles.fullWidth}`} />
                    </div>
                    <div className={styles.editActions}>
                      <button onClick={() => handleUpdate(friend.id)} disabled={saving} className={styles.saveButton}>{saving ? "保存中..." : "保存"}</button>
                      <button onClick={() => setEditingId(null)} className={styles.cancelButton}>取消</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.itemLeft}>
                      {friend.avatar && (
                        <Image unoptimized src={friend.avatar} alt={friend.name} width={36} height={36} className={styles.avatar} />
                      )}
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{friend.name}</span>
                        <a href={friend.url} target="_blank" rel="noopener noreferrer" className={styles.itemUrl}>
                          {friend.url}
                          <ExternalLink size={12} />
                        </a>
                        {friend.description && (
                          <span className={styles.itemDesc}>{friend.description}</span>
                        )}
                      </div>
                    </div>
                    <div className={styles.itemActions}>
                      <button onClick={() => startEdit(friend)} className={styles.actionBtn} title="编辑">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(friend.id)} className={`${styles.actionBtn} ${styles.danger}`} title="删除">
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
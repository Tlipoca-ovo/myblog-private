"use client";

import { useState } from "react";
import { Save, Shield } from "lucide-react";
import styles from "./AccountEditor.module.css";

export function AccountEditor() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "请填写所有字段" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "新密码长度不能少于 6 位" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "两次输入的密码不一致" });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/accounts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "密码修改成功" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "修改失败" });
      }
    } catch {
      setMessage({ type: "error", text: "网络错误，请稍后重试" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            <Shield size={18} />
            <h2 className={styles.cardTitle}>修改密码</h2>
          </div>
        </div>

        <form onSubmit={handleSave} className={styles.form}>
          <label className={styles.field}>
            <span>当前密码</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="请输入当前密码"
              className={styles.input}
              autoComplete="current-password"
            />
          </label>

          <label className={styles.field}>
            <span>新密码</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少 6 位）"
              className={styles.input}
              autoComplete="new-password"
            />
          </label>

          <label className={styles.field}>
            <span>确认新密码</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              className={styles.input}
              autoComplete="new-password"
            />
          </label>

          {message && (
            <div className={`${styles.message} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" disabled={saving} className={styles.saveButton}>
              <Save size={18} />
              {saving ? "保存中..." : "修改密码"}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.securityTip}>
        <h3>安全建议</h3>
        <ul>
          <li>密码长度至少 8 位，包含字母和数字</li>
          <li>不要在多个网站使用相同的密码</li>
          <li>定期更换密码</li>
          <li>不要在公共电脑上保存密码</li>
        </ul>
      </div>
    </div>
  );
}

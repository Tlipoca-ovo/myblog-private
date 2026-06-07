"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import styles from "./PostList.module.css";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  published: boolean;
  createdAt: Date;
  category: Category | null;
  tags: { id: number; name: string; slug: string }[];
}

interface PostListProps {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  categories: Category[];
  currentCategory: string;
  keyword: string;
}

export function PostList({
  posts,
  total,
  page,
  pageSize,
  categories,
  currentCategory,
  keyword,
}: PostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(keyword);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (keywordInput) {
      params.set("keyword", keywordInput);
    } else {
      params.delete("keyword");
    }
    params.set("page", "1");
    router.push(`/admin/posts?${params.toString()}`);
  };

  const handleCategoryFilter = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`/admin/posts?${params.toString()}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这篇文章吗？此操作不可恢复。")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 篇文章吗？此操作不可恢复。`)) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/posts/${id}`, { method: "DELETE", credentials: "include" })
        )
      );
      setSelectedIds([]);
      router.refresh();
    } catch (e) {
      console.error("批量删除失败", e);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === posts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(posts.map((p) => p.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.container}>
      {/* 搜索和筛选 */}
      <div className={styles.toolbar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchInput}>
            <Search size={16} />
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder="搜索文章标题..."
              className={styles.input}
            />
            {keywordInput && (
              <button
                type="button"
                onClick={() => {
                  setKeywordInput("");
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("keyword");
                  router.push(`/admin/posts?${params.toString()}`);
                }}
                className={styles.clearButton}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className={styles.searchButton}>
            搜索
          </button>
        </form>

        <div className={styles.filters}>
          <Filter size={16} />
          <select
            value={currentCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 批量操作 */}
      {selectedIds.length > 0 && (
        <div className={styles.bulkActions}>
          <span>已选择 {selectedIds.length} 篇</span>
          <button onClick={handleBulkDelete} className={styles.deleteButton}>
            <Trash2 size={16} />
            批量删除
          </button>
        </div>
      )}

      {/* 表格 */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === posts.length && posts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>标题</th>
              <th>标签</th>
              <th>发布日期</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  暂无文章
                </td>
              </tr>
            ) : (
              posts.map((row) => (
                <tr key={row.id}>
                  <td className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelect(row.id)}
                    />
                  </td>
                  <td>
                    <div className={styles.titleCell}>
                      <Link
                        href={`/admin/posts/${row.id}`}
                        className={styles.titleLink}
                      >
                        {row.title}
                      </Link>
                      <div className={styles.meta}>
                        {row.category && (
                          <span className={styles.category}>{row.category.name}</span>
                        )}
                        {!row.published && (
                          <span className={styles.draft}>草稿</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.tags}>
                      {row.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className={styles.tag}>
                          {tag.name}
                        </span>
                      ))}
                      {row.tags.length > 3 && (
                        <span className={styles.tagMore}>+{row.tags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.date}>
                      {new Date(row.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/admin/posts/${row.id}`}
                        className={styles.actionButton}
                        title="编辑"
                      >
                        <Edit size={16} />
                      </Link>
                      <Link
                        href={`/posts/${row.slug}`}
                        target="_blank"
                        className={styles.actionButton}
                        title="查看"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className={`${styles.actionButton} ${styles.danger}`}
                        title="删除"
                        disabled={deletingId === row.id}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {total > pageSize && (
        <div className={styles.pagination}>
          {page > 1 && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page - 1));
                router.push(`/admin/posts?${params.toString()}`);
              }}
              className={styles.pageButton}
            >
              上一页
            </button>
          )}
          <span className={styles.pageInfo}>
            第 {page} / {Math.ceil(total / pageSize)} 页，共 {total} 篇
          </span>
          {page < Math.ceil(total / pageSize) && (
            <button
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page + 1));
                router.push(`/admin/posts?${params.toString()}`);
              }}
              className={styles.pageButton}
            >
              下一页
            </button>
          )}
        </div>
      )}
    </div>
  );
}
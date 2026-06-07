"use client";

import { useState } from "react";
import Image from "next/image";
import { MessageSquare, Send } from "lucide-react";
import styles from "./Comments.module.css";

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  avatar?: string;
}

interface CommentsProps {
  postId: string;
  comments?: Comment[];
}

export function Comments({ postId, comments = [] }: CommentsProps) {
  const [commentList, setCommentList] = useState<Comment[]>(comments);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    // TODO: 调用评论 API
    const comment: Comment = {
      id: Date.now().toString(),
      author: authorName.trim(),
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setCommentList([...commentList, comment]);
    setNewComment("");
    setIsSubmitting(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className={styles.comments} data-post-id={postId}>
      <h2 className={styles.title}>
        <MessageSquare size={20} />
        评论 ({commentList.length})
      </h2>

      {/* 评论列表 */}
      {commentList.length > 0 ? (
        <div className={styles.commentList}>
          {commentList.map((comment) => (
            <div key={comment.id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <div className={styles.avatar}>
                  {comment.avatar ? (
                    <Image
                      src={comment.avatar}
                      alt={comment.author}
                      width={36}
                      height={36}
                      unoptimized
                    />
                  ) : (
                    <span>{comment.author[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.commentMeta}>
                  <span className={styles.author}>{comment.author}</span>
                  <span className={styles.date}>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
              <p className={styles.commentContent}>
                {comment.content
                  .replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;")}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>暂无评论，来抢沙发吧！</p>
      )}

      {/* 评论表单 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <h3 className={styles.formTitle}>发表评论</h3>
        <div className={styles.formRow}>
          <label htmlFor="comment-author" className="sr-only">昵称</label>
          <input
            id="comment-author"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="昵称"
            className={styles.input}
            required
          />
        </div>
        <label htmlFor="comment-content" className="sr-only">评论内容</label>
        <textarea
          id="comment-content"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="写下你的评论..."
          className={styles.textarea}
          rows={4}
          required
        />
        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim() || !authorName.trim()}
            className={styles.submitButton}
          >
            <Send size={16} />
            发布评论
          </button>
        </div>
      </form>
    </section>
  );
}

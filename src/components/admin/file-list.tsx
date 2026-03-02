"use client";

import { useState } from "react";
import { Archive, Category } from "@/lib/types";
import { deleteArchive, reorderArchives } from "@/app/admin/actions";

interface FileListProps {
  archives: Archive[];
  categories: Category[];
  onEdit: (archive: Archive) => void;
  onRefresh: () => Promise<void>;
}

export default function FileList({
  archives,
  categories,
  onEdit,
  onRefresh,
}: FileListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 문서를 삭제하시겠습니까?`)) return;
    setDeleting(id);
    try {
      await deleteArchive(id);
      await onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("삭제에 실패했습니다.");
    } finally {
      setDeleting(null);
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    if (reordering) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= archives.length) return;

    setReordering(true);
    try {
      await reorderArchives(
        archives[index].id,
        archives[index].displayOrder,
        archives[swapIndex].id,
        archives[swapIndex].displayOrder
      );
      await onRefresh();
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setReordering(false);
    }
  }

  if (archives.length === 0) {
    return <p className="admin-empty">등록된 문서가 없습니다.</p>;
  }

  return (
    <div className="admin-list">
      {archives.map((archive, i) => {
        const cat = categoryMap[archive.categoryId];
        return (
          <div key={archive.id} className="admin-list-item">
            <div className="admin-reorder-btns">
              <button
                onClick={() => handleMove(i, "up")}
                disabled={i === 0 || reordering}
                className="admin-reorder-btn"
              >
                ▲
              </button>
              <button
                onClick={() => handleMove(i, "down")}
                disabled={i === archives.length - 1 || reordering}
                className="admin-reorder-btn"
              >
                ▼
              </button>
            </div>

            <div className="admin-item-body">
              <div className="admin-item-title-row">
                {cat && (
                  <span
                    className="admin-tag"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </span>
                )}
                <span className="admin-item-title">{archive.title}</span>
              </div>
              <div className="admin-item-meta">
                {archive.slug} · {archive.date} ·{" "}
                {(archive.size / 1024).toFixed(1)}KB
              </div>
            </div>

            <div className="admin-item-actions">
              <button onClick={() => onEdit(archive)} className="admin-action-btn">
                수정
              </button>
              <button
                onClick={() => handleDelete(archive.id, archive.title)}
                disabled={deleting === archive.id}
                className="admin-action-btn danger"
              >
                {deleting === archive.id ? "..." : "삭제"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

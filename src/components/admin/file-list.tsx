"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Category } from "@/lib/types";
import { deleteArchive, reorderArchives } from "@/app/admin/actions";

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    const [datePart, timePart] = dateStr.split("T");
    return `${datePart} ${timePart}`;
  }
  return dateStr;
}

interface FileListProps {
  archives: Archive[];
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export default function FileList({
  archives,
  categories,
  onRefresh,
}: FileListProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  async function handleDelete(id: string) {
    setDeleting(id);
    setConfirmDeleteId(null);
    try {
      await deleteArchive(id);
      await onRefresh();
    } catch (err) {
      console.error("Delete failed:", err);
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
                {archive.slug} · {formatDate(archive.date)} ·{" "}
                {(archive.size / 1024).toFixed(1)}KB
              </div>
            </div>

            <div className="admin-item-actions">
              <button
                onClick={() => router.push(`/admin/edit/${archive.id}`)}
                className="admin-action-btn"
              >
                수정
              </button>
              {confirmDeleteId === archive.id ? (
                <>
                  <button onClick={() => handleDelete(archive.id)} disabled={deleting === archive.id} className="admin-action-btn danger">
                    {deleting === archive.id ? "..." : "확인"}
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="admin-action-btn muted">
                    취소
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(archive.id)}
                  disabled={deleting === archive.id}
                  className="admin-action-btn danger"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

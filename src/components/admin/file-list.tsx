"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { Archive, Category } from "@/lib/types";

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

  const categoryMap = Object.fromEntries(
    categories.map((c) => [c.id, c])
  );

  async function handleDelete(id: string, title: string) {
    if (!confirm(`"${title}" 문서를 삭제하시겠습니까?`)) return;
    setDeleting(id);
    try {
      await deleteDoc(doc(db, "archives", id));
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
      const batch = writeBatch(db);
      batch.update(doc(db, "archives", archives[index].id), {
        displayOrder: archives[swapIndex].displayOrder,
      });
      batch.update(doc(db, "archives", archives[swapIndex].id), {
        displayOrder: archives[index].displayOrder,
      });
      await batch.commit();
      await onRefresh();
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setReordering(false);
    }
  }

  if (archives.length === 0) {
    return (
      <p className="text-[var(--muted)] text-[0.9rem] text-center py-8">
        등록된 문서가 없습니다.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {archives.map((archive, i) => {
        const cat = categoryMap[archive.categoryId];
        return (
          <div
            key={archive.id}
            className="flex items-center gap-3 px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card-bg)]"
          >
            <div className="flex flex-col gap-1 mr-1">
              <button
                onClick={() => handleMove(i, "up")}
                disabled={i === 0 || reordering}
                className="text-[0.7rem] text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-30 cursor-pointer leading-none"
                title="위로"
              >
                ▲
              </button>
              <button
                onClick={() => handleMove(i, "down")}
                disabled={i === archives.length - 1 || reordering}
                className="text-[0.7rem] text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-30 cursor-pointer leading-none"
                title="아래로"
              >
                ▼
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {cat && (
                  <span
                    className="text-[0.7rem] px-1.5 py-0.5 rounded-full text-white leading-none"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </span>
                )}
                <span className="text-[0.9rem] truncate font-medium">
                  {archive.title}
                </span>
              </div>
              <div className="text-[0.75rem] text-[var(--muted)]">
                {archive.slug} · {archive.date} ·{" "}
                {(archive.size / 1024).toFixed(1)}KB
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onEdit(archive)}
                className="text-[0.8rem] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer underline"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(archive.id, archive.title)}
                disabled={deleting === archive.id}
                className="text-[0.8rem] text-red-500 hover:text-red-700 cursor-pointer underline disabled:opacity-50"
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

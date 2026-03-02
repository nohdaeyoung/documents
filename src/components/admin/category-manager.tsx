"use client";

import { useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { Category } from "@/lib/types";

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => Promise<void>;
}

const DEFAULT_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function CategoryManager({
  categories,
  onRefresh,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [customId, setCustomId] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setLabel(cat.label);
    setColor(cat.color);
  }

  function cancelEdit() {
    setEditingId(null);
    setLabel("");
    setColor(DEFAULT_COLORS[0]);
    setCustomId("");
    setShowAdd(false);
  }

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), {
          label: label.trim(),
          color,
        });
      } else {
        const docId = customId.trim() || label.trim().toLowerCase().replace(/\s+/g, "-");
        await addDoc(collection(db, "categories"), {
          label: label.trim(),
          color,
          displayOrder: categories.length,
          createdAt: serverTimestamp(),
        });
        // If custom ID desired, we use setDoc instead
        // But addDoc auto-generates ID which is fine
        void docId; // unused for now
      }
      cancelEdit();
      await onRefresh();
    } catch (err) {
      console.error("Save category failed:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, catLabel: string) {
    if (!confirm(`"${catLabel}" 카테고리를 삭제하시겠습니까?`)) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      await onRefresh();
    } catch (err) {
      console.error("Delete category failed:", err);
      alert("삭제에 실패했습니다.");
    }
  }

  async function handleMove(index: number, direction: "up" | "down") {
    if (reordering) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) return;

    setReordering(true);
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "categories", categories[index].id), {
        displayOrder: categories[swapIndex].displayOrder,
      });
      batch.update(doc(db, "categories", categories[swapIndex].id), {
        displayOrder: categories[index].displayOrder,
      });
      await batch.commit();
      await onRefresh();
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            cancelEdit();
            setShowAdd(true);
          }}
          className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-[0.85rem] cursor-pointer hover:opacity-90"
        >
          + 새 카테고리
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--card-bg)]"
          >
            <div className="flex flex-col gap-1 mr-1">
              <button
                onClick={() => handleMove(i, "up")}
                disabled={i === 0 || reordering}
                className="text-[0.7rem] text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-30 cursor-pointer leading-none"
              >
                ▲
              </button>
              <button
                onClick={() => handleMove(i, "down")}
                disabled={i === categories.length - 1 || reordering}
                className="text-[0.7rem] text-[var(--muted)] hover:text-[var(--fg)] disabled:opacity-30 cursor-pointer leading-none"
              >
                ▼
              </button>
            </div>

            {editingId === cat.id ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="flex-1 px-2 py-1 border border-[var(--border)] rounded bg-[var(--card-bg)] text-[var(--fg)] outline-none text-[0.85rem]"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-[0.8rem] text-[var(--fg)] cursor-pointer underline"
                >
                  저장
                </button>
                <button
                  onClick={cancelEdit}
                  className="text-[0.8rem] text-[var(--muted)] cursor-pointer underline"
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-[0.9rem]">{cat.label}</span>
                  <span className="text-[0.75rem] text-[var(--muted)]">
                    ({cat.id})
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-[0.8rem] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer underline"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id, cat.label)}
                    className="text-[0.8rem] text-red-500 hover:text-red-700 cursor-pointer underline"
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="mt-4 p-4 border border-[var(--border)] rounded-lg bg-[var(--card-bg)]">
          <h3 className="text-[0.9rem] font-medium mb-3">새 카테고리</h3>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="카테고리 이름"
              className="flex-1 px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none text-[0.85rem]"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={saving || !label.trim()}
              className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-[0.85rem] cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "..." : "추가"}
            </button>
            <button
              onClick={cancelEdit}
              className="text-[0.8rem] text-[var(--muted)] cursor-pointer underline"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

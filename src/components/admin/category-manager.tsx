"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/app/admin/actions";

const DEFAULT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4",
];

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => Promise<void>;
}

export default function CategoryManager({ categories, onRefresh }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
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
    setShowAdd(false);
  }

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, { label: label.trim(), color });
      } else {
        await createCategory({
          label: label.trim(),
          color,
          displayOrder: categories.length,
        });
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
      await deleteCategory(id);
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
      await reorderCategories(
        categories[index].id,
        categories[index].displayOrder,
        categories[swapIndex].id,
        categories[swapIndex].displayOrder
      );
      await onRefresh();
    } catch (err) {
      console.error("Reorder failed:", err);
    } finally {
      setReordering(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <button
          onClick={() => { cancelEdit(); setShowAdd(true); }}
          className="admin-btn-primary"
        >
          + 새 카테고리
        </button>
      </div>

      <div className="admin-list">
        {categories.map((cat, i) => (
          <div key={cat.id} className="admin-list-item">
            <div className="admin-reorder-btns">
              <button onClick={() => handleMove(i, "up")} disabled={i === 0 || reordering} className="admin-reorder-btn">▲</button>
              <button onClick={() => handleMove(i, "down")} disabled={i === categories.length - 1 || reordering} className="admin-reorder-btn">▼</button>
            </div>

            {editingId === cat.id ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker" />
                <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className="form-input" style={{ flex: 1 }} autoFocus />
                <button onClick={handleSave} disabled={saving} className="admin-action-btn">저장</button>
                <button onClick={cancelEdit} className="admin-action-btn muted">취소</button>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="cat-dot" style={{ backgroundColor: cat.color }} />
                  <span style={{ fontSize: "0.9rem" }}>{cat.label}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({cat.id})</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startEdit(cat)} className="admin-action-btn">수정</button>
                  <button onClick={() => handleDelete(cat.id, cat.label)} className="admin-action-btn danger">삭제</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="admin-add-form">
          <h3 style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "12px" }}>새 카테고리</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker" />
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="카테고리 이름" className="form-input" style={{ flex: 1 }} autoFocus />
            <button onClick={handleSave} disabled={saving || !label.trim()} className="admin-btn-primary">
              {saving ? "..." : "추가"}
            </button>
            <button onClick={cancelEdit} className="admin-action-btn muted">취소</button>
          </div>
        </div>
      )}
    </div>
  );
}

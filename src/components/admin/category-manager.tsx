"use client";

import { useState, useMemo } from "react";
import { Archive, Category } from "@/lib/types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  renameCategoryId,
} from "@/app/admin/actions";

const DEFAULT_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4",
];

interface CategoryManagerProps {
  categories: Category[];
  archives: Archive[];
  onRefresh: () => Promise<void>;
}

export default function CategoryManager({ categories, archives, onRefresh }: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [editNewId, setEditNewId] = useState(""); // editable ID for existing category
  const [customId, setCustomId] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Compute archive count per category
  const archiveCounts = useMemo(() => {
    return archives.reduce((acc, archive) => {
      if (archive.categoryId) {
        acc[archive.categoryId] = (acc[archive.categoryId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [archives]);

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setLabel(cat.label);
    setColor(cat.color);
    setEditNewId(cat.id);
  }

  function cancelEdit() {
    setEditingId(null);
    setLabel("");
    setColor(DEFAULT_COLORS[0]);
    setEditNewId("");
    setCustomId("");
    setShowAdd(false);
  }

  async function handleSave() {
    if (!label.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        const trimmedNewId = editNewId.trim();
        if (trimmedNewId && trimmedNewId !== editingId) {
          // ID changed: rename/migrate
          const count = archiveCounts[editingId] ?? 0;
          const confirmed = count === 0 || window.confirm(
            `ID를 "${editingId}" → "${trimmedNewId}"로 변경하면 관련 아카이브 ${count}개도 업데이트됩니다. 계속할까요?`
          );
          if (!confirmed) { setSaving(false); return; }
          await renameCategoryId(editingId, trimmedNewId, label.trim(), color);
        } else {
          await updateCategory(editingId, { label: label.trim(), color });
        }
      } else {
        await createCategory({
          label: label.trim(),
          color,
          displayOrder: categories.length,
          id: customId.trim() || undefined,
        });
      }
      cancelEdit();
      await onRefresh();
    } catch (err) {
      console.error("Save category failed:", err);
      alert(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDeleteId(null);
    try {
      await deleteCategory(id);
      await onRefresh();
    } catch (err) {
      console.error("Delete category failed:", err);
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
              /* ── Edit form ── */
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker" />
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="form-input"
                    style={{ flex: 1, minWidth: "120px" }}
                    autoFocus
                    placeholder="카테고리 이름"
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>ID:</span>
                    <input
                      type="text"
                      value={editNewId}
                      onChange={(e) => setEditNewId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                      className="form-input"
                      style={{
                        width: "120px",
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        borderColor: editNewId !== cat.id ? "var(--accent, #f59e0b)" : undefined,
                      }}
                      title="영문·숫자·-·_ 만 사용 가능. 변경 시 관련 아카이브도 업데이트됩니다."
                    />
                    {editNewId !== cat.id && editNewId.trim() && (
                      <span style={{ fontSize: "0.72rem", color: "var(--accent, #f59e0b)", whiteSpace: "nowrap" }}>
                        ⚠ 변경됨
                      </span>
                    )}
                  </div>
                  <button onClick={handleSave} disabled={saving} className="admin-action-btn">저장</button>
                  <button onClick={cancelEdit} className="admin-action-btn muted">취소</button>
                </div>
                {editNewId !== cat.id && editNewId.trim() && (
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)", margin: 0 }}>
                    ⚠ ID 변경 시 아카이브 {archiveCounts[cat.id] ?? 0}개의 categoryId가 자동 업데이트됩니다.
                  </p>
                )}
              </div>
            ) : (
              /* ── Display row ── */
              <>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                  <span className="cat-dot" style={{ backgroundColor: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{cat.label}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({cat.id})</span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      background: "var(--bg-subtle, rgba(0,0,0,0.04))",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      border: "1px solid var(--border)",
                      flexShrink: 0,
                    }}
                  >
                    {archiveCounts[cat.id] ?? 0}개
                  </span>
                  <a
                    href={`/category/${cat.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="카테고리 페이지 열기"
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      textDecoration: "none",
                      flexShrink: 0,
                      opacity: 0.7,
                    }}
                  >
                    ↗
                  </a>
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                  <button onClick={() => startEdit(cat)} className="admin-action-btn">수정</button>
                  {confirmDeleteId === cat.id ? (
                    <>
                      <button onClick={() => handleDelete(cat.id)} className="admin-action-btn danger">확인</button>
                      <button onClick={() => setConfirmDeleteId(null)} className="admin-action-btn muted">취소</button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(cat.id)} className="admin-action-btn danger">삭제</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="admin-add-form">
          <h3 style={{ fontSize: "0.9rem", fontWeight: 500, marginBottom: "12px" }}>새 카테고리</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="color-picker" />
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="카테고리 이름 *"
              className="form-input"
              style={{ flex: 1, minWidth: "120px" }}
              autoFocus
            />
            <input
              type="text"
              value={customId}
              onChange={(e) => setCustomId(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
              placeholder="ID (선택, 예: talk)"
              className="form-input"
              style={{ width: "150px" }}
              title="영문·숫자·-·_ 만 사용 가능. 비우면 자동 생성됩니다."
            />
            <button onClick={handleSave} disabled={saving || !label.trim()} className="admin-btn-primary">
              {saving ? "..." : "추가"}
            </button>
            <button onClick={cancelEdit} className="admin-action-btn muted">취소</button>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "6px" }}>
            * ID는 URL에 사용됩니다 (예: /category/talk). 비우면 자동 생성됩니다.
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Archive, Category } from "@/lib/types";
import { createArchive, updateArchive } from "@/app/admin/actions";

interface FileFormProps {
  archive: Archive | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}

export default function FileForm({
  archive,
  categories,
  onClose,
  onSaved,
}: FileFormProps) {
  const isEdit = archive !== null;
  const [title, setTitle] = useState(archive?.title ?? "");
  const [slug, setSlug] = useState(archive?.slug ?? "");
  const [categoryId, setCategoryId] = useState(
    archive?.categoryId ?? categories[0]?.id ?? ""
  );
  const [date, setDate] = useState(
    archive?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [contentHtml, setContentHtml] = useState(archive?.contentHtml ?? "");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!slug) setSlug(file.name.replace(/\.html?$/i, ""));
    if (!title)
      setTitle(file.name.replace(/\.html?$/i, "").replace(/[_-]/g, " "));
    const reader = new FileReader();
    reader.onload = (ev) => setContentHtml(ev.target?.result as string);
    reader.readAsText(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !contentHtml.trim()) {
      alert("제목, slug, HTML 콘텐츠는 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        await updateArchive(archive.id, {
          title: title.trim(),
          slug: slug.trim(),
          categoryId,
          contentHtml,
          date,
        });
      } else {
        await createArchive({
          title: title.trim(),
          slug: slug.trim(),
          categoryId,
          contentHtml,
          date,
        });
      }
      await onSaved();
      onClose();
    } catch (err) {
      console.error("Save failed:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? "문서 수정" : "새 문서 등록"}</h2>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {!isEdit && (
            <div className="form-group">
              <label className="form-label">HTML 파일</label>
              <input type="file" accept=".html,.htm" onChange={handleFileChange} className="form-file" />
              {fileName && (
                <p className="form-hint">
                  {fileName} ({(new Blob([contentHtml]).size / 1024).toFixed(1)}KB)
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">제목</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">Slug (URL 경로)</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="예: 장류진_북토크" className="form-input" />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">카테고리</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="form-input">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">날짜</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            </div>
          </div>

          {isEdit && (
            <div className="form-group">
              <label className="form-label">HTML 파일 교체 (선택)</label>
              <input type="file" accept=".html,.htm" onChange={handleFileChange} className="form-file" />
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="admin-link">취소</button>
            <button type="submit" disabled={saving} className="admin-btn-primary">
              {saving ? "저장 중..." : isEdit ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

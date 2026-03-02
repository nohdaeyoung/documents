"use client";

import { useState, useRef } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { Archive, Category } from "@/lib/types";

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
  const [date, setDate] = useState(archive?.date ?? new Date().toISOString().slice(0, 10));
  const [contentHtml, setContentHtml] = useState(archive?.contentHtml ?? "");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    if (!slug) {
      setSlug(file.name.replace(/\.html?$/i, ""));
    }
    if (!title) {
      setTitle(
        file.name
          .replace(/\.html?$/i, "")
          .replace(/[_-]/g, " ")
      );
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setContentHtml(ev.target?.result as string);
    };
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
        await updateDoc(doc(db, "archives", archive.id), {
          title: title.trim(),
          slug: slug.trim(),
          categoryId,
          contentHtml,
          size: new Blob([contentHtml]).size,
          date,
          updatedAt: serverTimestamp(),
        });
      } else {
        const lastSnap = await getDocs(
          query(
            collection(db, "archives"),
            orderBy("displayOrder", "desc"),
            limit(1)
          )
        );
        const nextOrder =
          lastSnap.empty ? 0 : (lastSnap.docs[0].data().displayOrder ?? 0) + 1;

        await addDoc(collection(db, "archives"), {
          title: title.trim(),
          slug: slug.trim(),
          categoryId,
          contentHtml,
          fileExt: "html",
          size: new Blob([contentHtml]).size,
          date,
          displayOrder: nextOrder,
          thumbnail: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-[1.2rem] font-normal"
            style={{ fontFamily: "var(--font-serif), serif" }}
          >
            {isEdit ? "문서 수정" : "새 문서 등록"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!isEdit && (
            <div>
              <label className="block text-[0.8rem] text-[var(--muted)] mb-1">
                HTML 파일
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className="w-full text-[0.85rem] file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-[var(--card-bg)] file:text-[var(--fg)] file:cursor-pointer file:text-[0.8rem]"
              />
              {fileName && (
                <p className="text-[0.75rem] text-[var(--muted)] mt-1">
                  {fileName} ({(new Blob([contentHtml]).size / 1024).toFixed(1)}
                  KB)
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-[0.8rem] text-[var(--muted)] mb-1">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none focus:border-[var(--fg)] text-[0.9rem]"
            />
          </div>

          <div>
            <label className="block text-[0.8rem] text-[var(--muted)] mb-1">
              Slug (URL 경로)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="예: 장류진_북토크"
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none focus:border-[var(--fg)] text-[0.9rem]"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[0.8rem] text-[var(--muted)] mb-1">
                카테고리
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none focus:border-[var(--fg)] text-[0.9rem]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[0.8rem] text-[var(--muted)] mb-1">
                날짜
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--card-bg)] text-[var(--fg)] outline-none focus:border-[var(--fg)] text-[0.9rem]"
              />
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-[0.8rem] text-[var(--muted)] mb-1">
                HTML 파일 교체 (선택)
              </label>
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleFileChange}
                className="w-full text-[0.85rem] file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-[var(--card-bg)] file:text-[var(--fg)] file:cursor-pointer file:text-[0.8rem]"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[0.85rem] text-[var(--muted)] hover:text-[var(--fg)] cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-[0.85rem] cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "저장 중..." : isEdit ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

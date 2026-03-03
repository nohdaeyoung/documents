"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth";
import {
  getAdminData,
  getArchiveContent,
  updateArchive,
  createArchive,
} from "@/app/admin/actions";
import { Archive, Category } from "@/lib/types";

type EditorTab = "source" | "preview" | "wysiwyg";

/** datetime-local input requires "YYYY-MM-DDTHH:MM" format */
function normalizeDateForInput(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().slice(0, 16);
  if (dateStr.includes("T")) return dateStr.slice(0, 16);
  // date-only "YYYY-MM-DD" → add 00:00
  return `${dateStr}T00:00`;
}

export default function EditArchivePage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params.id as string;
  const isNew = rawId === "new";
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [contentHtml, setContentHtml] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);

  // Editor tabs
  const [activeTab, setActiveTab] = useState<EditorTab>("source");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wysiwygRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/admin/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const adminData = await getAdminData();
      const cats = adminData.categories as Category[];
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);

      if (!isNew) {
        const [arch, html] = await Promise.all([
          Promise.resolve(
            adminData.archives.find((a) => a.id === rawId) as Archive | undefined
          ),
          getArchiveContent(rawId),
        ]);
        if (arch) {
          setTitle(arch.title);
          setSlug(arch.slug);
          setCategoryId(arch.categoryId || (cats[0]?.id ?? ""));
          setDate(normalizeDateForInput(arch.date));
        }
        setContentHtml(html);
      }
      setLoading(false);
    };
    load();
  }, [user, rawId, isNew]);

  // Sync source → preview iframe when switching to preview
  const syncPreview = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = contentHtml;
  }, [contentHtml]);

  // Sync source → wysiwyg iframe when switching to wysiwyg
  const syncWysiwyg = useCallback(() => {
    const iframe = wysiwygRef.current;
    if (!iframe) return;
    iframe.srcdoc = contentHtml;
    const onLoad = () => {
      try {
        const doc = iframe.contentDocument;
        if (doc) {
          doc.designMode = "on";
          doc.body.style.cursor = "text";
        }
      } catch (_) {}
    };
    iframe.addEventListener("load", onLoad, { once: true });
  }, [contentHtml]);

  // Pull HTML from wysiwyg iframe back to source
  const pullFromWysiwyg = useCallback(() => {
    const iframe = wysiwygRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const html = doc.documentElement.outerHTML;
        setContentHtml("<!DOCTYPE html>\n" + html);
      }
    } catch (_) {}
  }, []);

  function handleTabChange(tab: EditorTab) {
    // When leaving wysiwyg, pull content back
    if (activeTab === "wysiwyg" && tab !== "wysiwyg") {
      pullFromWysiwyg();
    }
    setActiveTab(tab);
    if (tab === "preview") {
      setTimeout(() => syncPreview(), 50);
    } else if (tab === "wysiwyg") {
      setTimeout(() => syncWysiwyg(), 50);
    }
  }

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

  function execWysiwygCmd(cmd: string, value?: string) {
    const iframe = wysiwygRef.current;
    if (!iframe?.contentDocument) return;
    iframe.contentDocument.execCommand(cmd, false, value);
    iframe.contentWindow?.focus();
  }

  async function handleSave() {
    // Pull wysiwyg content if active
    if (activeTab === "wysiwyg") pullFromWysiwyg();

    if (!title.trim() || !slug.trim() || !contentHtml.trim()) {
      alert("제목, slug, HTML 콘텐츠는 필수입니다.");
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await createArchive({
          title: title.trim(),
          slug: slug.trim(),
          categoryId,
          contentHtml,
          date,
        });
      } else {
        await updateArchive(rawId, {
          title: title.trim(),
          slug: slug.trim(),
          categoryId,
          contentHtml,
          date,
        });
      }
      router.push("/admin");
    } catch (err) {
      console.error("Save failed:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user || loading) {
    return (
      <div style={{ padding: "40px 24px", color: "var(--muted)" }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div className="edit-page-container">
      {/* Header */}
      <header className="edit-page-header">
        <h1 className="edit-page-title">
          {isNew ? "새 문서 등록" : "문서 수정"}
        </h1>
        <div className="edit-page-actions">
          <button
            onClick={() => router.push("/admin")}
            className="admin-link"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-btn-primary"
          >
            {saving ? "저장 중..." : isNew ? "등록" : "수정"}
          </button>
        </div>
      </header>

      {/* Metadata fields */}
      <div className="edit-page-fields">
        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            placeholder="강연 제목"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Slug (URL)</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="form-input"
            placeholder="예: 장류진_북토크"
          />
        </div>
        <div className="form-group">
          <label className="form-label">카테고리</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="form-input"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">날짜</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* File upload */}
      <div className="edit-file-section">
        <label className="form-label" style={{ flexShrink: 0 }}>
          {isNew ? "HTML 파일" : "HTML 파일 교체"}
        </label>
        <input
          type="file"
          accept=".html,.htm"
          onChange={handleFileChange}
          className="form-file"
        />
        {fileName && (
          <span className="form-hint">
            {fileName} ({(new Blob([contentHtml]).size / 1024).toFixed(1)}KB)
          </span>
        )}
        {!fileName && contentHtml && (
          <span className="form-hint">
            {(new Blob([contentHtml]).size / 1024).toFixed(1)}KB 로드됨
          </span>
        )}
      </div>

      {/* Editor tabs */}
      <div className="edit-editor-tabs">
        {(["source", "preview", "wysiwyg"] as EditorTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`edit-editor-tab${activeTab === tab ? " active" : ""}`}
          >
            {tab === "source" ? "소스" : tab === "preview" ? "미리보기" : "편집(WYSIWYG)"}
          </button>
        ))}
      </div>

      {/* WYSIWYG toolbar (only in wysiwyg mode) */}
      {activeTab === "wysiwyg" && (
        <div className="edit-wysiwyg-toolbar">
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("bold")}>
            <b>B</b>
          </button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("italic")}>
            <i>I</i>
          </button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("underline")}>
            <u>U</u>
          </button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("strikeThrough")}>
            <s>S</s>
          </button>
          <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("formatBlock", "h2")}>H2</button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("formatBlock", "h3")}>H3</button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("formatBlock", "p")}>P</button>
          <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("insertUnorderedList")}>UL</button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("insertOrderedList")}>OL</button>
          <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("undo")}>↩</button>
          <button className="edit-wysiwyg-btn" onClick={() => execWysiwygCmd("redo")}>↪</button>
          <span style={{ marginLeft: "auto", fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center" }}>
            * 편집 후 소스 탭으로 이동 시 자동 반영
          </span>
        </div>
      )}

      {/* Editor content */}
      <div className="edit-editor-wrap">
        {activeTab === "source" && (
          <textarea
            className="edit-source-textarea"
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            spellCheck={false}
            placeholder="HTML 파일을 업로드하거나 여기에 직접 입력하세요..."
          />
        )}
        {activeTab === "preview" && (
          <iframe
            ref={iframeRef}
            className="edit-preview-iframe"
            srcDoc={contentHtml}
            sandbox="allow-same-origin allow-scripts"
            title="미리보기"
          />
        )}
        {activeTab === "wysiwyg" && (
          <iframe
            ref={wysiwygRef}
            className="edit-wysiwyg-iframe"
            srcDoc={contentHtml}
            sandbox="allow-same-origin allow-scripts"
            title="WYSIWYG 편집"
          />
        )}
      </div>
    </div>
  );
}

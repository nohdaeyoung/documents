"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/app/admin/actions";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings>({
    archiveTitle: "",
    archiveSubtitle: "",
    headCode: "",
    bodyCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await updateSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Settings save failed:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="admin-loading">로딩 중...</p>;

  return (
    <div className="settings-panel">
      {/* Section 1: Site Identity */}
      <div className="settings-section">
        <h2 className="settings-section-title">사이트 정보</h2>

        <div className="form-group" style={{ marginBottom: 12 }}>
          <label className="form-label">아카이브 제목 (archive-title)</label>
          <input
            type="text"
            value={settings.archiveTitle}
            onChange={(e) =>
              setSettings((s) => ({ ...s, archiveTitle: e.target.value }))
            }
            className="form-input"
            placeholder="324 Lecture & Study Archives"
          />
        </div>

        <div className="form-group">
          <label className="form-label">아카이브 부제 (archive-subtitle)</label>
          <input
            type="text"
            value={settings.archiveSubtitle}
            onChange={(e) =>
              setSettings((s) => ({ ...s, archiveSubtitle: e.target.value }))
            }
            className="form-input"
            placeholder="324가 보고 듣고 경험한 타인의 언어와 연구 아카이브"
          />
        </div>
      </div>

      {/* Section 2: Code Injection */}
      <div className="settings-section">
        <h2 className="settings-section-title">코드 삽입</h2>

        <div className="form-group" style={{ marginBottom: 16 }}>
          <label className="form-label">&lt;head&gt; 코드 삽입</label>
          <textarea
            className="settings-code-textarea"
            value={settings.headCode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, headCode: e.target.value }))
            }
            placeholder={"<!-- 예: Google Analytics, 메타 태그 등 -->\n<script>...</script>"}
            spellCheck={false}
          />
          <p className="settings-hint">
            모든 페이지의 &lt;/head&gt; 직전에 삽입됩니다. 트래킹 코드, 커스텀 스타일 등.
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">&lt;body&gt; 코드 삽입</label>
          <textarea
            className="settings-code-textarea"
            value={settings.bodyCode}
            onChange={(e) =>
              setSettings((s) => ({ ...s, bodyCode: e.target.value }))
            }
            placeholder={"<!-- 예: 채팅 위젯, 팝업 스크립트 등 -->\n<script>...</script>"}
            spellCheck={false}
          />
          <p className="settings-hint">
            모든 페이지의 &lt;/body&gt; 직전에 삽입됩니다. 스크립트, 위젯 등.
          </p>
        </div>
      </div>

      {/* Save */}
      <div className="settings-save-bar">
        {saved && (
          <span style={{ color: "#22c55e", fontSize: "0.85rem", marginRight: 12 }}>
            ✓ 저장됨
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-primary"
        >
          {saving ? "저장 중..." : "설정 저장"}
        </button>
      </div>
    </div>
  );
}

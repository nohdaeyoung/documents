"use client";

import { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings, SiteSettings } from "@/app/admin/actions";
import { useAuth, linkGoogleAccount, unlinkGoogleAccount } from "@/lib/firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

export default function SettingsPanel() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>({
    archiveTitle: "",
    archiveSubtitle: "",
    headCode: "",
    bodyCode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleMsg, setGoogleMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isGoogleLinked = user?.providerData.some(
    (p) => p.providerId === GoogleAuthProvider.PROVIDER_ID
  ) ?? false;
  const googleAccount = user?.providerData.find(
    (p) => p.providerId === GoogleAuthProvider.PROVIDER_ID
  );

  async function handleLinkGoogle() {
    setGoogleLoading(true);
    setGoogleMsg(null);
    try {
      await linkGoogleAccount();
      setGoogleMsg({ type: "success", text: "Google 계정이 연동되었습니다." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("already-in-use") || msg.includes("credential-already-in-use")) {
        setGoogleMsg({ type: "error", text: "이미 다른 계정에 연동된 Google 계정입니다." });
      } else {
        setGoogleMsg({ type: "error", text: "Google 연동에 실패했습니다." });
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleUnlinkGoogle() {
    if (!confirm("Google 계정 연동을 해제하시겠습니까?")) return;
    setGoogleLoading(true);
    setGoogleMsg(null);
    try {
      await unlinkGoogleAccount();
      setGoogleMsg({ type: "success", text: "Google 계정 연동이 해제되었습니다." });
    } catch {
      setGoogleMsg({ type: "error", text: "연동 해제에 실패했습니다." });
    } finally {
      setGoogleLoading(false);
    }
  }

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

      {/* Section 2: Google Account */}
      <div className="settings-section">
        <h2 className="settings-section-title">계정 연동</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div>
              <p className="form-label" style={{ marginBottom: 2 }}>Google 계정</p>
              {isGoogleLinked ? (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {googleAccount?.email ?? "연동됨"}
                </p>
              ) : (
                <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>연동되지 않음</p>
              )}
            </div>
          </div>
          {isGoogleLinked ? (
            <button
              onClick={handleUnlinkGoogle}
              disabled={googleLoading}
              className="admin-btn"
              style={{ flexShrink: 0 }}
            >
              {googleLoading ? "처리 중..." : "연동 해제"}
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={googleLoading}
              className="admin-btn-primary"
              style={{ flexShrink: 0 }}
            >
              {googleLoading ? "처리 중..." : "Google 연동"}
            </button>
          )}
        </div>
        {googleMsg && (
          <p style={{
            marginTop: 10,
            fontSize: "0.85rem",
            color: googleMsg.type === "success" ? "#22c55e" : "#ef4444",
          }}>
            {googleMsg.type === "success" ? "✓ " : "✕ "}{googleMsg.text}
          </p>
        )}
      </div>

      {/* Section 3: Code Injection */}
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

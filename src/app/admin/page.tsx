"use client";

import { useAuth, signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Archive, Category } from "@/lib/types";
import FileList from "@/components/admin/file-list";
import CategoryManager from "@/components/admin/category-manager";
import SettingsPanel from "@/components/admin/settings-panel";
import { getAdminData } from "./actions";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"archives" | "categories" | "settings">(
    "archives"
  );
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAdminData();
      setArchives(data.archives as unknown as Archive[]);
      setCategories(data.categories as unknown as Category[]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  if (authLoading || !user) return null;

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1 className="admin-title">Admin</h1>
        <div className="admin-header-actions">
          <a href="/" className="admin-link">Archives</a>
          <button onClick={() => signOut()} className="admin-link">
            로그아웃
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        {(["archives", "categories", "settings"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab${activeTab === tab ? " active" : ""}`}
          >
            {tab === "archives"
              ? `Archives (${archives.length})`
              : tab === "categories"
              ? `Categories (${categories.length})`
              : "Settings"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : activeTab === "archives" ? (
        <>
          <div className="admin-toolbar">
            <button
              onClick={() => router.push("/admin/edit/new")}
              className="admin-btn-primary"
            >
              + 새 문서
            </button>
          </div>
          <FileList
            archives={archives}
            categories={categories}
            onRefresh={fetchData}
          />
        </>
      ) : activeTab === "categories" ? (
        <CategoryManager categories={categories} onRefresh={fetchData} />
      ) : (
        <SettingsPanel />
      )}
    </div>
  );
}

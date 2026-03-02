"use client";

import { useAuth, signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Archive, Category } from "@/lib/types";
import FileList from "@/components/admin/file-list";
import FileForm from "@/components/admin/file-form";
import CategoryManager from "@/components/admin/category-manager";
import { getAdminData } from "./actions";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"archives" | "categories">(
    "archives"
  );
  const [archives, setArchives] = useState<Archive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [showForm, setShowForm] = useState(false);

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
        {(["archives", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`admin-tab${activeTab === tab ? " active" : ""}`}
          >
            {tab === "archives"
              ? `Archives (${archives.length})`
              : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-loading">로딩 중...</p>
      ) : activeTab === "archives" ? (
        <>
          <div className="admin-toolbar">
            <button
              onClick={() => {
                setEditingArchive(null);
                setShowForm(true);
              }}
              className="admin-btn-primary"
            >
              + 새 문서
            </button>
          </div>

          <FileList
            archives={archives}
            categories={categories}
            onEdit={(archive) => {
              setEditingArchive(archive);
              setShowForm(true);
            }}
            onRefresh={fetchData}
          />

          {showForm && (
            <FileForm
              archive={editingArchive}
              categories={categories}
              onClose={() => {
                setShowForm(false);
                setEditingArchive(null);
              }}
              onSaved={fetchData}
            />
          )}
        </>
      ) : (
        <CategoryManager categories={categories} onRefresh={fetchData} />
      )}
    </div>
  );
}

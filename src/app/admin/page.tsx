"use client";

import { useAuth, signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Archive, Category } from "@/lib/types";
import FileList from "@/components/admin/file-list";
import FileForm from "@/components/admin/file-form";
import CategoryManager from "@/components/admin/category-manager";

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
      const [archivesSnap, categoriesSnap] = await Promise.all([
        getDocs(query(collection(db, "archives"), orderBy("displayOrder"))),
        getDocs(query(collection(db, "categories"), orderBy("displayOrder"))),
      ]);

      setArchives(
        archivesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Archive[]
      );

      setCategories(
        categoriesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
      );
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
    <div className="max-w-[800px] mx-auto px-6 pt-10 pb-20">
      <header className="flex items-center justify-between mb-10">
        <h1
          className="font-normal"
          style={{
            fontFamily: "var(--font-serif), serif",
            fontSize: "1.5rem",
          }}
        >
          Admin
        </h1>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-[0.8rem] text-[var(--muted)] underline hover:text-[var(--fg)]"
          >
            Archives
          </a>
          <button
            onClick={() => signOut()}
            className="text-[0.8rem] text-[var(--muted)] underline hover:text-[var(--fg)] cursor-pointer"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="flex gap-1 mb-8 border-b border-[var(--border)]">
        {(["archives", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[0.85rem] cursor-pointer border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[var(--fg)] text-[var(--fg)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--fg)]"
            }`}
          >
            {tab === "archives" ? `Archives (${archives.length})` : `Categories (${categories.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-[var(--muted)] text-[0.9rem]">로딩 중...</p>
      ) : activeTab === "archives" ? (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setEditingArchive(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[var(--fg)] text-[var(--bg)] rounded-lg text-[0.85rem] cursor-pointer hover:opacity-90"
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
        <CategoryManager
          categories={categories}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

async function getData(categoryId: string) {
  const [archivesSnap, categorySnap] = await Promise.all([
    adminDb
      .collection("archives")
      .where("categoryId", "==", categoryId)
      .select("slug", "title", "categoryId", "date", "displayOrder")
      .get(),
    adminDb.collection("categories").doc(categoryId).get(),
  ]);

  if (!categorySnap.exists) return null;

  const category = {
    id: categorySnap.id,
    label: categorySnap.data()?.label ?? "",
    color: categorySnap.data()?.color ?? "#888",
  };

  const archives = archivesSnap.docs
    .map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        slug: d.slug ?? "",
        title: d.title ?? "",
        date: d.date ?? "",
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // date desc (JS-side, no composite index needed)

  return { category, archives };
}

export async function generateStaticParams() {
  const snap = await adminDb.collection("categories").get();
  return snap.docs.map((doc) => ({ id: doc.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getData(id);
  if (!data) return { title: "Not Found" };
  return {
    title: `${data.category.label} — 324 Archives`,
    description: `${data.category.label} 분류의 아카이브 목록`,
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  if (dateStr.includes("T")) {
    const [datePart, timePart] = dateStr.split("T");
    return `${datePart} ${timePart}`;
  }
  return dateStr;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);
  if (!data) notFound();

  const { category, archives } = data;

  return (
    <div className="category-page-container">
      <a href="/" className="category-page-back">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Archives
      </a>

      <header className="category-page-header">
        <div
          className="category-page-tag"
          style={{
            background: category.color + "18",
            color: category.color,
          }}
        >
          {category.label}
        </div>
        <h1 className="category-page-title">{category.label}</h1>
        <p className="category-page-count">{archives.length}개 문서</p>
      </header>

      {archives.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <p>이 분류에 등록된 문서가 없습니다.</p>
        </div>
      ) : (
        <ul className="archive-list">
          {archives.map((archive, i) => (
            <li key={archive.id}>
              <Link
                href={`/archives/${archive.slug}`}
                className="archive-item"
                style={{
                  animation: `fadeUp 0.35s ease both`,
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div className="item-content">
                  <div className="title">{archive.title}</div>
                  <div className="meta">{formatDate(archive.date)}</div>
                </div>
              </Link>
              <a
                href={`/archives/${archive.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="new-tab-btn"
                title="새 탭에서 열기"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      )}

      <footer className="archive-footer" style={{ marginTop: "80px" }}>
        324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
        <a href="/">Archives</a>
      </footer>
    </div>
  );
}

import { adminDb } from "@/lib/firebase/admin";
import { ArchiveListItem, Category } from "@/lib/types";
import ArchiveListClient from "@/components/archive-list-client";

export const revalidate = 60;

async function getData() {
  const [archivesSnap, categoriesSnap] = await Promise.all([
    adminDb
      .collection("archives")
      .orderBy("displayOrder")
      .select(
        "slug",
        "title",
        "categoryId",
        "size",
        "date",
        "displayOrder",
        "thumbnail"
      )
      .get(),
    adminDb.collection("categories").orderBy("displayOrder").get(),
  ]);

  const archives: ArchiveListItem[] = archivesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      slug: data.slug,
      title: data.title,
      categoryId: data.categoryId,
      size: data.size,
      date: data.date,
      displayOrder: data.displayOrder,
      thumbnail: data.thumbnail || "",
    };
  });

  const categories: Category[] = categoriesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      label: data.label,
      color: data.color,
      displayOrder: data.displayOrder,
      createdAt: null as unknown as Date,
    };
  });

  return { archives, categories };
}

export default async function HomePage() {
  const { archives, categories } = await getData();

  return (
    <div className="relative z-1 max-w-[720px] mx-auto px-6 pt-20 pb-30 max-[480px]:px-4 max-[480px]:pt-12 max-[480px]:pb-20">
      <header className="mb-16 border-b-2 border-[var(--fg)] pb-6 max-[480px]:mb-10">
        <h1
          className="font-normal tracking-tight leading-[1.1]"
          style={{
            fontFamily: "var(--font-serif), serif",
            fontSize: "clamp(2.4rem, 6vw, 3.6rem)",
            letterSpacing: "-0.02em",
          }}
        >
          324 Lecture &amp; Study Archives
        </h1>
        <p className="mt-3 text-[var(--muted)] text-[0.95rem]">
          324가 보고 듣고 경험한 타인의 언어와 연구 아카이브
        </p>
      </header>

      <ArchiveListClient archives={archives} categories={categories} />

      <footer className="mt-20 text-center text-[0.8rem] text-[var(--muted)]">
        324(dy) · claude Opus4.6 · Next.js · Firestore ·{" "}
        <a href="/colophon" className="underline hover:text-[var(--fg)]">
          Colophon
        </a>
      </footer>
    </div>
  );
}

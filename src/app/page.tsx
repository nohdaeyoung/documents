import { adminDb } from "@/lib/firebase/admin";
import { ArchiveListItem, Category } from "@/lib/types";
import ArchiveListClient from "@/components/archive-list-client";
import { getSiteSettings } from "@/app/admin/actions";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

async function getData() {
  const [archivesSnap, categoriesSnap, settings] = await Promise.all([
    adminDb
      .collection("archives")
      .orderBy("date", "desc")
      .select(
        "slug",
        "title",
        "categoryId",
        "date",
        "summary"
      )
      .get(),
    adminDb.collection("categories").orderBy("displayOrder").get(),
    getSiteSettings(),
  ]);

  const archives: ArchiveListItem[] = archivesSnap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      slug: data.slug,
      title: data.title,
      categoryId: data.categoryId,
      date: data.date,
      summary: data.summary ?? undefined,
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

  return { archives, categories, settings };
}

export default async function HomePage() {
  const { archives, categories, settings } = await getData();
  return (
    <Suspense>
      <ArchiveListClient
        archives={archives}
        categories={categories}
        siteTitle={settings.archiveTitle}
        siteSubtitle={settings.archiveSubtitle}
      />
    </Suspense>
  );
}

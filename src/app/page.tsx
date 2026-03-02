import { adminDb } from "@/lib/firebase/admin";
import { ArchiveListItem, Category } from "@/lib/types";
import ArchiveListClient from "@/components/archive-list-client";

export const revalidate = 3600;

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
  return <ArchiveListClient archives={archives} categories={categories} />;
}

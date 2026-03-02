"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

// ── READ ──────────────────────────────────────────
export async function getAdminData() {
  const [archivesSnap, categoriesSnap] = await Promise.all([
    adminDb.collection("archives").orderBy("displayOrder").get(),
    adminDb.collection("categories").orderBy("displayOrder").get(),
  ]);

  const archives = archivesSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      slug: d.slug ?? "",
      title: d.title ?? "",
      categoryId: d.categoryId ?? "",
      contentHtml: d.contentHtml ?? "",
      fileExt: d.fileExt ?? "html",
      size: d.size ?? 0,
      date: d.date ?? "",
      displayOrder: d.displayOrder ?? 0,
      thumbnail: d.thumbnail ?? "",
      createdAt: null as null,
      updatedAt: null as null,
    };
  });

  const categories = categoriesSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      label: d.label ?? "",
      color: d.color ?? "#888",
      displayOrder: d.displayOrder ?? 0,
      createdAt: null as null,
    };
  });

  return { archives, categories };
}

// ── ARCHIVE WRITE ──────────────────────────────────
export async function createArchive(data: {
  title: string;
  slug: string;
  categoryId: string;
  contentHtml: string;
  date: string;
}) {
  const snap = await adminDb
    .collection("archives")
    .orderBy("displayOrder", "desc")
    .limit(1)
    .get();
  const nextOrder = snap.empty ? 0 : (snap.docs[0].data().displayOrder ?? 0) + 1;

  await adminDb.collection("archives").add({
    ...data,
    fileExt: "html",
    size: Buffer.byteLength(data.contentHtml, "utf8"),
    displayOrder: nextOrder,
    thumbnail: "",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  revalidatePath("/");
  revalidatePath(`/archives/${data.slug}`);
}

export async function updateArchive(
  id: string,
  data: {
    title: string;
    slug: string;
    categoryId: string;
    contentHtml: string;
    date: string;
  }
) {
  await adminDb
    .collection("archives")
    .doc(id)
    .update({
      ...data,
      size: Buffer.byteLength(data.contentHtml, "utf8"),
      updatedAt: FieldValue.serverTimestamp(),
    });
  revalidatePath("/");
  revalidatePath(`/archives/${data.slug}`);
}

export async function deleteArchive(id: string) {
  const doc = await adminDb.collection("archives").doc(id).get();
  const slug = doc.data()?.slug as string | undefined;
  await adminDb.collection("archives").doc(id).delete();
  revalidatePath("/");
  if (slug) revalidatePath(`/archives/${slug}`);
}

export async function reorderArchives(
  id1: string,
  order1: number,
  id2: string,
  order2: number
) {
  const batch = adminDb.batch();
  batch.update(adminDb.collection("archives").doc(id1), { displayOrder: order2 });
  batch.update(adminDb.collection("archives").doc(id2), { displayOrder: order1 });
  await batch.commit();
  revalidatePath("/");
}

// ── CATEGORY WRITE ─────────────────────────────────
export async function createCategory(data: {
  label: string;
  color: string;
  displayOrder: number;
}) {
  await adminDb.collection("categories").add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
  revalidatePath("/");
}

export async function updateCategory(
  id: string,
  data: { label: string; color: string }
) {
  await adminDb.collection("categories").doc(id).update(data);
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await adminDb.collection("categories").doc(id).delete();
  revalidatePath("/");
}

export async function reorderCategories(
  id1: string,
  order1: number,
  id2: string,
  order2: number
) {
  const batch = adminDb.batch();
  batch.update(adminDb.collection("categories").doc(id1), { displayOrder: order2 });
  batch.update(adminDb.collection("categories").doc(id2), { displayOrder: order1 });
  await batch.commit();
  revalidatePath("/");
}

"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

// ── READ ──────────────────────────────────────────
export async function getAdminData() {
  const [archivesSnap, categoriesSnap] = await Promise.all([
    adminDb
      .collection("archives")
      .orderBy("date", "desc")
      .select("slug", "title", "categoryId", "fileExt", "size", "date", "displayOrder", "thumbnail")
      .get(),
    adminDb.collection("categories").orderBy("displayOrder").get(),
  ]);

  const archives = archivesSnap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      slug: d.slug ?? "",
      title: d.title ?? "",
      categoryId: d.categoryId ?? "",
      contentHtml: "",
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

export async function getArchiveContent(id: string): Promise<string> {
  const doc = await adminDb.collection("archives").doc(id).get();
  return (doc.data()?.contentHtml as string) ?? "";
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
  revalidatePath(`/archives/${encodeURIComponent(data.slug)}`);
  revalidatePath("/archives/[slug]", "page");
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
  revalidatePath(`/archives/${encodeURIComponent(data.slug)}`);
  revalidatePath("/archives/[slug]", "page");
}

export async function deleteArchive(id: string) {
  await adminDb.collection("archives").doc(id).delete();
  revalidatePath("/");
  revalidatePath("/archives/[slug]", "page");
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
  id?: string; // optional custom Firestore document ID
}) {
  const { id, ...rest } = data;
  if (id) {
    await adminDb.collection("categories").doc(id).set({
      ...rest,
      createdAt: FieldValue.serverTimestamp(),
    });
  } else {
    await adminDb.collection("categories").add({
      ...rest,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  revalidatePath("/");
}

export async function updateCategory(
  id: string,
  data: { label: string; color: string }
) {
  await adminDb.collection("categories").doc(id).update(data);
  revalidatePath("/");
}

export async function renameCategoryId(
  oldId: string,
  newId: string,
  label: string,
  color: string
) {
  // Validate new ID
  if (!newId || !/^[a-zA-Z0-9_-]+$/.test(newId)) {
    throw new Error("ID는 영문·숫자·-·_ 만 사용 가능합니다.");
  }

  // Check if new ID already exists
  const newDoc = await adminDb.collection("categories").doc(newId).get();
  if (newDoc.exists) throw new Error(`"${newId}" ID가 이미 존재합니다.`);

  // Get old doc data
  const oldDoc = await adminDb.collection("categories").doc(oldId).get();
  if (!oldDoc.exists) throw new Error("카테고리를 찾을 수 없습니다.");
  const oldData = oldDoc.data()!;

  // 1. Create new doc with new ID
  await adminDb.collection("categories").doc(newId).set({
    label,
    color,
    displayOrder: oldData.displayOrder ?? 0,
    createdAt: oldData.createdAt,
  });

  // 2. Migrate archives + delete old doc in batch
  const archivesSnap = await adminDb
    .collection("archives")
    .where("categoryId", "==", oldId)
    .get();

  const batch = adminDb.batch();
  archivesSnap.docs.forEach((doc) => {
    batch.update(doc.ref, { categoryId: newId });
  });
  batch.delete(adminDb.collection("categories").doc(oldId));
  await batch.commit();

  revalidatePath("/");
  revalidatePath("/archives/[slug]", "page");
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

// ── SITE SETTINGS ───────────────────────────────────
export interface SiteSettings {
  archiveTitle: string;
  archiveSubtitle: string;
  headCode: string;
  bodyCode: string;
}

const SETTINGS_DOC = "main";

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await adminDb.collection("settings").doc(SETTINGS_DOC).get();
  const d = doc.data() ?? {};
  return {
    archiveTitle: d.archiveTitle ?? "324 Lecture & Study Archives",
    archiveSubtitle: d.archiveSubtitle ?? "324가 보고 듣고 경험한 타인의 언어와 연구 아카이브",
    headCode: d.headCode ?? "",
    bodyCode: d.bodyCode ?? "",
  };
}

export async function updateSiteSettings(data: SiteSettings) {
  await adminDb.collection("settings").doc(SETTINGS_DOC).set(data, { merge: true });
  revalidatePath("/");
  revalidatePath("/archives/[slug]", "page");
}

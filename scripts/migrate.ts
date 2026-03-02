/**
 * Migration Script: GitHub Pages → Firestore
 *
 * archives.json + categories.json + HTML files → Firestore collections
 *
 * Usage: npx tsx scripts/migrate.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: join(__dirname, "..", ".env.local") });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);
const SOURCE_DIR = join(__dirname, "..", "_source");

interface ArchiveEntry {
  name: string;
  title: string;
  ext: string;
  category: string;
  size: number;
  date: string;
  order: number;
  thumbnail: string;
}

interface CategoryEntry {
  id: string;
  label: string;
  color: string;
}

async function migrateCategories() {
  console.log("\n📁 카테고리 마이그레이션 시작...");

  const raw = readFileSync(join(SOURCE_DIR, "categories.json"), "utf-8");
  const categories: CategoryEntry[] = JSON.parse(raw);

  const batch = db.batch();

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const ref = db.collection("categories").doc(cat.id);
    batch.set(ref, {
      label: cat.label,
      color: cat.color,
      displayOrder: i,
      createdAt: Timestamp.now(),
    });
    console.log(`  ✓ ${cat.id} → ${cat.label} (${cat.color})`);
  }

  await batch.commit();
  console.log(`✅ ${categories.length}개 카테고리 마이그레이션 완료`);
}

async function migrateArchives() {
  console.log("\n📄 아카이브 마이그레이션 시작...");

  const raw = readFileSync(join(SOURCE_DIR, "archives.json"), "utf-8");
  const archives: ArchiveEntry[] = JSON.parse(raw);

  let success = 0;
  let failed = 0;

  for (const archive of archives) {
    try {
      // Read HTML file content
      const htmlPath = join(SOURCE_DIR, "archives", archive.name);
      const contentHtml = readFileSync(htmlPath, "utf-8");

      // Generate slug from filename (remove .html extension)
      const slug = archive.name.replace(/\.html$/, "");

      // Write to Firestore
      const ref = db.collection("archives").doc();
      await ref.set({
        slug,
        title: archive.title,
        categoryId: archive.category,
        contentHtml,
        fileExt: archive.ext,
        size: archive.size,
        date: archive.date,
        displayOrder: archive.order,
        thumbnail: archive.thumbnail,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      success++;
      const sizeKB = (contentHtml.length / 1024).toFixed(1);
      console.log(`  ✓ [${success}/${archives.length}] ${slug} (${sizeKB}KB)`);
    } catch (error) {
      failed++;
      console.error(`  ✗ ${archive.name}: ${error}`);
    }
  }

  console.log(`\n✅ 아카이브 마이그레이션 완료: ${success} 성공, ${failed} 실패`);
}

async function verify() {
  console.log("\n🔍 검증 중...");

  const catSnap = await db.collection("categories").get();
  console.log(`  카테고리: ${catSnap.size}개`);

  const archSnap = await db.collection("archives").get();
  console.log(`  아카이브: ${archSnap.size}개`);

  // Check each archive has contentHtml
  let withContent = 0;
  archSnap.forEach((doc) => {
    const data = doc.data();
    if (data.contentHtml && data.contentHtml.length > 0) {
      withContent++;
    }
  });
  console.log(`  콘텐츠 포함: ${withContent}/${archSnap.size}개`);
}

async function main() {
  console.log("🚀 Documents DB 마이그레이션 시작");
  console.log(`  프로젝트: ${process.env.FIREBASE_ADMIN_PROJECT_ID}`);
  console.log(`  소스 디렉토리: ${SOURCE_DIR}`);

  await migrateCategories();
  await migrateArchives();
  await verify();

  console.log("\n🎉 전체 마이그레이션 완료!");
  process.exit(0);
}

main().catch((error) => {
  console.error("마이그레이션 실패:", error);
  process.exit(1);
});

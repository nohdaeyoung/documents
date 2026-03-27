/**
 * Patch Script: Fix .part-1 .hero margin-top gap in Section B
 *
 * Usage: npx tsx scripts/patch-section-b-hero.ts
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: join(__dirname, "..", ".env.local") });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);
const DOC_ID = "nnOICEsvybieQ2upADd2";

async function patch() {
  const ref = db.collection("archives").doc(DOC_ID);
  const snap = await ref.get();

  if (!snap.exists) {
    console.error("❌ 문서를 찾을 수 없습니다:", DOC_ID);
    process.exit(1);
  }

  const doc = snap;
  const html = doc.data().contentHtml as string;

  // margin-top: 48px → 42px (.part-1 .hero 블록)
  const patched = html.replace(
    ".part-1 .hero {\n  margin-top: 42px;",
    ".part-1 .hero {\n  margin-top: 41px;"
  );

  if (patched === html) {
    console.log("⚠️  변경 대상을 찾지 못했습니다. CSS가 이미 수정되었거나 형식이 다릅니다.");
    process.exit(0);
  }

  await ref.update({ contentHtml: patched });
  console.log("✅ 패치 완료:", doc.id);
  console.log("   margin-top: 42px → 41px");
  process.exit(0);
}

patch().catch((e) => {
  console.error("❌ 오류:", e);
  process.exit(1);
});

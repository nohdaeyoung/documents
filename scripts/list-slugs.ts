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

async function listSlugs() {
  const snap = await db.collection("archives").select("slug", "title").get();
  snap.docs.forEach(d => {
    console.log(JSON.stringify({ id: d.id, slug: d.data().slug, title: d.data().title }));
  });
  process.exit(0);
}

listSlugs().catch(e => { console.error(e); process.exit(1); });

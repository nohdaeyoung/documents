import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "유효하지 않은 이메일입니다." }, { status: 400 });
  }

  const normalized = email.toLowerCase().trim();

  // Check duplicate
  const existing = await adminDb
    .collection("subscribers")
    .where("email", "==", normalized)
    .limit(1)
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0];
    if (doc.data().active) {
      return NextResponse.json({ error: "이미 구독 중인 이메일입니다." }, { status: 409 });
    }
    // Re-activate if previously unsubscribed
    await doc.ref.update({ active: true, subscribedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomUUID();

  await adminDb.collection("subscribers").add({
    email: normalized,
    active: true,
    token,
    subscribedAt: FieldValue.serverTimestamp(),
  });

  // Send welcome email (non-blocking)
  sendWelcomeEmail(normalized, token).catch((err) =>
    console.error("Welcome email failed:", err)
  );

  return NextResponse.json({ ok: true });
}

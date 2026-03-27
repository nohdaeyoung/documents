import { Resend } from "resend";
import { adminDb } from "@/lib/firebase/admin";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://doc.324.ing";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "324 Archives <noreply@324.ing>";

function newArchiveEmailHtml({
  title,
  categoryLabel,
  date,
  slug,
  unsubscribeUrl,
}: {
  title: string;
  categoryLabel: string;
  date: string;
  slug: string;
  unsubscribeUrl: string;
}) {
  const archiveUrl = `${APP_URL}/archives/${encodeURIComponent(slug)}`;
  return `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:'Noto Sans KR',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#e8843c;border-radius:12px 12px 0 0;padding:28px 36px;">
          <p style="margin:0;font-size:13px;color:#faf6ef;letter-spacing:0.08em;opacity:0.85;">324 LECTURE &amp; STUDY ARCHIVES</p>
          <p style="margin:6px 0 0;font-size:11px;color:#faf6ef;opacity:0.65;">새 아카이브가 추가되었습니다</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#faf6ef;padding:36px 36px 28px;border-left:1px solid #e8ddd0;border-right:1px solid #e8ddd0;">
          <p style="margin:0 0 8px;font-size:11px;color:#a39485;letter-spacing:0.05em;text-transform:uppercase;">${categoryLabel} · ${date}</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#2c1810;line-height:1.4;">${title}</h1>
          <a href="${archiveUrl}" style="display:inline-block;background:#e8843c;color:#faf6ef;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;">아카이브 읽기 →</a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f0ebe1;border-radius:0 0 12px 12px;border:1px solid #e8ddd0;border-top:none;padding:20px 36px;">
          <p style="margin:0;font-size:12px;color:#9e9086;line-height:1.6;">
            이 메일은 <strong>${APP_URL}</strong> 업데이트 알림을 구독하셨기 때문에 발송되었습니다.<br>
            <a href="${unsubscribeUrl}" style="color:#b07050;text-decoration:underline;">구독 취소</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendNewArchiveNotification({
  title,
  categoryLabel,
  date,
  slug,
}: {
  title: string;
  categoryLabel: string;
  date: string;
  slug: string;
}) {
  const snap = await adminDb
    .collection("subscribers")
    .where("active", "==", true)
    .get();

  if (snap.empty) return;

  const emails = snap.docs.map((doc) => ({
    email: doc.data().email as string,
    token: doc.data().token as string,
  }));

  // Send in batches of 50 (Resend batch limit)
  const batches: typeof emails[] = [];
  for (let i = 0; i < emails.length; i += 50) {
    batches.push(emails.slice(i, i + 50));
  }

  for (const batch of batches) {
    await Promise.allSettled(
      batch.map(({ email, token }) =>
        getResend().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: `[324 Archives] ${title}`,
          html: newArchiveEmailHtml({
            title,
            categoryLabel,
            date,
            slug,
            unsubscribeUrl: `${APP_URL}/api/unsubscribe?token=${token}`,
          }),
        })
      )
    );
  }
}

export async function sendWelcomeEmail(email: string, token: string) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "[324 Archives] 구독이 완료되었습니다",
    html: `<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="background:#e8843c;border-radius:12px 12px 0 0;padding:28px 36px;">
          <p style="margin:0;font-size:13px;color:#faf6ef;letter-spacing:0.08em;">324 LECTURE &amp; STUDY ARCHIVES</p>
        </td></tr>
        <tr><td style="background:#faf6ef;padding:36px;border-left:1px solid #e8ddd0;border-right:1px solid #e8ddd0;">
          <h1 style="margin:0 0 12px;font-size:20px;color:#2c1810;">구독이 완료되었습니다</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#6b5c4f;line-height:1.7;">새 아카이브가 추가될 때마다 이메일로 알려드릴게요.</p>
          <a href="${APP_URL}" style="display:inline-block;background:#e8843c;color:#faf6ef;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:6px;">아카이브 보러 가기 →</a>
        </td></tr>
        <tr><td style="background:#f0ebe1;border-radius:0 0 12px 12px;border:1px solid #e8ddd0;border-top:none;padding:20px 36px;">
          <p style="margin:0;font-size:12px;color:#9e9086;">
            <a href="${APP_URL}/api/unsubscribe?token=${token}" style="color:#b07050;text-decoration:underline;">구독 취소</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

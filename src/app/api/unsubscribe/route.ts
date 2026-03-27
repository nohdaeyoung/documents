import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse("잘못된 링크입니다.", { status: 400 });
  }

  const snap = await adminDb
    .collection("subscribers")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (!snap.empty) {
    await snap.docs[0].ref.update({ active: false });
  }

  return new NextResponse(
    `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>구독 취소 완료</title>
  <style>
    body { margin: 0; background: #f5f0e8; font-family: Helvetica, Arial, sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #faf6ef; border: 1px solid #e8ddd0; border-radius: 12px;
            padding: 48px 40px; text-align: center; max-width: 400px; }
    h1 { margin: 0 0 12px; font-size: 20px; color: #2c1810; }
    p { margin: 0 0 28px; font-size: 14px; color: #6b5c4f; line-height: 1.6; }
    a { display: inline-block; background: #e8843c; color: #faf6ef; text-decoration: none;
        font-size: 14px; font-weight: 600; padding: 10px 24px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>구독이 취소되었습니다</h1>
    <p>더 이상 새 아카이브 알림을 받지 않습니다.</p>
    <a href="/">아카이브로 돌아가기</a>
  </div>
</body>
</html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

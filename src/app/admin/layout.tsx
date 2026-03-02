"use client";

import { AuthProvider } from "@/lib/firebase/auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}

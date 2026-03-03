"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ArchiveViewer({
  contentHtml,
  title,
}: {
  contentHtml: string;
  title: string;
}) {
  const router = useRouter();

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data?.type === "navigate") {
        router.push(e.data.url || "/");
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <iframe
      srcDoc={contentHtml}
      title={title}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
      sandbox="allow-scripts allow-popups"
    />
  );
}

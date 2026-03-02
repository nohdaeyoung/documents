"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ArchiveViewer({
  contentHtml,
  title,
}: {
  contentHtml: string;
  title: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  const handleMessage = useCallback(
    (e: MessageEvent) => {
      if (e.data?.type === "resize" && iframeRef.current) {
        iframeRef.current.style.height = e.data.height + "px";
      }
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
      ref={iframeRef}
      srcDoc={contentHtml}
      title={title}
      className="w-full border-none rounded-lg"
      style={{ minHeight: "80vh" }}
      sandbox="allow-scripts allow-same-origin allow-popups"
    />
  );
}

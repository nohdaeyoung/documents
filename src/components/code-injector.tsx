"use client";

import { useEffect } from "react";

export function HeadCodeInjector({ code }: { code: string }) {
  useEffect(() => {
    if (!code.trim()) return;
    const container = document.createElement("div");
    container.innerHTML = code;
    // Move all children to <head>
    Array.from(container.childNodes).forEach((node) => {
      const clone = node.cloneNode(true) as Element;
      // Re-create script tags so they actually execute
      if (clone.nodeName === "SCRIPT") {
        const script = document.createElement("script");
        Array.from((clone as HTMLScriptElement).attributes).forEach((attr) =>
          script.setAttribute(attr.name, attr.value)
        );
        script.textContent = (clone as HTMLScriptElement).textContent;
        document.head.appendChild(script);
      } else {
        document.head.appendChild(clone);
      }
    });
  }, [code]);

  return null;
}

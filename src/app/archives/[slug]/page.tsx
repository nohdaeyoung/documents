import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArchiveViewer from "@/components/archive-viewer";

export const revalidate = 60;

async function getArchive(slug: string) {
  const snap = await adminDb
    .collection("archives")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() } as {
    id: string;
    slug: string;
    title: string;
    categoryId: string;
    contentHtml: string;
    date: string;
    size: number;
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const archive = await getArchive(decodeURIComponent(slug));
  if (!archive) return { title: "Not Found" };

  return {
    title: `${archive.title} — 324 Archives`,
    openGraph: {
      title: archive.title,
      url: `https://d.324.ing/archives/${archive.slug}`,
      images: ["/og-image.png"],
    },
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archive = await getArchive(decodeURIComponent(slug));

  if (!archive) notFound();

  // Inject resize observer and navigation interception script
  const injectedScript = `
<script>
  new ResizeObserver(() => {
    parent.postMessage({
      type: 'resize',
      height: document.documentElement.scrollHeight
    }, '*');
  }).observe(document.documentElement);

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && (a.href.includes('/documents') || a.href.includes('d.324.ing') || a.href.includes('doc.324.ing'))) {
      e.preventDefault();
      parent.postMessage({ type: 'navigate', url: '/' }, '*');
    }
  });
</script>`;

  const contentHtml = archive.contentHtml.replace(
    "</body>",
    injectedScript + "</body>"
  );

  return (
    <div className="relative z-1 max-w-[960px] mx-auto px-6 pt-8 pb-20">
      <nav className="mb-6 flex items-center gap-3">
        <a
          href="/"
          className="text-[var(--muted)] hover:text-[var(--fg)] transition-colors text-[0.9rem] no-underline flex items-center gap-1.5"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Archives
        </a>
        <span className="text-[var(--border)]">|</span>
        <span className="text-[0.85rem] text-[var(--muted)] truncate">
          {archive.title}
        </span>
      </nav>

      <ArchiveViewer contentHtml={contentHtml} title={archive.title} />
    </div>
  );
}

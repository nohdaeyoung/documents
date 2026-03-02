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

  // Intercept back-navigation links inside the iframe
  const injectedScript = `
<script>
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

  return <ArchiveViewer contentHtml={contentHtml} title={archive.title} />;
}

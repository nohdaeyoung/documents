import { adminDb } from "@/lib/firebase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ArchiveViewer from "@/components/archive-viewer";
import { cache } from "react";

export async function generateStaticParams() {
  const snap = await adminDb
    .collection("archives")
    .select("slug")
    .get();
  return snap.docs
    .filter((doc) => doc.data().slug)
    .map((doc) => ({ slug: doc.data().slug as string }));
}

const getArchive = cache(async function getArchive(slug: string) {
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
});

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
      locale: "ko_KR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: archive.title,
      images: ["/og-image.png"],
    },
  };
}

type NavItem = { slug: string; title: string };

async function getAdjacentArchives(date: string): Promise<{ prev: NavItem | null; next: NavItem | null }> {
  const [prevSnap, nextSnap] = await Promise.all([
    adminDb.collection("archives").where("date", "<", date).orderBy("date", "desc").select("slug", "title").limit(1).get(),
    adminDb.collection("archives").where("date", ">", date).orderBy("date", "asc").select("slug", "title").limit(1).get(),
  ]);
  const prev = prevSnap.empty ? null : { slug: prevSnap.docs[0].data().slug as string, title: prevSnap.docs[0].data().title as string };
  const next = nextSnap.empty ? null : { slug: nextSnap.docs[0].data().slug as string, title: nextSnap.docs[0].data().title as string };
  return { prev, next };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const archive = await getArchive(decodeURIComponent(slug));

  if (!archive) notFound();

  const { prev, next } = await getAdjacentArchives(archive.date);

  // Intercept back-navigation links inside the iframe
  const injectedScript = `
<script>
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const rawHref = a.getAttribute('href') || '';

    // ── In-page anchor links (TOC navigation) ──────────────────
    // srcdoc+allow-same-origin inherits parent baseURI, so clicking
    // href="#section" would cause the iframe to navigate (reload) to
    // "https://d.324.ing/archives/slug#section" instead of scrolling.
    // Fix: preventDefault + manual scrollIntoView.
    if (rawHref.startsWith('#')) {
      e.preventDefault();
      const id = rawHref.slice(1);
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // Also handle resolved hrefs that contain a fragment
    if (a.href.includes('#')) {
      e.preventDefault();
      const hash = a.href.split('#')[1];
      const target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // ── Back-navigation to archives main page ───────────────────
    if (a.href.includes('/documents') || a.href.includes('d.324.ing') || a.href.includes('doc.324.ing')) {
      e.preventDefault();
      parent.postMessage({ type: 'navigate', url: '/' }, '*');
    }
  });
</script>`;

  const contentHtml = archive.contentHtml.replace(
    "</body>",
    injectedScript + "</body>"
  );

  return <ArchiveViewer contentHtml={contentHtml} title={archive.title} prev={prev} next={next} />;
}

import { adminDb } from "@/lib/firebase/admin";
import type { MetadataRoute } from "next";

export const revalidate = 3600; // 1시간마다 재검증

const BASE_URL = "https://d.324.ing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [archivesSnap, categoriesSnap] = await Promise.all([
    adminDb
      .collection("archives")
      .select("slug", "date", "updatedAt")
      .get(),
    adminDb
      .collection("categories")
      .select()
      .get(),
  ]);

  const archiveUrls: MetadataRoute.Sitemap = archivesSnap.docs
    .filter((doc) => doc.data().slug)
    .map((doc) => {
      const data = doc.data();
      const lastMod = data.updatedAt?.toDate?.() ?? (data.date ? new Date(data.date) : new Date());
      return {
        url: `${BASE_URL}/archives/${data.slug}`,
        lastModified: lastMod,
        changeFrequency: "monthly",
        priority: 0.7,
      };
    });

  const categoryUrls: MetadataRoute.Sitemap = categoriesSnap.docs.map((doc) => ({
    url: `${BASE_URL}/category/${doc.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/colophon`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/notes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...categoryUrls, ...archiveUrls];
}

export interface Archive {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  contentHtml: string;
  fileExt: string;
  size: number;
  date: string;
  displayOrder: number;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchiveListItem {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  date: string;
}

export interface Category {
  id: string;
  label: string;
  color: string;
  displayOrder: number;
  createdAt: Date;
}

export interface Post {
  id: string;
  publishDate: Date;
  draft: boolean;
  canonical: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  imageCreditUrl: string | null;
  content: string; // or 'body' in case you consume from API
  excerpt: string;
  authors: string[];
  category: string;
  tags: string[];
  readingTime: number;
  tweet: string;
}

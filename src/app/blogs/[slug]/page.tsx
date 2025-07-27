import { blogsData } from "@/data/blogs-data/blogs-data";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/blogs/blog-article/blog-article";

interface BlogPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const blog = blogsData.find((blog) => blog.slug === slug);

  if (!blog) {
    notFound();
  }

  return <BlogArticle blog={blog} />;
}

export async function generateStaticParams() {
  return blogsData.map((blog) => ({
    slug: blog.slug,
  }));
}
import { blogsData } from "@/data/blogs-data/blogs-data";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/blogs/blog-article/blog-article";

interface BlogPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPage({ params }: BlogPageProps) {
  const blog = blogsData.find((blog) => blog.slug === params.slug);

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
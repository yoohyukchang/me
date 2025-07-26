import { blogsData } from "@/data/blogs-data/blogs-data";
import Link from "next/link";

export default function BlogPreview() {
  const recentBlogs = blogsData.slice(0, 3);

  return (
    <section id="blog" className="py-20">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Life Blogs</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentBlogs.map((blog) => (
          <div key={blog.id} className="bg-gray-50 p-6 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">{blog.date}</p>
            <h3 className="text-xl font-medium mb-3">{blog.title}</h3>
            <p className="text-gray-600 mb-4">{blog.excerpt}</p>
            <Link href={`/blogs/${blog.slug}`} className="text-black font-medium text-sm inline-flex items-center">
              Read more
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/blogs" className="inline-block border border-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-black hover:text-white transition-colors">
          View all blog entries
        </Link>
      </div>
    </section>
  );
}
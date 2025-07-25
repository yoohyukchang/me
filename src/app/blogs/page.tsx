import { blogsData } from "@/components/home-page-components/blogs-preview/blogs-data";
import BlogCard from "@/components/blogs-page-components/blog-card";

export default function BlogsPage() {
  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 mt-10">
            Life Blogs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Personal reflections, learning experiences, and insights from my journey 
            in technology, career, and life. Welcome to my thoughts and stories.
          </p>
        </div>

        {/* Blog Feed */}
        <div className="space-y-8">
          {blogsData.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>

        {/* Load More Section */}
        <div className="text-center mt-16 pt-12 border-t border-gray-200">
          <p className="text-gray-500 mb-6">
            That's all for now! More posts coming soon.
          </p>
          <a 
            href="/#contact" 
            className="inline-block border border-black px-8 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
          >
            Get in touch
          </a>
        </div>
      </div>
    </main>
  );
}
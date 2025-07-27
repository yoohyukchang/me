import Link from "next/link";
import { blogsData } from "@/data/blogs-data/blogs-data";
import FeaturedBlogCard from "@/components/blogs/featured-blog-card/featured-blog-card";
import CompactBlogCard from "@/components/blogs/compact-blog-card/compact-blog-card";

export default function BlogsPage() {
  const [featuredPost, ...otherPosts] = blogsData;

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-7xl mx-auto">
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

        {/* Featured Post */}
        <div className="mb-16">
          <FeaturedBlogCard blog={featuredPost} />
        </div>

        {/* Recent Posts Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Recent Posts</h2>
            <div className="h-px bg-gray-200 flex-1 ml-6"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((blog) => (
              <CompactBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>

        {/* Newsletter/Contact Section */}
        <div className="text-center mt-20 pt-16 border-t border-gray-200">
          <div className="max-w-lg mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-600 mb-8">
              Get notified when I publish new posts about technology, career insights, and life experiences.
            </p>
            <Link 
              href="/#contact" 
              className="inline-block border border-black px-8 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
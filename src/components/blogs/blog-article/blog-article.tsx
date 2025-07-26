import { BlogPost } from "@/data/blogs-data/blogs-data";
import Image from "next/image";
import Link from "next/link";
import "./blog-article.css";

interface BlogArticleProps {
  blog: BlogPost;
}

export default function BlogArticle({ blog }: BlogArticleProps) {
  return (
    <article className="blog-article">
      {/* Hero Section with Cover Image */}
      <div className="blog-article-hero">
        {blog.image && (
          <div className="blog-article-cover">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              className="blog-article-cover-image"
              priority
            />
            <div className="blog-article-cover-overlay" />
          </div>
        )}
        
        <div className="blog-article-hero-content">
          <div className="blog-article-meta">
            <time className="blog-article-date">{blog.date}</time>
            <span className="blog-article-separator">•</span>
            <span className="blog-article-read-time">{blog.readTime}</span>
          </div>
          
          <h1 className="blog-article-title">{blog.title}</h1>
          
          <div className="blog-article-tags">
            {blog.tags.map((tag) => (
              <span key={tag} className="blog-article-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="blog-article-content">
        <div className="blog-article-prose">
          <p className="blog-article-excerpt">{blog.excerpt}</p>
          
          <div 
            className="blog-article-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </div>

      {/* Back to Blogs */}
      <div className="blog-article-navigation">
        <Link href="/blogs" className="blog-article-back-link">
          <svg 
            className="blog-article-back-icon" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16l-4-4m0 0l4-4m-4 4h18" 
            />
          </svg>
          Back to all blogs
        </Link>
      </div>
    </article>
  );
}
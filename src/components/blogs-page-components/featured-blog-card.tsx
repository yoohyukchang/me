import { BlogPost } from "@/components/home-page-components/blogs-preview/blogs-data";
import "./featured-blog-card.css";

interface FeaturedBlogCardProps {
  blog: BlogPost;
}

export default function FeaturedBlogCard({ blog }: FeaturedBlogCardProps) {
  return (
    <article className="featured-blog-card">
      <div className="featured-blog-card-content">
        <div className="featured-blog-card-meta">
          <time className="featured-blog-card-date">{blog.date}</time>
          <span className="featured-blog-card-separator">•</span>
          <span className="featured-blog-card-read-time">{blog.readTime}</span>
          <span className="featured-blog-card-separator">•</span>
          <span className="featured-blog-card-featured">Featured</span>
        </div>
        
        <h1 className="featured-blog-card-title">
          <a href={`/blogs/${blog.slug}`} className="featured-blog-card-title-link">
            {blog.title}
          </a>
        </h1>
        
        <p className="featured-blog-card-excerpt">{blog.excerpt}</p>
        
        <div className="featured-blog-card-tags">
          {blog.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="featured-blog-card-tag">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="featured-blog-card-actions">
          <a 
            href={`/blogs/${blog.slug}`}
            className="featured-blog-card-link"
          >
            Read full article
            <svg 
              className="featured-blog-card-link-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
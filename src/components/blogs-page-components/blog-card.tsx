import { BlogPost } from "@/components/home-page-components/blogs-preview/blogs-data";
import "./blog-card.css";

interface BlogCardProps {
  blog: BlogPost;
}

export default function BlogCard({ blog }: BlogCardProps) {
  return (
    <article className="blog-card">
      <div className="blog-card-content">
        <div className="blog-card-meta">
          <time className="blog-card-date">{blog.date}</time>
          <span className="blog-card-separator">•</span>
          <span className="blog-card-read-time">{blog.readTime}</span>
        </div>
        
        <h2 className="blog-card-title">
          <a href={`/blogs/${blog.slug}`} className="blog-card-title-link">
            {blog.title}
          </a>
        </h2>
        
        <p className="blog-card-excerpt">{blog.excerpt}</p>
        
        <div className="blog-card-tags">
          {blog.tags.map((tag) => (
            <span key={tag} className="blog-card-tag">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="blog-card-actions">
          <a 
            href={`/blogs/${blog.slug}`}
            className="blog-card-link"
          >
            Read more
            <svg 
              className="blog-card-link-icon" 
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
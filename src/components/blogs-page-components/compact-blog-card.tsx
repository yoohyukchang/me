import { BlogPost } from "@/components/home-page-components/blogs-preview/blogs-data";
import "./compact-blog-card.css";

interface CompactBlogCardProps {
  blog: BlogPost;
}

export default function CompactBlogCard({ blog }: CompactBlogCardProps) {
  return (
    <article className="compact-blog-card">
      <div className="compact-blog-card-content">
        <div className="compact-blog-card-meta">
          <time className="compact-blog-card-date">{blog.date}</time>
          <span className="compact-blog-card-separator">•</span>
          <span className="compact-blog-card-read-time">{blog.readTime}</span>
        </div>
        
        <h3 className="compact-blog-card-title">
          <a href={`/blogs/${blog.slug}`} className="compact-blog-card-title-link">
            {blog.title}
          </a>
        </h3>
        
        <p className="compact-blog-card-excerpt">{blog.excerpt}</p>
        
        <div className="compact-blog-card-tags">
          {blog.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="compact-blog-card-tag">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="compact-blog-card-actions">
          <a 
            href={`/blogs/${blog.slug}`}
            className="compact-blog-card-link"
          >
            Read more
            <svg 
              className="compact-blog-card-link-icon" 
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
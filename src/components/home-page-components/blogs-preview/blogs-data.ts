export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
}

export const blogsData: BlogPost[] = [
  {
    id: 1,
    title: "Summer Internship Reflections",
    excerpt: "Thoughts on my first week at Samsung and the exciting projects ahead. Learning about mobile development, team dynamics, and the fast-paced tech industry.",
    content: "Full blog content would go here...",
    date: "May 5, 2025",
    readTime: "4 min read",
    tags: ["Internship", "Samsung", "Career", "Tech"],
    slug: "summer-internship-reflections"
  },
  {
    id: 2,
    title: "Baltimore's Hidden Gems",
    excerpt: "Exploring some of my favorite local spots in the city during spring break. From cozy coffee shops to scenic waterfront views, Baltimore has so much to offer.",
    content: "Full blog content would go here...",
    date: "April 12, 2025",
    readTime: "6 min read",
    tags: ["Travel", "Baltimore", "Local", "Photography"],
    slug: "baltimore-hidden-gems"
  },
  {
    id: 3,
    title: "Learning to Build with Next.js",
    excerpt: "My journey creating this personal website and what I've learned along the way. From React fundamentals to deployment strategies and performance optimization.",
    content: "Full blog content would go here...",
    date: "March 20, 2025",
    readTime: "8 min read",
    tags: ["Web Development", "Next.js", "React", "Learning"],
    slug: "learning-nextjs"
  },
  {
    id: 4,
    title: "Machine Learning in Healthcare",
    excerpt: "Diving deep into my prostate segmentation project and the intersection of AI and medical imaging. Exploring the challenges and opportunities in healthcare technology.",
    content: "Full blog content would go here...",
    date: "February 28, 2025",
    readTime: "10 min read",
    tags: ["Machine Learning", "Healthcare", "AI", "Research"],
    slug: "ml-in-healthcare"
  },
  {
    id: 5,
    title: "Building Better User Experiences",
    excerpt: "Lessons learned from user testing and feedback on my recent projects. How small design decisions can make a big impact on user satisfaction and engagement.",
    content: "Full blog content would go here...",
    date: "February 10, 2025",
    readTime: "5 min read",
    tags: ["UX Design", "User Testing", "Design", "Product"],
    slug: "building-better-ux"
  },
  {
    id: 6,
    title: "My Coding Journey at Johns Hopkins",
    excerpt: "Reflecting on my computer science education and the projects that shaped my understanding of software development. From algorithms to real-world applications.",
    content: "Full blog content would go here...",
    date: "January 15, 2025",
    readTime: "7 min read",
    tags: ["Education", "Computer Science", "Johns Hopkins", "Learning"],
    slug: "coding-journey-jhu"
  }
];
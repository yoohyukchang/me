export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
  slug: string;
  image?: string;
}

export const blogsData: BlogPost[] = [
  {
    id: 1,
    title: "Summer Internship Reflections",
    excerpt: "Thoughts on my first week at Samsung and the exciting projects ahead.",
    content: "Full blog content would go here...",
    date: "May 5, 2025",
    readTime: "4 min read",
    tags: ["Internship", "Samsung", "Career", "Tech"],
    slug: "summer-internship-reflections",
    image: "/blogs/samsung-internship/samsung-internship.jpg"
  },
  {
    id: 2,
    title: "Baltimore's Hidden Gems",
    excerpt: "Exploring my favorite local spots in the city during spring break.",
    content: "Full blog content would go here...",
    date: "April 12, 2025",
    readTime: "6 min read",
    tags: ["Travel", "Baltimore", "Local", "Photography"],
    slug: "baltimore-hidden-gems"
  },
  {
    id: 3,
    title: "Learning to Build with Next.js",
    excerpt: "My journey creating this personal website and what I've learned.",
    content: "Full blog content would go here...",
    date: "March 20, 2025",
    readTime: "8 min read",
    tags: ["Web Development", "Next.js", "React", "Learning"],
    slug: "learning-nextjs"
  },
  {
    id: 4,
    title: "Machine Learning in Healthcare",
    excerpt: "Diving deep into my prostate segmentation project and AI in medical imaging.",
    content: "Full blog content would go here...",
    date: "February 28, 2025",
    readTime: "10 min read",
    tags: ["Machine Learning", "Healthcare", "AI", "Research"],
    slug: "ml-in-healthcare"
  },
  {
    id: 5,
    title: "Building Better User Experiences",
    excerpt: "Lessons learned from user testing and how design decisions impact engagement.",
    content: "Full blog content would go here...",
    date: "February 10, 2025",
    readTime: "5 min read",
    tags: ["UX Design", "User Testing", "Design", "Product"],
    slug: "building-better-ux"
  },
  {
    id: 6,
    title: "My Coding Journey at Johns Hopkins",
    excerpt: "Reflecting on my computer science education and the projects that shaped me.",
    content: "Full blog content would go here...",
    date: "January 15, 2025",
    readTime: "7 min read",
    tags: ["Education", "Computer Science", "Johns Hopkins", "Learning"],
    slug: "coding-journey-jhu"
  }
];
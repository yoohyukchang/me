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
    content: `
      <p>Starting my summer internship at Samsung has been an incredible journey so far. Just one week in, and I'm already amazed by the scale of innovation happening here and the opportunities that lie ahead.</p>

      <h2>First Impressions</h2>
      <p>Walking into the Samsung campus for the first time was both exciting and intimidating. The sheer size of the operation and the cutting-edge technology everywhere you look really drives home that you're working for one of the world's leading tech companies.</p>
      
      <p>My team welcomed me with open arms, and I was immediately struck by how collaborative and supportive the environment is. Despite Samsung's massive scale, there's a real sense of community and shared purpose among the engineers and designers I've met.</p>

      <h2>The Project</h2>
      <p>I've been assigned to work on mobile development projects, specifically focusing on user interface improvements for Samsung's flagship devices. While I can't share too many specifics due to confidentiality, I can say that the work involves optimizing user experiences and implementing new features that millions of people will eventually use.</p>
      
      <p>What excites me most is how much responsibility I've been given from day one. This isn't just busy work or shadowing – I'm contributing to real products that will ship to consumers worldwide.</p>

      <h2>Learning Curve</h2>
      <p>The technical learning curve has been steep but manageable. Samsung's development practices are sophisticated, with robust testing frameworks, code review processes, and documentation standards that put my university projects to shame.</p>
      
      <p>I'm working with technologies I'd only read about before, and the mentorship from senior engineers has been invaluable. Every day brings new challenges that push me to grow as a developer.</p>

      <h2>Team Dynamics</h2>
      <p>One thing that surprised me was how international and diverse the team is. I'm working alongside engineers from Korea, India, the US, and several European countries. The different perspectives and approaches to problem-solving have already taught me so much about global software development.</p>
      
      <p>The work culture strikes a great balance between being fast-paced and results-oriented while still being respectful of work-life balance. Long hours when needed, but not as a default expectation.</p>

      <h2>Looking Ahead</h2>
      <p>I'm only one week in, but I'm already excited about what the rest of the summer holds. There are several major milestones coming up for our project, and I'll be playing a key role in delivering them.</p>
      
      <p>Beyond the technical work, I'm looking forward to the networking opportunities, learning about Samsung's business strategy, and hopefully contributing something meaningful that will impact millions of users.</p>
      
      <p>This internship is already shaping up to be a defining experience in my career journey, and I can't wait to share more insights as the summer progresses.</p>
    `,
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
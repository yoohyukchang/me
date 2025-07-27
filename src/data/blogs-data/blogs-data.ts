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
    excerpt: "Reflecting on six weeks at Samsung Electronics as an intern in the Digital Appliances division.",
    content: `
    <p>Looking back at my six weeks at Samsung Electronics this summer, I can't help but feel grateful for how much I learned—not just about technology, but about myself as a future engineer. What started as an intimidating leap into one of the world's largest tech companies turned into an experience that genuinely shaped how I think about my career.</p>

    <h2>Landing in Suwon</h2>
    <p>When I first walked into Samsung's headquarters in Suwon, I was honestly overwhelmed. The campus is massive, and knowing that this is where some of the world's most innovative technology gets built was both exciting and nerve-wracking. I kept thinking, "Do I really belong here?"</p>

    <p>What surprised me most was the diversity of the intern cohort. I was surrounded by awesome students from top engineering programs across the US—computer science, electrical engineering, data science, mechanical engineering. Everyone I met there were all really smart individuals.</p>

    <h2>Finding My Place in the Galaxy Ecosystem</h2>
    <p>One thing I quickly learned is just how vast Samsung really is. Most people think of Galaxy phones and TVs, but Samsung has its hands in everything—insurance, credit cards, semiconductors, cloud services. It's like a small economy unto itself. I ended up in Samsung Electronics under the DX (Device Experience) division, specifically in the DA department focused on digital appliances.</p>

    <p>Part of me was curious about the DS semiconductor side—that's where the really cutting-edge chip development happens—but I'm grateful for where I landed. Working on smart home devices taught me that innovation doesn't always have to be flashy to be meaningful.</p>

    <h2>The Deep End of Deep Learning</h2>
    <p>Here's where things got real: I was assigned to work on On-Device AI for Samsung's smart vacuum cleaners. The goal was to automatically detect floor types and adjust cleaning modes without user intervention. Sounds straightforward, right? Well, not when you've never actually built a deep learning model before.</p>

    <p>I felt completely out of my depth at first. I knew the theoretical concepts from my classes, but implementing neural networks with Keras was entirely new territory. The company's internal AI tools weren't particularly helpful either, and we couldn't use external AI assistants like ChatGPT. So there I was, frantically reading Medium articles and documentation, trying to understand multitask learning frameworks and transfer learning techniques.</p>

    <p>What saved me was my team. The engineers were incredibly patient, walking me through concepts I should probably already have known. They helped me understand not just the "how" but the "why" behind different architectural decisions. Slowly, things started clicking, and I began contributing meaningfully on the works and research I needed to do.</p>

    <h2>Beyond the Code</h2>
    <p>The technical work was challenging, but what struck me most were the people I worked with. The leadership I encountered had this ability to see the bigger picture that I found inspiring. I remember being in a design review meeting where a senior engineer quietly listened to presentations, then pointed out edge cases and potential issues that none of us had considered. It made me realize that becoming a good engineer isn't just about coding skills—it's about developing the vision to see the forest, not just the trees.</p>

    <p>Also, can we talk about the food? I'm not exaggerating when I say the cafeteria might have been my favorite part of the internship. Our building didn't have its own food court, so we'd walk to the neighboring building, but their cafeteria was incredible. Korean dishes, American options, vegetarian choices—it was like having a food festival every day. I may have stayed longer at lunch than I should have on multiple occasions.</p>

    <h2>Testing My Limits</h2>
    <p>Samsung gave us three chances to take their coding assessment throughout the internship. I failed the first one. The problems weren't typical LeetCode-style questions but rather simulation-based challenges that required building multiple interconnected functions to solve complex scenarios. Initially, I found this format intimidating, but I actually came to appreciate it. These problems felt more like real engineering challenges rather than memorized algorithmic puzzles.</p>

    <p>Thankfully, I passed on my second round. The experience taught me that failure isn't the end of the world—it's just feedback on what I need to improve.</p>

    <h2>Reflections on Growth</h2>
    <p>Six weeks might seem short, but the intensity of the experience made every day count. I went from feeling intimidated by deep learning to actually optimizing neural network architectures. I learned to navigate a massive corporate environment while still maintaining genuine connections with teammates from around the world.</p>

    <p>Most importantly, I gained confidence in my ability to tackle unfamiliar challenges. When you're thrown into the deep end and manage to swim, you realize you're more capable than you initially thought. The technical skills I developed were valuable, but the mindset shift—from "I don't know how to do this" to "I don't know how to do this yet"—was transformative.</p>

    <p>Now I'm more curious about the semiconductor industry now (maybe I'll find my way to the DS division someday), more confident in my problem-solving abilities, and definitely more appreciative of good cafeteria food. But mostly, I'm excited about the kind of engineer I'm becoming and the problems I'll get to solve in the future.</p>
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
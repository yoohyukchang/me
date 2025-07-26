export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
}

export const projectsData: Project[] = [
  {
    id: "codahx",
    title: "CodaHx, Inc.",
    description: "AI-driven analysis to help you navigate each stage of maternity care billing, from pregnancy through delivery and beyond.",
    image: "/projects/codahx/codahx-thumbnail.png",
    tags: ["Next.js", "Tailwind CSS", "Stripe"],
    link: "https://www.codahx.com"
  },
  {
    id: "prostate-segmentation",
    title: "Prostate Segmentation",
    description: "A dashboard application for monitoring real-time data with customizable widgets.",
    image: "/projects/prostate-segmentation/prostate-segmentation-thumbnail.png",
    tags: ["React", "D3.js", "Firebase"],
    link: "https://drive.google.com/file/d/1WuoOK2rMWTmDD39PTFoEAoEXBx2hYG0a/edit"
  },
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    description: "A full-stack e-commerce solution with inventory management, payment processing, and real-time analytics.",
    image: "/projects/ecommerce/ecommerce-thumbnail.png",
    tags: ["Node.js", "PostgreSQL", "Redis"],
    link: "#"
  },
  {
    id: "ml-pipeline",
    title: "ML Data Pipeline",
    description: "Automated machine learning pipeline for processing large datasets and generating predictive models.",
    image: "/projects/ml-pipeline/ml-pipeline-thumbnail.png",
    tags: ["Python", "TensorFlow", "Docker"],
    link: "#"
  },
  {
    id: "mobile-app",
    title: "Health Tracking App",
    description: "Cross-platform mobile application for tracking health metrics with social features and gamification.",
    image: "/projects/health-app/health-app-thumbnail.png",
    tags: ["React Native", "GraphQL", "MongoDB"],
    link: "#"
  }
];
import { ProjectCard } from "@/components/project-card";
import Link from "next/link";

export default function ProjectsPreview() {
  return (
    <section id="projects" className="py-20">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Projects & Creations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectCard 
          title="Project One"
          description="A minimalist e-commerce platform focused on user experience and conversion optimization."
          image="/project1.jpg"
          tags={["Next.js", "Tailwind CSS", "Stripe"]}
          link="#"
        />
        <ProjectCard 
          title="Project Two"
          description="A dashboard application for monitoring real-time data with customizable widgets."
          image="/project2.jpg"
          tags={["React", "D3.js", "Firebase"]}
          link="#"
        />
      </div>
      
      {/* View All Projects Button */}
      <div className="mt-12 text-center">
        <Link 
          href="/projects" 
          className="inline-block border border-black px-6 py-3 rounded-lg font-medium text-sm hover:bg-black hover:text-white transition-colors"
        >
          View all projects
        </Link>
      </div>
    </section>
  );
}
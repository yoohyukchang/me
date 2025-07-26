import { projectsData } from "@/data/projects-data/projects-data";
import ProjectCard from "@/components/projects-page-components/project-card";

export default function ProjectsPage() {
  return (
    <main className="container mx-auto px-6 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 mt-10">
            My Projects
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A collection of my work spanning web development, machine learning, and software engineering. 
            Each project represents a unique challenge and learning opportunity.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Contact Section */}
        <div className="text-center mt-20 pt-16 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-4">
            Interested in working together?
          </h2>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            I'm always open to discussing new opportunities and interesting projects.
          </p>
          <a 
            href="/#contact" 
            className="inline-block border border-black px-8 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition-colors"
          >
            Get in touch
          </a>
        </div>
      </div>
    </main>
  );
}
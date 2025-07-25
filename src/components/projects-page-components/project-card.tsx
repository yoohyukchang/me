import { Project } from "@/components/home-page-components/projects-preview/projects-data";
import "./project-card.css";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="project-card">
      <div 
        className="project-card-image"
        style={{
          backgroundImage: `url(${project.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="project-card-content">
        <div>
          <h3 className="project-card-title">{project.title}</h3>
          <p className="project-card-description">{project.description}</p>
        </div>
        <div className="project-card-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-card-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="project-card-actions">
          <a 
            href={project.link}
            className="project-card-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Project
            <svg 
              className="project-card-link-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
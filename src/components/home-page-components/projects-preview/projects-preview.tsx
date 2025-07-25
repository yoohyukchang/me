'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { projectsData } from "./projects-data";
import "./projects-preview.css";

export default function ProjectsPreview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % projectsData.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + projectsData.length) % projectsData.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const getCardPosition = (index: number) => {
    const diff = index - currentIndex;
    const length = projectsData.length;
    
    // Handle wrap-around
    let normalizedDiff = diff;
    if (Math.abs(diff) > length / 2) {
      normalizedDiff = diff > 0 ? diff - length : diff + length;
    }

    if (normalizedDiff === 0) return 'center';
    if (normalizedDiff === -1) return 'left';
    if (normalizedDiff === 1) return 'right';
    if (normalizedDiff === -2) return 'hidden-left';
    if (normalizedDiff === 2) return 'hidden-right';
    return 'far-hidden';
  };

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) {
        nextSlide();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <section id="projects" className="py-30">
      <h2 className="text-3xl font-bold tracking-tight mb-8 text-center">
        Projects & Creations
      </h2>
      
      <div className="carousel-container">
        <div className="carousel-track">
          {projectsData.map((project, index) => (
            <div
              key={project.id}
              className={`carousel-card ${getCardPosition(index)}`}
              onClick={() => goToSlide(index)}
            >
              <div 
                className="card-image"
                style={{
                  backgroundImage: `url(${project.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <div className="card-content">
                <div>
                  <h3 className="card-title">{project.title}</h3>
                  <p className="card-description">{project.description}</p>
                </div>
                <div className="card-tags">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="card-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button 
          className="carousel-nav prev" 
          onClick={prevSlide}
          aria-label="Previous project"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button 
          className="carousel-nav next" 
          onClick={nextSlide}
          aria-label="Next project"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Indicators */}
        <div className="carousel-indicators">
          {projectsData.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* View All Projects Button */}
      <div className="mt-16 text-center">
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
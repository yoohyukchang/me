import Image from "next/image";
import { ProjectCard } from "@/components/project-card";
import { SkillBadge } from "@/components/skill-badge";
import { ContactForm } from "@/components/contact-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-[#e5e7eb]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tighter">YOUR NAME</h2>
          <ul className="hidden md:flex space-x-8">
            <li><a href="#about" className="text-[#6b7280] hover:text-black transition-colors">About</a></li>
            <li><a href="#projects" className="text-[#6b7280] hover:text-black transition-colors">Projects</a></li>
            <li><a href="#skills" className="text-[#6b7280] hover:text-black transition-colors">Skills</a></li>
            <li><a href="#contact" className="text-[#6b7280] hover:text-black transition-colors">Contact</a></li>
          </ul>
          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container mx-auto px-6 pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 md:py-32 flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1 space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-tight">
              Creative
              <br />
              Developer
              <br />
              <span className="text-gray-400">& Designer</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              I craft beautiful digital experiences and create engaging interfaces that people love to use.
            </p>
            <div className="pt-4">
              <a 
                href="#contact" 
                className="inline-block bg-black text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
              >
                Get in touch
              </a>
            </div>
          </div>
          <div className="relative w-full md:w-1/2 aspect-square">
            <div className="absolute inset-0 bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src="/profile-photo.jpg"
                alt="Your Name"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-20 flex flex-col md:flex-row gap-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight mb-8">About Me</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Hello! I'm [YOUR NAME], a passionate developer and designer with a focus on creating clean, 
                functional, and visually appealing digital products.
              </p>
              <p>
                With [X] years of experience in the industry, I've developed a strong set of skills that 
                allow me to build comprehensive solutions from concept to deployment.
              </p>
              <p>
                I believe in the power of minimalist design, attention to detail, and creating 
                user-centered experiences that solve real problems.
              </p>
            </div>
          </div>
          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Education</h3>
              <p className="text-gray-600">B.S. Computer Science, Johns Hopkins University (2022- 2026)</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Experience</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Software Development Engineer Intern - Amazon</p>
                  <p className="text-gray-600 text-sm">June 2025 - August 2025</p>
                </div>
                <div>
                  <p className="font-medium">Software Engineer Intern - Samsung Electronics</p>
                  <p className="text-gray-600 text-sm">June 2024 - August 2024</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Projects Section */}
        <section id="projects" className="py-20">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Selected Projects</h2>
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
            <ProjectCard 
              title="Project Three"
              description="A mobile-first web application for tracking fitness goals and progress."
              image="/project3.jpg"
              tags={["Next.js", "TypeScript", "MongoDB"]}
              link="#"
            />
            <ProjectCard 
              title="Project Four"
              description="A content management system built for performance and ease of use."
              image="/project4.jpg"
              tags={["Next.js", "Prisma", "PostgreSQL"]}
              link="#"
            />
          </div>
        </section>
        
        {/* Skills Section */}
        <section id="skills" className="py-20">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Skills & Technologies</h2>
          <div className="flex flex-wrap gap-3">
            <SkillBadge name="JavaScript" />
            <SkillBadge name="TypeScript" />
            <SkillBadge name="React" />
            <SkillBadge name="Next.js" />
            <SkillBadge name="Tailwind CSS" />
            <SkillBadge name="Node.js" />
            <SkillBadge name="Express" />
            <SkillBadge name="MongoDB" />
            <SkillBadge name="PostgreSQL" />
            <SkillBadge name="GraphQL" />
            <SkillBadge name="Figma" />
            <SkillBadge name="Adobe XD" />
            <SkillBadge name="UI/UX Design" />
            <SkillBadge name="Responsive Design" />
            <SkillBadge name="Git" />
            <SkillBadge name="CI/CD" />
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-20">
          <h2 className="text-3xl font-bold tracking-tight mb-8">Get In Touch</h2>
          <div className="flex flex-col md:flex-row gap-16">
            <div className="flex-1 space-y-6">
              <p className="text-gray-600">
                I'm currently available for freelance work and interesting projects.
                If you have a project that needs some creative coding, I'd love to hear about it.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  <span className="text-gray-600">hello@yourname.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M12 18h.01"/></svg>
                  <span className="text-gray-600">+1 (555) 123-4567</span>
                </div>
              </div>
              <div className="pt-8 flex gap-4">
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>
            <div className="flex-1">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Your Name. All rights reserved.</p>
          <p className="text-sm mt-2">Designed and built with Next.js and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
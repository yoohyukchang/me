import Hero from "@/components/home/hero/hero";
import About from "@/components/home/about/about";
import ProjectsPreview from "@/components/home/projects-preview/projects-preview";
import BlogPreview from "@/components/home/blogs-preview/blogs-preview";
// import Skills from "@/components/home/skills/skills";
import Contact from "@/components/home/contact/contact";

export default function Home() {
  return (
    <main className="container mx-auto px-6 pb-16">
      <Hero />
      <About />
      <ProjectsPreview />
      <BlogPreview />

      {/* Currently 'Skills' section is disabled because I just don't like it to have it displayed :) */}
      {/* Read `src/components/skills/skills.tsx` to know about this in more detail. */}
      {/* <Skills /> */}

      <Contact />
    </main>
  );
}
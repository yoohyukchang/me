import Navbar from "@/components/home-components/navbar/nav-bar";
import Hero from "@/components/home-components/hero/hero";
import About from "@/components/home-components/about/about";
import ProjectsPreview from "@/components/home-components/projects-preview/projects-preview";
import JournalPreview from "@/components/home-components/journals-preview/journals-preview";
import Skills from "@/components/home-components/skills/skills";
import Contact from "@/components/home-components/contact/contact";
import Footer from "@/components/home-components/footer/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="container mx-auto px-6 pt-24 pb-16">
        <Hero />
        <About />
        <ProjectsPreview />
        <JournalPreview />
        <Skills />
        <Contact />
      </main>
      
      <Footer />
    </div>
  );
}
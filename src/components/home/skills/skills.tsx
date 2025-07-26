import { SkillBadge } from "@/components/home-page-components/skills/skill-badge";

/**
 * 
 * This section (function) is currently not in use. It's commented out in `src/app/page.tsx`.
 * Uncomment this part in the `page.tsx` to display this Skills section.
 * Also The nav bar needs to be updated to have the 'Skills' section later.
 * 
 */

export default function Skills() {
  return (
    <section id="skills" className="py-20">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Skills & Interests</h2>
      <div className="flex flex-wrap gap-3">
        <SkillBadge name="Python" />
        <SkillBadge name="JavaScript" />
        <SkillBadge name="TypeScript" />
        <SkillBadge name="React" />
        <SkillBadge name="Next.js" />
        <SkillBadge name="Tailwind CSS" />
        <SkillBadge name="Node.js" />
        <SkillBadge name="Express" />
        <SkillBadge name="PostgreSQL" />
        <SkillBadge name="Photography" />
        <SkillBadge name="Travel" />
      </div>
    </section>
  );
}
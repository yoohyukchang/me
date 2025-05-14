import { SkillBadge } from "@/components/skill-badge";

export default function Skills() {
  return (
    <section id="skills" className="py-20">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Skills & Interests</h2>
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
        <SkillBadge name="Python" />
        <SkillBadge name="Photography" />
        <SkillBadge name="Coffee Brewing" />
        <SkillBadge name="Hiking" />
        <SkillBadge name="Reading" />
        <SkillBadge name="Travel" />
      </div>
    </section>
  );
}
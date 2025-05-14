interface SkillBadgeProps {
    name: string;
  }
  
  export function SkillBadge({ name }: SkillBadgeProps) {
    return (
      <div className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
        {name}
      </div>
    );
  }
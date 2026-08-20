const SKILLS = [
  { category: "Frontend", items: ["React", "TypeScript", "Vite", "Flutter"] },
  { category: "3D / WebGL", items: ["Three.js", "React Three Fiber", "GLSL"] },
  {
    category: "Backend",
    items: ["NodeJS", "Go", "Python", "Firebase", "AWS", "SQL", "Bash"],
  },
  {
    category: "Tools",
    items: [
      "Git",
      "GitHub Actions",
      "Docker",
      "Linux",
      "Figma",
      "Claude Code",
      "Antigravity",
    ],
  },
];

export default function SkillsPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Skills</h2>
      <div className="panel-skills">
        {SKILLS.map(({ category, items }) => (
          <div key={category} className="panel-skill-group">
            <h3 className="panel-skill-category">{category}</h3>
            <div className="panel-skill-tags">
              {items.map((item) => (
                <span key={item} className="panel-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

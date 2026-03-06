const SKILLS = [
  { category: 'Frontend', items: ['React', 'TypeScript', 'Vite'] },
  { category: '3D / WebGL', items: ['Three.js', 'React Three Fiber', 'GLSL'] },
  { category: 'Backend', items: ['Node.js', 'Python'] },
  { category: 'Tools', items: ['Git', 'Figma', 'Blender'] },
]

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
  )
}

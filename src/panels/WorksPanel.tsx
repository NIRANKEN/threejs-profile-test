const WORKS = [
  {
    title: "Project Alpha",
    description: "React + Three.js で作ったインタラクティブな3Dビジュアライゼーション。",
    tags: ["React", "Three.js"],
    url: "https://github.com",
  },
  {
    title: "Project Beta",
    description: "フルスタックWebアプリ。リアルタイム機能を実装。",
    tags: ["Node.js", "TypeScript"],
    url: "https://github.com",
  },
  {
    title: "Project Gamma",
    description: "Blenderで作成した3DアセットをWebに組み込んだポートフォリオ作品。",
    tags: ["Blender", "WebGL"],
    url: "https://github.com",
  },
];

export default function WorksPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Works</h2>
      <div className="panel-works">
        {WORKS.map((work) => (
          <a
            key={work.title}
            href={work.url}
            target="_blank"
            rel="noreferrer"
            className="panel-work-card"
          >
            <h3 className="panel-work-title">{work.title}</h3>
            <p className="panel-work-desc">{work.description}</p>
            <div className="panel-skill-tags">
              {work.tags.map((tag) => (
                <span key={tag} className="panel-tag">
                  {tag}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

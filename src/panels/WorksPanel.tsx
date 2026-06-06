const WORKS = [
  {
    title: "いくつかの3D Web開発案件に参画",
    description:
      "React + Three.js などを利用したいくつかのアプリ開発経験(建築系や3Dアノテーションなど)",
    tags: ["React", "Typescript", "Node.js", "Three.js", "React Three Fiber", "Playwright"],
    url: "https://prtimes.jp/main/html/rd/p/000000095.000031224.html",
  },
  {
    title: "旅日記あぷり",
    description: "Flutterを利用した旅日記アプリの開発 (Android, iOS, Web対応)",
    tags: ["Flutter", "Dart", "Firebase", "GitHub Actions", "Claude Code", "Jules"],
    url: "https://purring-fuchsia-f01.notion.site/17a25270305480c287dac6c3e5bf9ce7?v=17a2527030548063b6a7000cb6418115&pvs=74",
  },
  {
    title: "必要に応じてバックエンドもやります",
    description: "AIを活用したWebアプリのバックエンド開発経験など",
    tags: ["Go", "MySQL", "AWS"],
    url: "https://github.com/NIRANKEN",
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

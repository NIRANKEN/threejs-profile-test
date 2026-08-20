const ACTIVITIES = [
  {
    title: "⛰️ 登山 / 料理報告会(やりたい)",
    description: "GPSログや3Dマップを活用した登山報告雑談や漢の自炊報告雑談をする配信かも",
    tags: ["登山", "アウトドア", "雑談"],
    url: "https://www.youtube.com/@MinegishiToppa",
  },
  {
    title: "💻 みねちゃんのライブコーディング(やりたい)",
    description: "いろいろな技術を試したり、遊んだり、開発作業を進めながら雑談する配信かも",
    tags: ["ライブコーディング", "プログラミング", "雑談"],
    url: "https://www.youtube.com/@MinegishiToppa",
  },
  {
    title: "🎮 ゲーム配信(やりたい)",
    description:
      "雀魂・シミュレーション・オープンワールドの何かなど、いろいろなゲームを気ままに遊ぶ配信かも",
    tags: ["ゲーム", "雑談"],
    url: "https://www.youtube.com/@MinegishiToppa",
  },
];

export default function VtuberActivitiesPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">🎬 Activities & Works</h2>
      <div className="panel-works">
        {ACTIVITIES.map((item) => (
          <a
            key={item.title}
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="panel-work-card"
          >
            <h3 className="panel-work-title">{item.title}</h3>
            <p className="panel-work-desc">{item.description}</p>
            <div className="panel-skill-tags">
              {item.tags.map((tag) => (
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

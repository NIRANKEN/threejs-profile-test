const ACTIVITIES = [
  {
    title: "⛰️ 登山×テクノロジー配信",
    description: "GPSログや3Dマップを活用した登山ルート解説や山小屋からのリアルタイム雑談配信。",
    tags: ["Streaming", "Outdoor", "GPS 3D", "Talk"],
    url: "https://youtube.com",
  },
  {
    title: "💻 みねちゃんのライブコーディング",
    description: "いろいろな技術を試したり、遊んだり、開発作業を進めながら雑談する配信かも",
    tags: ["Live Coding", "プログラミング", "雑談"],
    url: "https://youtube.com",
  },
  {
    title: "⛺ キャンプギア紹介 & もくもく作業枠",
    description: "おすすめアウトドアギアのレビューや、BGMを流しながらの深夜もくもくプログラミング枠。",
    tags: ["Camp Gear", "Focus Work", "Lo-Fi"],
    url: "https://twitch.tv",
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

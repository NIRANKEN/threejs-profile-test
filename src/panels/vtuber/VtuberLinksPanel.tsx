export default function VtuberLinksPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">🔗 Links & Channels</h2>
      <p className="panel-bio">
        配信プラットフォームやSNS、コミュニティの公式リンクです。
      </p>
      <div className="panel-links" style={{ flexDirection: "column", gap: "0.85rem" }}>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="panel-work-card"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.6rem" }}>📺</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>YouTube Channel</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                メイン配信・技術解説・登山Vlogアーカイブ
              </div>
            </div>
          </div>
        </a>

        {/* <a
          href="https://twitch.tv"
          target="_blank"
          rel="noopener noreferrer"
          className="panel-work-card"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.6rem" }}>🟣</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Twitch</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                もくもく深夜作業・ゲーム耐久配信
              </div>
            </div>
          </div>
        </a> */}

        <a
          href="https://misskey.io/@minegishi108"
          target="_blank"
          rel="noopener noreferrer"
          className="panel-work-card"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.6rem" }}>🟢</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>Misskey.io</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                日常のつぶやき・アウトドア写真・進捗報告
              </div>
            </div>
          </div>
        </a>

        {/* <a
          href="https://github.com/NIRANKEN"
          target="_blank"
          rel="noopener noreferrer"
          className="panel-work-card"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <span style={{ fontSize: "1.6rem" }}>🐙</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>GitHub</div>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)" }}>
                オープンソースプロジェクト・Playgroundリポジトリ
              </div>
            </div>
          </div>
        </a> */}
      </div>
    </div>
  );
}

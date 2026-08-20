export default function VtuberProfilePanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">🏔️ Profile</h2>
      <img
        src="/images/minegishi_toppa_portfolio.png"
        alt="嶺岸とっぱ (Minegishi Toppa)"
        className="panel-avatar panel-avatar--character"
      />
      <p className="panel-name">嶺岸とっぱ (Minegishi Toppa)</p>
      <p className="panel-role">登山・アウトドア系おしごとエンジニアの漢</p>
      <p className="panel-bio">
        山から技術とアウトドアの魅力を発信するバーチャルエンジニア。
        <br />
        登山やキャンプをしたり、ゲームしたりプログラム書いたりしています！
      </p>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">👋 挨拶</h3>
        <p className="panel-bio" style={{ marginBottom: "0.5rem" }}>
          はじまり：「やっほー！」(やまびこ返事してね)
          <br />
          おわり：「下山完了！」
        </p>
      </div>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">🍲 好物</h3>
        <p className="panel-bio" style={{ marginBottom: "0.5rem" }}>
          出汁の効いてる味噌汁とあったかいご飯
        </p>
      </div>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">🎨 パーソナルカラー</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span
            style={{
              display: "inline-block",
              width: "1.25rem",
              height: "1.25rem",
              borderRadius: "9999px",
              backgroundColor: "#2A5A35",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          />
          <span className="panel-bio" style={{ marginBottom: 0 }}>
            深緑 #2A5A35
          </span>
          <span
            style={{
              display: "inline-block",
              width: "1.25rem",
              height: "1.25rem",
              borderRadius: "9999px",
              backgroundColor: "#6F2DA8",
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          />
          <span className="panel-bio" style={{ marginBottom: 0 }}>
            紫 #6F2DA8
          </span>
        </div>
      </div>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">🌟 夢・目標</h3>
        <p className="panel-bio" style={{ marginBottom: "0.5rem" }}>
          やりたいことを気ままに活動していくよ。
          <br />
          83億人のうちの誰か1人にでも何かしらお役に立てたら嬉しいです！
        </p>
      </div>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">🏷️ Favorite & Tags</h3>
        <div className="panel-skill-tags">
          <span className="panel-tag">#登山</span>
          <span className="panel-tag">#キャンプ</span>
          <span className="panel-tag">#Gemini製</span>
          <span className="panel-tag">#Vtuber?</span>
          <span className="panel-tag">#ライブコーディング</span>
          <span className="panel-tag">#プログラミング</span>
          <span className="panel-tag">#今日の味噌汁</span>
        </div>
      </div>
    </div>
  );
}

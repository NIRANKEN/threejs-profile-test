export default function VtuberProfilePanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">🏔️ Profile & Lore</h2>
      <img
        src="/images/minegishi_toppa_portfolio.png"
        alt="嶺岸とっぱ (Minegishi Toppa)"
        className="panel-avatar panel-avatar--character"
      />
      <p className="panel-name">嶺岸とっぱ (Minegishi Toppa)</p>
      <p className="panel-role">登山・アウトドア系おしごとエンジニアVtuber</p>
      <p className="panel-bio">
        山小屋ロッジから技術とアウトドアの魅力を発信するバーチャルエンジニア。
        <br />
        休日は百名山ハイクやキャンプを楽しみつつ、平日はWeb・3D・モバイルアプリ開発の技術検証やライブコーディングを行っています。
        <br />
        自然の静寂とデジタルの楽しさが共存する空間へようこそ！
      </p>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">Favorite & Tags</h3>
        <div className="panel-skill-tags">
          <span className="panel-tag">#登山</span>
          <span className="panel-tag">#キャンプ</span>
          <span className="panel-tag">#ライブコーディング</span>
          <span className="panel-tag">#WebGPU</span>
          <span className="panel-tag">#Three.js</span>
          <span className="panel-tag">#山小屋ラウンジ</span>
        </div>
      </div>
    </div>
  );
}

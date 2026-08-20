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
      <p className="panel-role">登山・アウトドア系おしごとエンジニアVtuber</p>
      <p className="panel-bio">
        自然多いところから技術とアウトドアの魅力を発信するバーチャルエンジニア。
        <br />
        登山やキャンプをしたり、ゲームしたりプログラム書いたりしています。
        <br />
        好きなご飯は出汁の効いた味噌汁です！
      </p>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">Favorite & Tags</h3>
        <div className="panel-skill-tags">
          <span className="panel-tag">#登山</span>
          <span className="panel-tag">#キャンプ</span>
          <span className="panel-tag">#Vtuber</span>
          <span className="panel-tag">#ライブコーディング</span>
          <span className="panel-tag">#プログラミング</span>
          <span className="panel-tag">#今日の味噌汁</span>
        </div>
      </div>
    </div>
  );
}

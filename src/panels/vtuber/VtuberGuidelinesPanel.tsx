export default function VtuberGuidelinesPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">📜 Guidelines</h2>
      <p className="panel-bio">
        嶺岸とっぱ(Minegishi Toppa)の二次創作および配信利用に関するガイドラインです。
      </p>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">二次創作・ファンアート</h3>
        <p className="panel-bio" style={{ marginBottom: "0.5rem" }}>
          イラスト、切り抜き動画、立体物制作、ファンメイドWebサイト、コーディングなどのファン活動は大歓迎です！
          <br />
          ハッシュタグ <code>#とっぱあーと</code>
          を付けてご投稿いただけると巡回して拝見します。
        </p>
      </div>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">切り抜き動画の作成・投稿</h3>
        <p className="panel-bio" style={{ marginBottom: "0.5rem" }}>
          YouTube / Misskey などへの切り抜き動画の投稿は自由に行っていただけます。
          元配信のURLを動画概要欄または投稿文に明記してください。
        </p>
      </div>

      <div className="panel-skill-group" style={{ marginTop: "1rem" }}>
        <h3 className="panel-skill-category">禁止事項</h3>
        <p className="panel-bio">
          公序良俗に反する利用、他者を誹謗中傷する目的での利用、公式と誤認させる詐称行為は固く禁止いたします。
        </p>
      </div>
    </div>
  );
}

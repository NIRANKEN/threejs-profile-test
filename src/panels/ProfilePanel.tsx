export default function ProfilePanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Profile</h2>
      <img
        src="/images/niranken_prof.jpg"
        alt="NIRANKEN"
        className="panel-avatar"
      />
      <p className="panel-name">NIRANKEN</p>
      <p className="panel-role">Frontend / Backend / 3D Developer</p>
      <p className="panel-bio">
        React, Three.js, Flutter, NodeJS, Go
        を中心としたアプリ開発をよくしています。
        <br />
        興味のあることは隙間時間で習得を試みてます！
        <br />
        (Flutterアプリのリリース / スクラムマスター資格取得 / ... )
        <br />
        最近はClaude
        CodeやAntigravityなどのAIツールを活用して開発を進めています。
      </p>
      <div className="panel-links">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="panel-link-icon"
          aria-label="GitHub"
          title="GitHub"
        >
          <img src="/images/github.png" alt="" />
        </a>
        <a
          href="https://misskey.io/@niranken"
          target="_blank"
          rel="noreferrer"
          className="panel-link-icon"
          aria-label="Misskey"
          title="Misskey"
        >
          <img src="/images/misskey.png" alt="" />
        </a>
      </div>
    </div>
  );
}

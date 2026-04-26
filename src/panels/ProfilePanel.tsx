export default function ProfilePanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Profile</h2>
      <div className="panel-avatar" aria-hidden="true">
        👤
      </div>
      <p className="panel-name">NIRANKEN</p>
      <p className="panel-role">Frontend / Backend / 3D Developer</p>
      <p className="panel-bio">
        React, Three.js, Flutter を中心としたアプリ開発をよくしています。
        <br />
        最近はClaude CodeやGeminiの有効な活用方法を模索しています。
      </p>
      <div className="panel-links">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="panel-link">
          GitHub
        </a>
        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="panel-link">
          Twitter / X
        </a>
      </div>
    </div>
  );
}

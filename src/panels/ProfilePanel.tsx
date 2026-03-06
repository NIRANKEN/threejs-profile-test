export default function ProfilePanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Profile</h2>
      <div className="panel-avatar" aria-hidden="true">👤</div>
      <p className="panel-name">Your Name</p>
      <p className="panel-role">Frontend / 3D Developer</p>
      <p className="panel-bio">
        Web と 3D に興味を持つエンジニアです。<br />
        React・Three.js を使ったインタラクティブな体験の構築が得意です。
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
  )
}

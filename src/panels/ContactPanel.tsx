export default function ContactPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Contact</h2>
      <p className="panel-bio">お仕事のご依頼・ご相談はお気軽にどうぞ。</p>
      <div className="panel-contact-list">
        <a href="mailto:your@email.com" className="panel-contact-item">
          <span className="panel-contact-icon">✉️</span>
          <span>your@email.com</span>
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="panel-contact-item"
        >
          <span className="panel-contact-icon">🐙</span>
          <span>GitHub</span>
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer"
          className="panel-contact-item"
        >
          <span className="panel-contact-icon">🐦</span>
          <span>Twitter / X</span>
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noreferrer"
          className="panel-contact-item"
        >
          <span className="panel-contact-icon">💼</span>
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}

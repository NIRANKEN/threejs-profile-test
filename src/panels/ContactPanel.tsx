export default function ContactPanel() {
  return (
    <div className="panel-content">
      <h2 className="panel-title">Contact</h2>
      <p className="panel-bio">お仕事のご依頼・ご相談はお気軽にどうぞ。</p>
      <div className="panel-contact-list">
        <a
          href="https://github.com/NIRANKEN"
          target="_blank"
          rel="noreferrer"
          className="panel-contact-item"
        >
          <img src="/images/github.png" alt="GitHub" className="panel-contact-icon-img" />
          <span>GitHub</span>
        </a>
        <a
          href="https://misskey.io/@niranken"
          target="_blank"
          rel="noreferrer"
          className="panel-contact-item"
        >
          <img src="/images/misskey.png" alt="Misskey" className="panel-contact-icon-img" />
          <span>Misskey</span>
        </a>
      </div>
    </div>
  );
}

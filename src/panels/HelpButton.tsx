import { useState, useEffect } from "react";

const SECTIONS = [
  { icon: "🛏️", label: "ベッド", section: "Profile" },
  { icon: "🖥️", label: "PCケース", section: "Skills" },
  { icon: "🖵", label: "モニター", section: "Works" },
  { icon: "📖", label: "本", section: "Contact" },
] as const;

export default function HelpButton() {
  const [open, setOpen] = useState(false);

  // ESC で閉じる
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* ヘルプアイコンボタン */}
      <button
        className="help-btn"
        onClick={() => setOpen(true)}
        aria-label="操作ヘルプを開く"
        title="操作ヘルプ"
      >
        ?
      </button>

      {/* バックドロップ */}
      {open && <div className="help-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* ダイアログ */}
      <div
        className={`help-dialog${open ? " help-dialog--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="操作ヘルプ"
      >
        {/* ヘッダー */}
        <div className="help-dialog__header">
          <h2 className="help-dialog__title">操作ガイド</h2>
          <button className="help-dialog__close" onClick={() => setOpen(false)} aria-label="閉じる">
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="help-dialog__body">
          {/* 基本操作 */}
          <section className="help-section">
            <h3 className="help-section__title">基本操作</h3>
            <ul className="help-list">
              <li className="help-list__item">
                <span className="help-list__icon">🎮</span>
                <span>
                  <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> キーで
                  <strong>部屋の中を移動</strong>できます
                </span>
              </li>
              <li className="help-list__item">
                <span className="help-list__icon">🖱️</span>
                <span>
                  <strong>左ドラッグ</strong>で視点（カメラの向き）を操作できます
                </span>
              </li>
              <li className="help-list__item">
                <span className="help-list__icon">🖱️</span>
                <span>
                  部屋の中のオブジェクトを<strong>クリック</strong>
                  するとその項目の詳細が表示されます
                </span>
              </li>
              <li className="help-list__item">
                <span className="help-list__icon">🔄</span>
                <span>
                  同じオブジェクトをもう一度クリック、または <kbd>✕</kbd> ボタンで
                  <strong>一覧ビュー</strong>に戻ります
                </span>
              </li>
              <li className="help-list__item">
                <span className="help-list__icon">⌨️</span>
                <span>
                  <kbd>Esc</kbd> キーでもパネルを閉じられます
                </span>
              </li>
            </ul>
          </section>

          {/* セクション一覧 */}
          <section className="help-section">
            <h3 className="help-section__title">クリックできるオブジェクト</h3>
            <div className="help-objects">
              {SECTIONS.map(({ icon, label, section }) => (
                <div key={section} className="help-object">
                  <span className="help-object__icon">{icon}</span>
                  <div className="help-object__info">
                    <span className="help-object__name">{label}</span>
                    <span className="help-object__section">{section}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect } from "react";

export default function CreditButton() {
  const [open, setOpen] = useState(false);

  // ESCキーで閉じる
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
      {/* クレジットアイコンボタン (画面右下に配置) */}
      <button
        className="credit-btn"
        onClick={() => setOpen(true)}
        aria-label="3Dモデルのクレジット情報を表示"
        title="3Dモデルのクレジット"
      >
        <span className="credit-btn__icon">©</span>
      </button>

      {/* バックドロップ */}
      {open && (
        <div
          className="credit-backdrop"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ダイアログ */}
      <div
        className={`credit-dialog${open ? " credit-dialog--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="3Dモデル クレジット情報"
      >
        {/* ヘッダー */}
        <div className="credit-dialog__header">
          <h2 className="credit-dialog__title">素材クレジット</h2>
          <button
            className="credit-dialog__close"
            onClick={() => setOpen(false)}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="credit-dialog__body">
          <div className="credit-card">
            <div className="credit-card__badge">3D Model</div>
            <h3 className="credit-card__model-title">
              <a
                href="https://sketchfab.com/3d-models/low-poly-gaming-bedroom-3799700f186a4104ae570ea0c92a82fd"
                target="_blank"
                rel="noopener noreferrer"
              >
                Low Poly Gaming Bedroom
              </a>
            </h3>
            <p className="credit-card__author">
              Author:{" "}
              <a
                href="https://sketchfab.com/wavenquack24"
                target="_blank"
                rel="noopener noreferrer"
              >
                Waven
              </a>
            </p>
            <p className="credit-card__license">
              License:{" "}
              <a
                href="http://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC BY 4.0 (Attribution 4.0 International)
              </a>
            </p>
            <p className="credit-card__source">
              Source:{" "}
              <a
                href="https://sketchfab.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sketchfab
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

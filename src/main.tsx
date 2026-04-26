import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Dev モード限定: Playwright E2E テストからストアを操作できるようにウィンドウに公開
if (import.meta.env.DEV) {
  import("./store/usePortfolioStore").then(({ usePortfolioStore }) => {
    (window as unknown as { __portfolioStore: typeof usePortfolioStore }).__portfolioStore =
      usePortfolioStore;
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

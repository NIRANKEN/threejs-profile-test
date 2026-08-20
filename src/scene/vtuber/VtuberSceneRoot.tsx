import { Suspense, Component } from "react";
import type { ReactNode } from "react";
import { Environment, BakeShadows } from "@react-three/drei";
import FirstPersonController from "../FirstPersonController";
import VtuberLights from "./VtuberLights";
import { VtuberRoomModel } from "./VtuberRoomModel";
import { SceneDevTools } from "../DevTools";

/**
 * Canvas内用の軽量エラーバウンダリ
 * Environment の CDN フェッチが失敗してもシーン全体を壊さない
 */
class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(e: unknown) {
    console.warn("[VtuberSceneErrorBoundary] caught:", e);
  }
  render() {
    return this.state.hasError ? (this.props.fallback ?? null) : this.props.children;
  }
}

export default function VtuberSceneRoot() {
  return (
    <>
      <FirstPersonController />
      <VtuberLights />
      <Suspense fallback={null}>
        <SceneErrorBoundary>
          <Environment preset="sunset" />
        </SceneErrorBoundary>
        <VtuberRoomModel />
        <BakeShadows />
      </Suspense>
      {/* 開発環境のみ: XYZ軸 + カメラ座標ログ */}
      <SceneDevTools />
    </>
  );
}

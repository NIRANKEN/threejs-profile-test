# **React Three Fiber及びThree.jsを用いた次世代空間UI/UXデザインと「Palette」エージェントの再定義：2025-2026年における標準化レポート**

2026年現在、ウェブベースの3Dグラフィックスは、単なる視覚的装飾の域を超え、空間コンピューティングや没入型ユーザーインターフェースの中核を担う存在へと進化を遂げた。この進化の背景には、React 19の安定稼働、Viteによる高速な開発サイクルの確立、そしてWebGPUの本格的な普及がある 1。特にReact Three Fiber（以下、R3F）は、宣言的なコンポーネント指向設計とThree.jsの強力な命令型グラフィックスAPIを橋渡しする役割を果たし、開発効率と実行パフォーマンスを劇的に向上させている 3。本レポートでは、最新のライブラリ環境における推奨コーディング手法、アクセシビリティ（a11y）の統合、そして小規模なUX改善を専門とするエージェント「Palette」のための最適化されたプロンプト設計について、詳細かつ包括的な分析を行う。

## **技術的基盤：React 19、Vite、およびWebGPUの統合**

現代の3Dウェブ開発において、基盤となる技術スタックの選択はパフォーマンスとメンテナンス性に直結する。2025年後半から2026年にかけての標準は、Viteをビルドツールとして採用し、React 19のランタイム上でR3Fを稼働させる構成である 1。

### **React 19とReact Compilerによるレンダリング最適化**

React 19の導入、特に「React Compiler」による自動メモ化機能は、R3Fアプリケーションの設計思想を根本から変えた。これまでのバージョンでは、3Dシーン内の頻繁な更新による不要な再レンダリングを防ぐために、開発者はuseMemoやuseCallbackを明示的に多用する必要があった 1。しかし、React Compilerはコンポーネントの依存関係を自動的に解析し、プロパティが変更されていない場合の計算をスキップする。これにより、メインスレッドの負荷が軽減され、GPUリソースをより複雑なシェーダー計算や物理シミュレーションに割り当てることが可能となった 1。

| 最適化項目 | React 18（手動） | React 19（自動/Compiler） | パフォーマンスへの影響（2026年平均） |
| :---- | :---- | :---- | :---- |
| プロップスのメモ化 | React.memoが必要 | 自動処理 | プロップス変更起因の不要な計算を15-30%削減 1 |
| コールバックの安定化 | useCallbackが必要 | Compilerによる95%以上のカバー | リストレンダリング時間が40-70%高速化 1 |
| コンテキストの最適化 | 依存分離が必要 | 内部的な更新効率の向上 | コンテキスト更新時のオーバーヘッドが10-20%改善 1 |
| 非同期アセット管理 | Suspenseの限定的利用 | 統合されたSuspense体験 | アセットのハイドレーションがよりスムーズに 3 |

### **WebGPUとThree Shading Language (TSL) の台頭**

Three.js r171以降、WebGPUレンダラーがプロダクション環境での使用に耐えうる状態となった。これはWebGL 2に対する世代交代を意味し、特に描画コール（Draw Calls）が多いシーンや、複雑なコンピュートシェーダーを必要とするエフェクトにおいて2倍から10倍のパフォーマンス向上を実現する 2。この移行において中心的な役割を果たすのが、Three Shading Language (TSL) である。TSLはノードベースのシェーディング言語であり、一度記述すればWGSL（WebGPU用）とGLSL（WebGL 2用）の両方にコンパイル可能であるため、ブラウザのサポート状況に応じたフォールバックを容易にする 2。

## **高効率な3Dアーキテクチャ設計とパフォーマンス・ベストプラクティス**

R3Fにおけるパフォーマンス最適化の要諦は、Reactの宣言的なサイクルとThree.jsの命令的なフレームループの境界を正しく管理することにある。

### **フレームループ内での直接変更（Mutation）の原則**

R3Fにおける最も重要なルールは、「アニメーション目的でsetStateを使用しない」ことである。毎秒60回以上実行されるuseFrameフック内でReactの状態を更新すると、そのたびにReactの再構築（Reconciliation）が発生し、致命的なパフォーマンス低下を招く 2。

![][image1]  
上記のような物理計算は、フックから提供されるdelta値（前フレームからの経過時間）を用い、参照（refs）を介してオブジェクトを直接変更することで、リフレッシュレートに依存しない滑らかな動きを実現する 3。また、THREE.Vector3などのオブジェクトをuseFrame内で毎回新規生成することも避けるべきである。これはガベージコレクションの頻発を引き起こし、画面の「カクつき（Jank）」の原因となる 2。

### **描画コールの最小化とアセットの最適化**

3Dシーンの描画負荷は、ポリゴン数よりも描画コールの数に大きく左右される。特に多数の類似オブジェクトを表示する場合、インスタンス化（Instancing）やバッチ処理（Batching）は不可欠な技術である 2。

| 最適化手法 | メカニズム | 適用例 | 期待される効果 |
| :---- | :---- | :---- | :---- |
| InstancedMesh | 単一の描画コールで同一形状を多数描画 | 植物、群衆、パーティクル | 描画コールを90%以上削減 2 |
| BatchedMesh | 異なる形状を一つの描画コールに統合 | 建物、都市のオブジェクト | 異種混合シーンでの大幅な効率化 2 |
| BufferGeometryUtils | 静的なジオメトリをロード時に結合 | 背景、地形 | 静的な構造物の描画負荷を最小化 2 |
| KTX2 テクスチャ | GPU圧縮テクスチャ形式の採用 | 全てのアセット | VRAM使用量の削減とロードの高速化 2 |

アセット最適化においては、Draco圧縮を用いたGLTFモデルの使用が推奨される。Dracoはジオメトリデータを大幅に縮小し、ネットワーク帯域の節約に寄与するが、解凍にはCPUリソースを必要とするため、Meshoptなどの代替案との適切な選択が必要である 2。

## **3D空間におけるアクセシビリティ（a11y）の統合**

2026年におけるUX設計において、アクセシビリティは「追加機能」ではなく「必須要件」である 8。R3Fアプリケーションでは、@react-three/a11yを利用することで、キャンバス内の3DオブジェクトをDOM構造と同期させ、スクリーンリーダーやキーボード操作を可能にする 10。

### **ARIAロールとフォーカス管理**

3Dオブジェクトを支援技術に認識させるためには、適切な役割（Roles）の割り当てが必要である。

* **Content（コンテンツ）:** 情報を提供するがインタラクティブではない要素に適用する。これはHTMLの\<img\>タグにおけるalt属性に相当する 10。  
* **Button / Link（ボタン/リンク）:** クリックやナビゲーションを発生させる要素に適用する。これにより、キーボードのTabキーでオブジェクトを選択可能になり、aria-labelによる説明の読み上げが行われる 10。

フォーカスが当たった際の視覚的なフィードバックも重要である。useA11yフックを使用することで、フォーカス状態に応じてオブジェクトのスケールを変更したり、アウトラインを表示したりすることで、マウスを使わないユーザーに対しても現在の操作対象を明確に示すことができる 11。

## **「Palette」エージェント：小規模UX改善の設計哲学**

エージェント「Palette」のミッションは、インターフェースに「喜び」と「使いやすさ」を加える最小単位の改善（Micro-UX Improvement）を見つけ出し、実装することである 8。3D空間におけるUX改善は、物理法則に即した自然なフィードバックと、ユーザーの認知的負荷を軽減する補助的情報の提供に集約される。

### **インタラクションの磨き上げと「Liquid Glass」デザイン**

2026年のUIトレンドとして注目される「Liquid Glass」は、半透明の素材感と奥行きのある階層構造を特徴とする 8。これをR3Fで実装する場合、MeshPhysicalMaterialやTransmissionMaterialを活用し、光の屈折や反射を再現することで、操作対象に対する質感を高める。

マイクロインタラクションの実装においては、以下の原則が推奨される：

* **即時フィードバック:** 全てのクリックやホバーに対し、200-500msの短時間で反応を返す 13。  
* **物理的な挙動:** react-springやframer-motion-3dを用いたスプリング物理により、線形ではない「生きている」ようなアニメーションを実現する 3。  
* **情報の階層化:** 重要な情報は手前に、補助的な情報は奥行きを持たせて配置することで、視覚的な混乱を防ぐ 14。

### **3Dツールチップとコンテキスト情報の提供**

アイコンだけのボタンや複雑な3Dモデルに対しては、ツールチップによる説明が効果的である。R3Fでは、@react-three/dreiのHtmlコンポーネントを使用し、特定の3D座標にHTML要素を追従させることができる。この際、occludeプロパティを有効にすることで、オブジェクトの背後に隠れたツールチップを正しく非表示にするなど、空間的な一貫性を保つことが重要である 16。

## **適応型レンダリングとリソース管理**

多様なデバイスで3D体験を保証するためには、ハードウェアの性能に応じた動的な品質調整が求められる。

### **オンデマンド・レンダリングの採用**

静的なシーンにおいて毎秒60フレームを描画し続けることは、デバイスのバッテリーを浪費し、発熱の原因となる。R3Fのframeloop="demand"設定を導入することで、状態の変更やユーザーの入力があった時のみ再描画を行うようにし、エネルギー効率の高い「サステナブルなUX」を実現する 7。

### **PerformanceMonitorによる動的スケール**

DreiのPerformanceMonitorを活用し、平均FPSが低下した場合に解像度（DPR）を下げる、アンチエイリアスを無効化する、あるいは遠くのオブジェクトを非表示にするといった処理を自動化する 7。

| 指標 | 閾値 | アクション |
| :---- | :---- | :---- |
| FPS (低) | \< 40 | setDpr(1)、影の無効化、LODの低減 7 |
| FPS (高) | \> 55 | setDpr(window.devicePixelRatio)、高品質シェーダーの有効化 7 |
| ロード時間 | \> 3s | 進行状況バーの表示、低解像度テクスチャの先行表示 7 |

## ---

**改善された「Palette」エージェント用プロンプト**

以下に、上記の研究内容を反映し、最新のReact Three Fiber、Three.js、Vite、およびpnpm環境に特化した「Palette」エージェントの書き換え済みプロンプトを提示する。

# ---

**🎨 Palette: 空間UI/UX改善エージェント（R3F/Three.js版）**

あなたは「Palette」です。R3F、Three.js、React、Viteを用いたプロジェクトにおいて、ユーザーインターフェースに洗練された喜びと高いアクセシビリティ、そして空間的な一貫性をもたらす「最小単位の改善（Micro-UX）」を担当するエキスパートです。あなたの変更は常に、ユーザーにとって「自然で、気づかないほどスムーズに動作する」ものであるべきです。

## **🛠️ プロジェクト固有のコマンド**

このリポジトリの構成を確認した上で、以下のコマンドを適切に使用してください。

* **依存関係のインストール:** pnpm install (npm/yarnは使用厳禁)  
* **テストの実行:** pnpm test または pnpm vitest  
* **リントと修正:** pnpm lint または pnpm lint:fix  
* **コードフォーマット:** pnpm format  
* **ビルド検証:** pnpm build

## **📐 空間UXコーディング・スタンダード**

### **✅ 推奨されるパターン（Good UX）**

TypeScript

// 1\. アクセシブルな3Dボタン：@react-three/a11yを使用  
\<A11y  
  role="button"  
  description="プロジェクトを削除"  
  actionCall={handleDelete}  
  focusCall={() \=\> setFocus(true)}  
\>  
  \<mesh ref={meshRef} onPointerOver={() \=\> setHover(true)}\>  
    \<boxGeometry args={\[1, 1, 0.2\]} /\>  
    \<meshStandardMaterial color={hovered? "red" : "gray"} /\>  
  \</mesh\>  
\</A11y\>

// 2\. パフォーマンスに配慮したアニメーション：useFrameとMutation  
useFrame((state, delta) \=\> {  
  // setStateではなく、Refを介して直接変更  
  if (meshRef.current) {  
    meshRef.current.rotation.y \+= delta \* 0.5;  
  }  
});

### **❌ 避けるべきパターン（Bad UX）**

TypeScript

// ❌ ARIA情報がなく、キーボードで操作できない3Dメッシュ  
\<mesh onClick={handleDelete} /\>

// ❌ フレームループ内でのsetState（パフォーマンスのボトルネック）  
useFrame(() \=\> {  
  setRotation(prev \=\> prev \+ 0.01);  
});

## **🚩 行動指針と境界線**

### **✅ 常に実行すること:**

* PR作成前にpnpm lint、pnpm test、pnpm buildを必ず通すこと。  
* 3Dオブジェクトには@react-three/a11yを用いて適切なロールと説明を追加すること。  
* アニメーションはリフレッシュレートに依存しないよう、delta値を使用すること。  
* 既存のコンポーネントやデザインシステム（Dreiのヘルパー等）を最大限活用すること。  
* 1回のPRは50行以内の変更に抑えること。

### **⚠️ 相談が必要なこと:**

* ページ全体のレイアウトやカメラワークの抜本的な変更。  
* 新しい物理エンジン（Rapier等）やポストプロセッシングの追加。  
* 既存のアセット（モデル、テクスチャ）の差し替え。

### **🚫 決して行わないこと:**

* pnpm以外のパッケージマネージャーの使用。  
* 3Dシーンの完全な再設計。  
* フレームループ内でのガベージコレクションを引き起こす新規オブジェクト生成（new THREE.Vector3()等）。  
* バックエンドのロジック変更。

## **📓 Paletteのジャーナル（重要な学びのみ）**

.Jules/palette.mdを確認し、以下の「クリティカルな発見」があった場合のみ追記してください：

* 特定のデバイス（モバイル等）で発生した特有のアクセシビリティ問題。  
* 実装後にパフォーマンス劣化が判明した特定のR3Fパターン。  
* ユーザーテストやフィードバックで得られた、意外な3D空間内の操作ミス。  
* このデザインシステム特有の、再利用可能な空間UIパターン。

## **🔄 毎日のプロセス**

1. **🔍 観察（Observe）:** 以下の観点で改善点を探す。  
   * **空間アクセシビリティ:** A11yタグの欠如、キーボードフォーカスの不在、コントラスト不足。  
   * **空間インタラクション:** クリック/ホバーへの反応の遅れ、非論理的なカメラ挙動、フィードバックの欠如。  
   * **パフォーマンス:** 不要なレンダリング、重いジオメトリ、不適切なフレームループ処理。  
   * **視覚的研磨:** 3Dツールチップの不在、不自然なマテリアル設定、ロード中のブランク（Suspenseの不在）。  
2. **🎯 選択（Select）:**  
   * ユーザーが「あ、これ便利だ」と感じる、即座に効果が出る1つの改善点を選ぶ。  
3. **🖌️ 実装（Paint）:**  
   * セマンティックでアクセシブルなR3Fコンポーネントを記述する。  
   * 既存のスタイル（Tailwind CSS等）やマテリアル設定を尊重する。  
4. **✅ 検証（Verify）:**  
   * キーボードナビゲーション、スクリーンリーダー、レスポンシブ挙動をチェックする。  
5. **🎁 提出（Present）:**  
   * タイトル: "🎨 Palette: \[空間UXの改善内容\]"  
   * 内容: 💡改善点、🎯解決する課題、♿アクセシビリティ向上点、📸必要に応じて比較。

## ---

**空間コンピューティング時代におけるMicro-UXの深化**

2026年のウェブデザインにおいて、画面はもはや平面的な情報の表示場所ではなく、奥行きと質感を持った「空間」である 15。Paletteエージェントはこの新しいパラダイムにおいて、ユーザーが迷うことなく、かつ心地よく空間を回遊できるよう、細部を調整する役割を担う。

### **結論と将来の展望**

本レポートで詳述したReact Three FiberおよびThree.jsの最新プラクティスは、単なる技術的なガイドラインに留まらず、次世代のユーザー体験を構築するための哲学的基盤でもある 8。React 19とWebGPUの統合によって、以前は困難であった高度な視覚表現とアクセシビリティの両立が可能となった 1。開発者は、パフォーマンスの最適化を「前提条件」としつつ、その上でいかにしてユーザーの感情に訴えかける「喜び」を設計できるかが問われている。Paletteエージェントの活動は、その膨大な数の「小さな改善」を通じて、ウェブをより豊かでインクルーシブな場所へと変容させていくプロセスそのものであると言える。

空間UIの進化は止まることなく、今後さらに音声インターフェース（VUI）やジェスチャー操作との融合が進むことが予想される 20。Paletteに課せられた使命は、常に最新の技術を反映しながらも、変わることのない「人間の使いやすさ」への配慮を、1ピクセル、1フレーム、1オブジェクトずつ、丁寧に実装し続けることにある。

#### **引用文献**

1. React Performance Optimization: 15 Best Practices for 2025 \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/alex\_bobes/react-performance-optimization-15-best-practices-for-2025-17l9](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)  
2. 100 Three.js Tips That Actually Improve Performance (2026) \- Utsubo, 3月 10, 2026にアクセス、 [https://www.utsubo.com/blog/threejs-best-practices-100-tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)  
3. Introduction \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/getting-started/introduction](https://r3f.docs.pmnd.rs/getting-started/introduction)  
4. Installation \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/getting-started/installation](https://r3f.docs.pmnd.rs/getting-started/installation)  
5. React Design Patterns and Best Practices for 2025 \- Telerik.com, 3月 10, 2026にアクセス、 [https://www.telerik.com/blogs/react-design-patterns-best-practices](https://www.telerik.com/blogs/react-design-patterns-best-practices)  
6. Performance pitfalls \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/advanced/pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)  
7. Scaling performance \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/advanced/scaling-performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)  
8. User experience essentials for 2026 \- WeAreBrain, 3月 10, 2026にアクセス、 [https://wearebrain.com/blog/ux-trends-for-2026/](https://wearebrain.com/blog/ux-trends-for-2026/)  
9. 10 UX/UI Trends That Will Completely Redefine Design in 2026 (Most Designers Aren't Ready) | by Raman Saini | Medium, 3月 10, 2026にアクセス、 [https://medium.com/@sainisinghramandeep/10-ux-ui-trends-that-will-completely-redefine-design-in-2026-most-designers-arent-ready-b26d4bb5de86](https://medium.com/@sainisinghramandeep/10-ux-ui-trends-that-will-completely-redefine-design-in-2026-most-designers-arent-ready-b26d4bb5de86)  
10. Content \- A11y, 3月 10, 2026にアクセス、 [https://a11y.docs.pmnd.rs/roles/content](https://a11y.docs.pmnd.rs/roles/content)  
11. Link \- A11y, 3月 10, 2026にアクセス、 [https://a11y.docs.pmnd.rs/roles/link](https://a11y.docs.pmnd.rs/roles/link)  
12. Home · pmndrs/react-three-a11y Wiki \- GitHub, 3月 10, 2026にアクセス、 [https://github.com/pmndrs/react-three-a11y/wiki/Home/c1d18dd818481f7f38f9a07ee7eb047769e4c414](https://github.com/pmndrs/react-three-a11y/wiki/Home/c1d18dd818481f7f38f9a07ee7eb047769e4c414)  
13. UI/UX Evolution 2026: Micro-Interactions & Motion \- Primotech, 3月 10, 2026にアクセス、 [https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/)  
14. 8 UI design trends we're seeing in 2025 \- Pixelmatters, 3月 10, 2026にアクセス、 [https://www.pixelmatters.com/insights/8-ui-design-trends-2025](https://www.pixelmatters.com/insights/8-ui-design-trends-2025)  
15. Top UI/UX Design Trends for 2026: AI-First, Context-Aware Interfaces & Spatial Experiences, 3月 10, 2026にアクセス、 [https://dev.to/pixel\_mosaic/top-uiux-design-trends-for-2026-ai-first-context-aware-interfaces-spatial-experiences-166j](https://dev.to/pixel_mosaic/top-uiux-design-trends-for-2026-ai-first-context-aware-interfaces-spatial-experiences-166j)  
16. How to create an accessible tooltip using React \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/micaavigliano/how-to-create-an-accessible-tooltip-using-react-2cck](https://dev.to/micaavigliano/how-to-create-an-accessible-tooltip-using-react-2cck)  
17. Tooltip Components Should Not Exist \- TkDodo's blog, 3月 10, 2026にアクセス、 [https://tkdodo.eu/blog/tooltip-components-should-not-exist](https://tkdodo.eu/blog/tooltip-components-should-not-exist)  
18. React Three Fiber Best Practices \- Claude Code Skill \- MCP Market, 3月 10, 2026にアクセス、 [https://mcpmarket.com/tools/skills/react-three-fiber-best-practices](https://mcpmarket.com/tools/skills/react-three-fiber-best-practices)  
19. How UI/UX Development Trends Are Bringing 3D and Spatial Design to Everyday Products in 2026? \- SynapseIndia, 3月 10, 2026にアクセス、 [https://www.synapseindia.com/article/how-ux-ui-development-trends-are-bringing-3d-and-spatial-design-to-everyday-products](https://www.synapseindia.com/article/how-ux-ui-development-trends-are-bringing-3d-and-spatial-design-to-everyday-products)  
20. UX/UI Design Trends for 2026 — From AI to XR to Vibe Creation | by Punit Chawla | Medium, 3月 10, 2026にアクセス、 [https://blog.prototypr.io/ux-ui-design-trends-for-2026-from-ai-to-xr-to-vibe-creation-7c5f8e35dc1d](https://blog.prototypr.io/ux-ui-design-trends-for-2026-from-ai-to-xr-to-vibe-creation-7c5f8e35dc1d)  
21. 10 UX design shifts you can't ignore in 2026 | by Arin Bhowmick \- UX Collective, 3月 10, 2026にアクセス、 [https://uxdesign.cc/10-ux-design-shifts-you-cant-ignore-in-2026-8f0da1c6741d](https://uxdesign.cc/10-ux-design-shifts-you-cant-ignore-in-2026-8f0da1c6741d)

[image1]: <data:image/png;base64,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>
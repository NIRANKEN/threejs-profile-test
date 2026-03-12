# **React Three Fiber、Three.js、およびVite環境における次世代パフォーマンス最適化：自律型改善エージェント「Bolt」の再定義と実装戦略**

21世紀の第3四半期に差し掛かる現在、ウェブブラウザ上での3Dレンダリングは、単なる視覚的な装飾から、インタラクティブなユーザー体験の核心へと進化を遂げた。この進化を支える技術的支柱が、命令的なWebGLの操作を宣言的なコンポーネントモデルへと昇華させたReact Three Fiber（以下R3F）であり、その背後にあるThree.jsの強力なレンダリングエンジンである。しかし、宣言的UIフレームワークと毎秒60フレーム以上の更新を要求するグラフィックスエンジンの融合は、本質的にパフォーマンス上の摩擦を生み出す運命にある。本報告書では、React、Three.js、およびViteを基盤とした現代的なプロジェクトにおいて、最高効率のパフォーマンスを追求するための技術的パラダイムを分析し、それに基づいた自律型改善エージェント「Bolt」のプロンプトを再定義する。

## **現代的な3Dウェブアプリケーションにおけるアーキテクチャの変遷**

ウェブグラフィックスの歴史において、初期のWebGLは開発者に直接的なGPU操作を強いるものであり、その複雑性はスケーラブルなアプリケーション開発の障壁となっていた。Three.jsの登場はこの抽象化を一段階進めたが、DOM（Document Object Model）との同期や状態管理の統合においては依然として命令的な記述が必要であった。R3Fは、Reactの差分検知（Reconciliation）アルゴリズムをThree.jsのシーングラフに適用することで、この問題を解決した。

Viteの導入は、このエコシステムにさらなる加速をもたらした。従来のWebpackなどのバンドラーが大規模な3Dライブラリの処理に数秒から数十秒を要していたのに対し、ViteはネイティブESモジュールを活用することで、開発サーバーの即時起動と高速なホットモジュールリプレースメント（HMR）を実現している 1。これにより、3Dシーンの微細な調整—ライティングの強度やシェーダーのパラメータ変更—がリアルタイムで反映されるようになり、開発サイクルが劇的に短縮された 1。

| 技術要素 | 役割 | パフォーマンスへの寄与 |
| :---- | :---- | :---- |
| Vite | ビルドツール / 開発サーバー | 高速なHMR、効率的なESMバンドリング、ビルド時間の短縮 |
| React | UIフレームワーク | 宣言的な状態管理、Concurrent Modeによる優先度付きレンダリング |
| React Three Fiber | レンダラー (Reconciler) | Reactの状態とThree.jsのシーングラフを同期、スケジューリングの最適化 |
| Three.js | グラフィックスエンジン | WebGL/WebGPUの抽象化、ジオメトリ・マテリアル・ライトの管理 |

1

## **React Three Fiberにおけるパフォーマンスのボトルネックと回避戦略**

R3Fアプリケーションにおける最大のパフォーマンス低下要因は、GPUの処理能力不足ではなく、意外にもCPU側、すなわちReactのコンポーネント再レンダリングによるオーバーヘッドである 5。3Dシーンにおいて、特定のメッシュの座標を毎フレーム更新する場合、それをReactの状態（useState）として管理してしまうと、毎秒60回のコンポーネントツリーの再評価が発生し、メインスレッドを占有してしまう 7。

### **再レンダリングの抑制と参照の安定性**

パフォーマンスを極限まで高めるためには、ReactのライフサイクルとThree.jsのレンダリングループを分離する必要がある。useFrameフック内での直接的なオブジェクト操作（Mutation）が推奨されるのはこのためである。コンポーネントが再レンダリングされる際、新しいジオメトリやマテリアルが作成されると、GPUはそれらを再度アップロードする必要があり、これがフレームドロップ（カクつき）の原因となる 8。

| 最適化手法 | 目的 | 具体的なアクション |
| :---- | :---- | :---- |
| React.memo | 不要な再レンダリングの防止 | プロップスが変更されない限り、子コンポーネントの再評価をスキップする 5 |
| useMemo / useCallback | 参照の安定化 | ジオメトリやコールバック関数の再生成を防ぎ、子への不必要な伝播を抑える 5 |
| useFrame \+ useRef | 高頻度更新の隔離 | Reactの状態を経由せず、直接メッシュの属性を書き換える 6 |
| 依存関係の最小化 | コンテキストの影響範囲限定 | Context Providerの値を分割し、影響を受けるコンポーネントを最小化する 5 |

5

### **コンカレント機能の活用**

React 18以降で導入された useTransition や useDeferredValue は、3Dシーンにおいて特に威力を発揮する。重いジオメトリの生成や大規模なデータの処理を「バックグラウンド作業」としてマークすることで、ユーザーインターフェースの応答性を維持したまま、シーンの更新をスケジュールすることが可能になる 5。R3Fの最新バージョン（v8/v9以降）は、これらのコンカレント機能をデフォルトでサポートしており、従来の命令的なWebGL操作では困難であった「優先度付きレンダリング」を容易に実現している 3。

## **Three.js レンダリングエンジンの深層最適化**

グラフィックスレンダリングにおける計算コストは、大きく「CPU側での描画指令（Draw Calls）」と「GPU側でのピクセル処理」に分けられる。特にブラウザ環境においては、ドローコールの数そのものがCPUのオーバーヘッドとなり、全体のボトルネックとなるケースが多い 11。

### **ドローコールの管理と削減**

「毎フレーム100ドローコール未満」という基準は、多様なデバイスで60FPSを維持するための黄金律である 11。同一のマテリアルを共有する複数のメッシュを表示する場合、それらを個別のメッシュとして配置するのではなく、インスタンス化レンダリング（InstancedMesh）やバッチレンダリング（BatchedMesh）を活用することが不可欠である。

#### **InstancedMesh vs BatchedMesh**

| 特徴 | InstancedMesh | BatchedMesh (r156+) |
| :---- | :---- | :---- |
| ジオメトリ | 全インスタンスで同一である必要がある 11 | 異なる複数のジオメトリを混合可能 11 |
| マテリアル | 単一のマテリアルを共有 12 | 単一のマテリアルを共有 13 |
| 個別の制御 | 行列による位置・回転・スケール、カラー 11 | 位置・回転・スケール、カラー、可視性、ジオメトリの動的入れ替え 13 |
| パフォーマンス | 10万個以上の超大規模な配置に最適 14 | 多様な形状が混在するシーンのバッチ化に最適 15 |
| 利点 | GPUメモリの消費が極めて少ない 15 | 個別インスタンスのフラスタムカリングが可能 15 |

11

これらの技術を適切に選択することは、単に描画を速くするだけでなく、メモリ消費量（VRAM）の最適化にも直結する。特に、複雑なシーンでは「BatchedMesh」を利用することで、従来は困難であった「異なる形状を持つが同じマテリアルを持つオブジェクト」の統合が可能になり、モバイルデバイスでのパフォーマンスが劇的に向上する 13。

### **ジオメトリとマテリアルの再利用**

R3Fにおけるよくあるミスは、コンポーネントごとに新しいジオメトリやマテリアルをインラインで定義してしまうことである。

JavaScript

// 悪い例：レンダリングのたびに新しいオブジェクトが生成される  
\<mesh\>  
  \<boxGeometry args\={} /\>  
  \<meshStandardMaterial color\="red" /\>  
\</mesh\>

// 良い例：useMemoでキャッシュ、または外部で定義  
const boxGeo \= useMemo(() \=\> new THREE.BoxGeometry(1, 1, 1),);  
const redMat \= useMemo(() \=\> new THREE.MeshStandardMaterial({ color: 'red' }),);  
return \<mesh geometry\={boxGeo} material\={redMat} /\>;

7

さらに、Three.jsはGPUリソースの自動的なガベージコレクションを行わないため、不要になったジオメトリやマテリアルは .dispose() メソッドを用いて明示的に解放しなければならない 11。R3Fはこの処理をある程度自動化しているが、複雑なカスタムバッファやレンダーターゲットを使用する場合には、クリーンアップ関数の重要性が増す 6。

## **アセットパイプラインとデリバリ戦略**

3D体験の質は、アセットの品質とロード時間のバランスに依存する。50MBを超えるGLBファイルは、いかにレンダリングコードを最適化したとしても、ユーザーの離脱を招く決定的な要因となる 11。

### **モデルの圧縮と最適化**

現代的なアセットパイプラインでは、Draco圧縮やMeshoptが標準的に利用されている。Dracoはジオメトリデータを大幅に縮小するが、解凍にCPUパワーを必要とするため、Web Workerでの並列処理が前提となる 11。一方、Meshoptはデコード速度が極めて速く、メインスレッドへの負荷を最小限に抑えたい場合に適している 16。

また、gltf-transform などのツールを用いて、不要な属性の削除、テクスチャのリサイズ、インスタンス化情報の埋め込みを行うことは、プロダクションレベルのプロジェクトにおいて必須の工程である 11。

### **テクスチャのメモリ管理**

テクスチャはVRAMの大部分を占有する。PNGやJPEGなどの画像形式は、GPU上で展開されると元のファイルサイズに関わらず、解像度に応じた膨大なメモリを消費する（例：1024x1024の画像は、非圧縮時に約4MB以上のVRAMを消費する） 11。これに対処するための形式が KTX2 (Basis Universal) である。KTX2はGPUが直接読み込める圧縮形式を維持したまま転送されるため、VRAM消費量を1/10程度に抑えることが可能である 11。

| 最適化手法 | 効果 | 推奨ツール/プラグイン |
| :---- | :---- | :---- |
| Draco / Meshopt | ジオメトリのファイルサイズ削減 | gltf-transform, gltf-pipeline 11 |
| KTX2 (Basis) | VRAM消費量の削減、テクスチャ解凍の高速化 | gltf-transform, Shopify gltf-compressor 11 |
| テクスチャアトラス | ドローコールの削減（マテリアル共有） | Blender, gltf-transform 11 |
| WebP / AVIF | Web上での静止画転送サイズ削減 | Viteプラグイン, ImageMagick 10 |

10

## **Viteビルドエコシステムにおける3Dプロジェクトの設定**

Viteは単なる開発サーバーではなく、3Dアセットの最適化を統合するための強力なハブとなる。

### **効率的なビルド構成**

Viteの rollupOptions をカスタマイズすることで、大規模なThree.jsライブラリを適切にチャンク分割（Code Splitting）し、ブラウザのキャッシュを有効活用できる 17。特に、splitVendorChunkPlugin を使用することで、頻繁に更新されるアプリケーションコードと、静的なライブラリコードを分離することが推奨される 18。

また、vite-plugin-glsl は、シェーダーコード（.glsl,.vert,.frag）を外部ファイルとして管理し、ビルド時に自動的にインライン化・縮小化するために不可欠なプラグインである 19。これにより、複雑なカスタムシェーダーの開発効率が飛躍的に向上する。

### **PWAとオフライン対応**

vite-plugin-pwa を導入することで、大規模な3Dアセットをサービスワーカー経由でプリキャッシュし、リピーターに対するロード時間をゼロに近づけることができる 21。これは「オフラインファースト」の考え方に基づき、ネットワーク環境に依存しない安定した3D体験を提供する上で重要である。

## **自律型パフォーマンス改善エージェント「Bolt ⚡」の再定義**

ユーザーからのリクエストに基づき、React Three Fiber、Three.js、Viteに特化したパフォーマンス最適化エージェント「Bolt」のプロンプトを、最新の知見とベストプラクティスを反映させて書き換える。

### ---

**Bolt ⚡ \- 次世代 R3F & WebGL パフォーマンス・エンジニア**

**ミッション:**

あなたは、React Three Fiber、Three.js、およびViteを用いたスタックにおいて、コードベースのパフォーマンスを極限まで高める自律型エージェントです。単一の「小さな変更」を積み重ねることで、フレームレート（FPS）の向上、ドローコールの削減、VRAMの節約、および初期ロード時間の短縮を達成します。

#### **1\. 行動原則 (Boundaries)**

✅ **必ず実行すること:**

* 変更前に r3f-perf または renderer.info を用いて現状のボトルネックを特定する。  
* pnpm lint および pnpm build を実行し、ツリーシェイキングや型安全性を確認する。  
* 3Dリソース（Geometry, Material, Texture）の適切なクリーンアップ（dispose）を保証する。  
* 最適化の前後での具体的な数値変化（ドローコール数、VRAM使用量、FPS）をドキュメント化する。

⚠️ **事前に確認すること:**

* 新しい依存関係（例: three-std, postprocessing 等）の追加。  
* InstancedMesh や BatchedMesh への大規模なリファクタリング。  
* キャンバス全体のレンダリングループ戦略（frameloop="demand" への変更等）の変更。

🚫 **決して行わないこと:**

* useFrame 内での setState 呼び出し。  
* レンダリングループ内での新しいオブジェクト（new THREE.Vector3() 等）のインスタンス化。  
* コードの可読性を著しく損なうだけのマイクロ・オプティマイゼーション。  
* 実際のボトルネックが証明されていない箇所への時期尚早な最適化。

#### **2\. ボルトの哲学 (Philosophy)**

* **FPSは最優先事項:** 16.6ms（60FPS）または8.3ms（120FPS）のフレーム予算を厳守せよ。  
* **Reactは指揮者、Three.jsは演奏者:** 重い処理をReactのスケジューラーから隔離し、GPUに直接届ける。  
* **アセットは負債:** ロードされる1バイト、消費される1KBのVRAMには、それに見合う価値が必要である。  
* **測定が真実を語る:** プロファイラの結果がない最適化は、単なる推測である。

#### **3\. 日次プロセス (Daily Process)**

**Step 1: 🔍 プロファイリング (Hunt for R3F Bottlenecks)**

* **R3F レンダリング:** 不必要な再レンダリングを特定。React.memo や useMemo の欠如を調査。  
* **シーングラフの負荷:** r3f-perf でドローコール数を確認。100を超えている場合は統合を検討。  
* **メモリ管理:** VRAMのリークや、不必要なジオメトリの重複を特定。  
* **ビルドとデリバリ:** Viteのビルドレポートを確認し、大きなチャンクや最適化されていないアセットを特定。

**Step 2: ⚡ 選択 (Choose Your Daily Boost)**

* 50行未満で実装可能で、かつ測定可能なインパクト（例: ドローコール20%減）を持つ改善を選択。  
* 低リスクかつ、既存のデザインパターン（React/Three.jsの標準的な手法）に従ったもの。

**Step 3: 🔧 実装 (Optimize with Precision)**

* 3D数学的根拠に基づいた効率的なコードを記述。  
* useFrame 内部では「ミューテーション（書き換え）」を、それ以外では「イミュータビリティ」を使い分ける。

**Step 4: ✅ 検証 (Measure the Impact)**

* 実機でのFPS計測、r3f-perf による統計の再確認。  
* メモリリークテスト（コンポーネントのマウント/アンマウントの繰り返し）。

**Step 5: 🎁 プレゼンテーション (Share the Speed Boost)**

* タイトル: "⚡ Bolt: の最適化"  
* 💡 **内容:** 何を変更し、どのThree.js/React機能を活用したか。  
* 🎯 **理由:** どのプロファイリング指標がこの変更を正当化したか。  
* 📊 **インパクト:** 「ドローコールが 120 \-\> 15 に減少」「VRAM使用量が 40MB 削減」。

#### **4\. ボルトのお気に入り (FAVORITE OPTIMIZATIONS)**

⚡ InstancedMesh を使用した大量の同一オブジェクトの統合 11 ⚡ BatchedMesh による多様なジオメトリの単一ドローコール化 11 ⚡ useFrame \+ ref によるリアクティブではない高速な状態更新 7 ⚡ ジオメトリとマテリアルのコンポーネント外への移動または useMemo 化 7 ⚡ useLoader ( useGLTF, useTexture ) による自動的なリソースキャッシュ 7 ⚡ PerformanceMonitor を用いた動的な解像度・DPRの調整 22 ⚡ frameloop="demand" による静止シーンの計算コスト削減 11 ⚡ vite-plugin-glsl を用いたシェーダーコードの最適化と管理 19 ⚡ useTransition を用いた重い3Dシーン遷移のスケジュール化 5 ⚡ 視界外のオブジェクトに対する visible={false} によるカリング強化 6

#### **5\. ボルトが避けること (AVOIDS)**

❌ インパクトのない微細なJS構文の変更。

❌ シーングラフ全体を壊すような大規模な再設計。

❌ 十分なクリーンアップ処理（dispose）を伴わないオブジェクト生成。

❌ r3f-perf 等のデータに基づかない「勘」による最適化。

## ---

**性能監視と継続的な改善のためのツールキット**

最適化プロセスを客観的なデータで支えるためには、適切なツールセットの習得が不可欠である。R3Fエコシステムには、開発者がリアルタイムで内部状態を把握するための高度なツールが揃っている 11。

### **リアルタイム・モニタリング**

r3f-perf は、R3F開発におけるデファクトスタンダードのモニタリングツールである。これは単なるFPSメーターではなく、GPUのメモリ消費量、アクティブなプログラム（シェーダー）の数、テクスチャの数、およびドローコール数を詳細に表示する 23。

| 指標 | 意味 | 最適化の閾値 |
| :---- | :---- | :---- |
| **Calls** | 現在のフレームでのドローコール数 | 100未満を維持 11 |
| **Triangles** | レンダリングされているポリゴン数 | モバイル環境では50万以下を推奨 25 |
| **VRAM** | GPUメモリの占有量 | デバイスのメモリ制限（特にモバイル）に注意 11 |
| **Geometries / Textures** | キャッシュされているリソース数 | 増え続ける場合はメモリリークの疑い 23 |

11

### **高度なデバッグ**

さらに深い層のデバッグには、Spector.js やブラウザの Performance タブが有効である。Spector.js は、特定のフレームで行われたすべてのWebGL呼び出しをキャプチャし、どのような順序で、どのバッファを使用して描画が行われたかを可視化する 11。これにより、意図しないマテリアルの切り替えや、冗長なレンダリングパスを発見することが可能になる。

## **未来への展望：WebGPUとTSL（Three Shading Language）**

2025年から2026年にかけて、ウェブ3Dの風景は WebGPU の本格的な普及によって劇的に変化しようとしている。WebGPUは、従来のWebGLが抱えていた「CPUからGPUへのオーバーヘッド」を劇的に削減し、より現代的なGPUアーキテクチャの力を引き出す 11。

### **WebGPU Renderer への移行**

Three.jsは現在、WebGPURenderer への移行を強力に推進している。これにより、これまで不可能であった「コンピュートシェーダー」を用いた数百万個のパーティクル物理シミュレーションや、動的なGPUカリングがブラウザ上で現実のものとなる 11。

また、新しいシェーダー記述言語である TSL (Three Shading Language) は、GLSLやWGSLの差異を吸収し、ノードベースの直感的な記述で高度なシェーダーを構築することを可能にする 11。これにより、開発者はターゲットとするAPI（WebGL2 / WebGPU）を意識することなく、最高のパフォーマンスを発揮するシェーダーを記述できるようになる。

### **適応型レンダリングの進化**

次世代のR3Fアプリケーションでは、PerformanceMonitor をさらに高度化させ、デバイスのバッテリー残量やGPUの温度、さらにはネットワーク帯域に応じて、アセットの品質（LOD）やポストプロセスの強度を動的に、かつユーザーに気づかれずに変更する手法が一般的になるだろう 22。

## **総括**

React Three Fiber、Three.js、およびViteを組み合わせたモダンな開発スタックは、ウェブ上での表現力を無限に広げる可能性を秘めている。しかし、そのポテンシャルを最大限に引き出すためには、フレームワークの背後にある「レンダリングの物理学」を理解し、適切なツールを用いてボトルネックを特定し続ける必要がある。

本報告書で再定義したエージェント「Bolt」のプロンプトは、単なる効率化のガイドラインではなく、3Dウェブ開発における「パフォーマンス・ファースト」の文化を体現するものである。計測し、最適化し、検証する。この繰り返しのプロセスこそが、2026年以降のデジタル空間において、ユーザーに驚きと感動を与えるシームレスな体験を構築するための唯一の道である。

開発者は、常に進化し続けるライブラリのアップデートに敏感であると同時に、アセットの圧縮、ドローコールの管理、メモリの解放といった、普遍的なグラフィックス最適化の原則に立ち返るべきである。それが実現されたとき、ブラウザという窓を通じて、現実と見紛うばかりの、あるいは想像を超えた新しい世界が構築されることになる。

#### **引用文献**

1. How to Build a Simple 3D Portfolio Website with Vite, React, Three.js, and Strapi, 3月 10, 2026にアクセス、 [https://strapi.io/blog/build-a-simple-3-d-portfolio-website-with-vite-react-three-js-and-strapi](https://strapi.io/blog/build-a-simple-3-d-portfolio-website-with-vite-react-three-js-and-strapi)  
2. Optimizing React Development with Vite \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/krishna7852/optimizing-react-development-with-vite-bgo](https://dev.to/krishna7852/optimizing-react-development-with-vite-bgo)  
3. pmndrs/react-three-fiber: A React renderer for Three.js \- GitHub, 3月 10, 2026にアクセス、 [https://github.com/pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber)  
4. Introduction \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/getting-started/introduction](https://r3f.docs.pmnd.rs/getting-started/introduction)  
5. React Performance Optimization: Best Techniques for Faster, Smoother Apps in 2025, 3月 10, 2026にアクセス、 [https://www.growin.com/blog/react-performance-optimization-2025/](https://www.growin.com/blog/react-performance-optimization-2025/)  
6. r3f-best-practices | Skills Marketplace \- LobeHub, 3月 10, 2026にアクセス、 [https://lobehub.com/ar/skills/emalorenzo-three-agent-skills-r3f-best-practices](https://lobehub.com/ar/skills/emalorenzo-three-agent-skills-r3f-best-practices)  
7. Performance pitfalls \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/advanced/pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)  
8. How to use state management with react-three-fiber without performance issues \- Questions, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/how-to-use-state-management-with-react-three-fiber-without-performance-issues/61223](https://discourse.threejs.org/t/how-to-use-state-management-with-react-three-fiber-without-performance-issues/61223)  
9. Common Performance Bottlenecks in React \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/ak\_23/common-performance-bottlenecks-in-react-3cji](https://dev.to/ak_23/common-performance-bottlenecks-in-react-3cji)  
10. React Performance Optimization: 15 Best Practices for 2025 \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/alex\_bobes/react-performance-optimization-15-best-practices-for-2025-17l9](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)  
11. 100 Three.js Tips That Actually Improve Performance (2026) \- Utsubo, 3月 10, 2026にアクセス、 [https://www.utsubo.com/blog/threejs-best-practices-100-tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)  
12. How to choose between InstancedMesh and BatchedMesh? \- \#3 by Fennec \- three.js forum, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221/3](https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221/3)  
13. BatchedMesh – three.js docs, 3月 10, 2026にアクセス、 [https://threejs.org/docs/pages/BatchedMesh.html](https://threejs.org/docs/pages/BatchedMesh.html)  
14. How to choose between InstancedMesh and BatchedMesh? \- three.js forum, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221](https://discourse.threejs.org/t/how-to-choose-between-instancedmesh-and-batchedmesh/81221)  
15. How to create instanced mesh in drei with multiple parts \- three.js forum, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/how-to-create-instanced-mesh-in-drei-with-multiple-parts/60388](https://discourse.threejs.org/t/how-to-create-instanced-mesh-in-drei-with-multiple-parts/60388)  
16. Want to increase my page speed by optimizing three js code, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/want-to-increase-my-page-speed-by-optimizing-three-js-code/86976](https://discourse.threejs.org/t/want-to-increase-my-page-speed-by-optimizing-three-js-code/86976)  
17. Optimize Vite Build Time: A Comprehensive Guide \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/perisicnikola37/optimize-vite-build-time-a-comprehensive-guide-4c99](https://dev.to/perisicnikola37/optimize-vite-build-time-a-comprehensive-guide-4c99)  
18. Building for Production \- Vite, 3月 10, 2026にアクセス、 [https://v3.vitejs.dev/guide/build](https://v3.vitejs.dev/guide/build)  
19. vite-plugin-glsl \- NPM, 3月 10, 2026にアクセス、 [https://www.npmjs.com/package/vite-plugin-glsl?activeTab=dependents](https://www.npmjs.com/package/vite-plugin-glsl?activeTab=dependents)  
20. Using glslify with node.js live server? \- Questions \- three.js forum, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/using-glslify-with-node-js-live-server/47852](https://discourse.threejs.org/t/using-glslify-with-node-js-live-server/47852)  
21. Build a Blazing-Fast, Offline-First PWA with Vue 3 and Vite in 2025: The Definitive Guide | by Christopher Tseng | Medium, 3月 10, 2026にアクセス、 [https://medium.com/@Christopher\_Tseng/build-a-blazing-fast-offline-first-pwa-with-vue-3-and-vite-in-2025-the-definitive-guide-5b4969bc7f96](https://medium.com/@Christopher_Tseng/build-a-blazing-fast-offline-first-pwa-with-vue-3-and-vite-in-2025-the-definitive-guide-5b4969bc7f96)  
22. Scaling performance \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/advanced/scaling-performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)  
23. R3F-Perf \- React Three Fiber Tutorials, 3月 10, 2026にアクセス、 [https://sbcode.net/react-three-fiber/r3f-perf/](https://sbcode.net/react-three-fiber/r3f-perf/)  
24. utsuboco/r3f-perf: Easily monitor your ThreeJS performances. \- GitHub, 3月 10, 2026にアクセス、 [https://github.com/utsuboco/r3f-perf](https://github.com/utsuboco/r3f-perf)  
25. Building Efficient Three.js Scenes: Optimize Performance While Maintaining Quality, 3月 10, 2026にアクセス、 [https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)  
26. Three. js vs. GLSL. Which one is more efficient, less expensive, more widely applicable? : r/threejs \- Reddit, 3月 10, 2026にアクセス、 [https://www.reddit.com/r/threejs/comments/1g67phb/three\_js\_vs\_glsl\_which\_one\_is\_more\_efficient\_less/](https://www.reddit.com/r/threejs/comments/1g67phb/three_js_vs_glsl_which_one_is_more_efficient_less/)  
27. Transpiling shader from GLSL ES 3 to TSL \- Questions \- three.js forum, 3月 10, 2026にアクセス、 [https://discourse.threejs.org/t/transpiling-shader-from-glsl-es-3-to-tsl/76398](https://discourse.threejs.org/t/transpiling-shader-from-glsl-es-3-to-tsl/76398)
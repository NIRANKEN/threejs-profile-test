# **React Three Fiber、Three.js、およびVite 6環境におけるセキュアな3Dアプリケーション開発と自動セキュリティ監視エージェント「Sentinel」の再定義**

現代のウェブ開発において、React 19とVite 6の登場は、3Dグラフィックスをブラウザ上で実現するための技術スタックに劇的な変化をもたらした。特に、React Three Fiber（R3F）バージョン9とThree.jsの最新リリースの組み合わせは、単なる視覚的な強化にとどまらず、複雑なインタラクティブ・システムを構築するための基盤となっている。しかし、GPUリソースへの直接的なアクセスや、クライアントサイドでの重い計算処理、そして分散されたアセット管理は、従来のウェブアプリケーションとは異なる独自の脆弱性を生み出している。本レポートでは、最新のライブラリ環境におけるセキュリティ基準を詳述し、コードベースを保護するためのセキュリティ監視エージェント「Sentinel」のプロンプトを、React Three FiberおよびViteに特化した形式で再定義する。

## **Vite 6および開発環境のセキュリティ要件**

Vite 6は、2025年から2026年にかけて、開発サーバーのセキュリティを大幅に強化した。特に、DNSリバインディング攻撃を防御するための「allowedHosts」の導入は、ローカル開発環境がネットワーク経由で攻撃を受けるリスクを最小限に抑えるための重要なステップである1。従来の開発環境では、ホスト名の検証が不十分であったため、攻撃者が悪意のあるウェブサイトを介して開発者のローカルサーバーにリクエストを送信し、ソースコードや環境変数を窃取することが可能であった2。

### **開発サーバーの要塞化とホスト検証**

Vite 6における「server.allowedHosts」の設定は、もはやオプションではなく、プロフェッショナルなプロジェクトにおける必須要件である1。デフォルトでは「localhost」やIPアドレスが許可されているが、特定のドメインを使用して開発を行う場合は、明示的なリスト作成が推奨される。これを「true」に設定することは、あらゆるウェブサイトからのリクエストを許可することを意味し、DNSリバインディング攻撃に対して無防備になるため、厳禁とされている1。

| 設定項目            | 推奨値                                | セキュリティ上の意義                             |
| :------------------ | :------------------------------------ | :----------------------------------------------- |
| server.allowedHosts | \['project.local', '.internal.com'\]  | DNSリバインディング攻撃の防止 1                  |
| server.fs.strict    | true                                  | プロジェクトルート外のファイルへのアクセス制限 1 |
| server.fs.deny      | \['.env', '.env.\*', '\*.{crt,pem}'\] | 機密ファイルの露出防止 1                         |
| server.cors         | 特定のオリジンのみ許可                | クロスオリジンでのデータ窃取の防止 1             |

また、2026年初頭に報告されたCVE-2025-31125のような、クエリパラメータを操作してserver.fs.denyをバイパスするファイル読み取りの脆弱性は、開発サーバーがネットワークに公開されている（--hostフラグが使用されている）場合に特に危険である3。 Sentinelは、これらの設定が適切に構成されているかを監視し、パッチが適用された最新バージョンのVite（6.2.4以上など）が使用されていることを確認しなければならない3。

### **環境変数とシークレットの管理**

Vite環境において、import.meta.envを介してアクセスされる変数は、ビルド時にクライアントコードにインジェクションされる。VITE\_プレフィックスが付いた変数のみが露出する仕組みは、意図しない機密情報の漏洩を防ぐためのものであるが、開発者が誤ってAPIキーやデータベースの認証情報をこのプレフィックスで定義してしまうミスは後を絶たない5。Sentinelは、コードスキャンを通じて、ハードコードされたシークレットや、クライアント側に露出させるべきではない機密情報がVITE\_変数に含まれていないかを常にチェックする必要がある。

## **React 19およびReact Three Fiber 9のアーキテクチャ的安全性**

React 19は、React Compilerの導入により、手動のメモ化（useMemoやuseCallback）の必要性を大幅に減少させた6。これはR3Fにおいても重要な意味を持つ。R3FはReactのレンダラーとして機能し、JSX要素（\<mesh /\>など）をThree.jsの命令（new THREE.Mesh()）に変換するが、このプロセスにおける再レンダリングの最適化は、アプリケーションのパフォーマンスと安定性に直結する7。

### **自動メモ化と副作用のクリーンアップ**

React 19とR3F 9の組み合わせでは、Suspenseの動作が改善され、副作用の管理がより厳格になった9。以前のバージョンでは、コンポーネントがサスペンドした際に、イベントリスナーの追加などの副作用が適切にクリーンアップされず、メモリリークや意図しない動作を引き起こすことがあった9。R3F 9では、アタッチメントやコンストラクタの効果がサスペンド中に繰り返し発火しないよう調整されており、これによりアプリケーションの予測可能性が向上している9。

Sentinelは、React 19の新しい慣習に従い、不要になった手動のメモ化を削除しつつ、Three.jsのオブジェクト参照が意図せず再生成されないよう監視する役割を担う6。特に、useFrameループ内でのオブジェクト生成は、ガベージコレクション（GC）の負荷を高め、結果としてブラウザのメインスレッドを占有するサービス拒否（DoS）的な状況を作り出す可能性がある10。

### **コンポーネントの可視性とリソース破棄**

Three.jsのリソース（Geometry、Material、Textureなど）は、JavaScriptのGCだけでは完全に解放されない場合があり、明示的な.dispose()の呼び出しが必要となる12。R3Fはコンポーネントがアンマウントされる際に自動的にこれらのリソースを破棄するが、これはリソースがJSXツリー内で適切に管理されている場合に限られる8。

Sentinelは、以下の表に示すようなリソース管理のベストプラクティスが守られているかを確認しなければならない。

| 管理対象              | 推奨される手法                     | セキュリティ/パフォーマンス上の理由                         |
| :-------------------- | :--------------------------------- | :---------------------------------------------------------- |
| ジオメトリ/マテリアル | useMemoまたはグローバル定義        | 毎フレームの再生成によるメモリリークの防止 10               |
| アセットロード        | useLoaderまたはuseGLTF             | キャッシュの再利用とネットワーク負荷の軽減 13               |
| 条件付きレンダリング  | visibleプロパティの使用            | 頻繁なマウント/アンマウントによるGPUコンパイル負荷の回避 10 |
| アニメーション        | useFrame内での直接ミューテーション | Reactのスケジューラを介さない高速な更新 10                  |

## **セキュリティ監視エージェント「Sentinel」の再定義**

ユーザーの要求に基づき、React Three Fiber、Three.js、およびViteを利用するプロジェクトに特化したSentinelのプロンプトを以下に再定義する。このプロンプトは、最新のライブラリ環境における推奨事項を反映しており、AIエージェントがコードベースを保護するための明確な指針を提供する。

### ---

**Sentinel 🛡️ \- R3F & Vite セキュリティ・ガーディアン**

あなたは「Sentinel」です。React Three Fiber (R3F)、Three.js、React、およびViteをベースとした3Dアプリケーションのコードベースを、脆弱性やパフォーマンスの低下から守るセキュリティ専門エージェントです。

あなたの任務は、コードベース内のセキュリティ上の欠陥を特定し、修正すること、あるいはアプリケーションの堅牢性を高めるための強化策を提案することです。

#### **🛠️ 利用可能なコマンド (このリポジトリの構成に合わせて使用してください)**

- **テストの実行:** pnpm test (Vitestスイートを実行)
- **静的解析:** pnpm lint (ESLint、特に @react-three/eslint-plugin のチェック)
- **フォーマット:** pnpm format (Prettierによる自動整形)
- **ビルド確認:** pnpm build (本番ビルドによる型の整合性とアセット参照の確認)

#### **📝 セキュリティ・コーディング・スタンダード**

**✅ 推奨されるパターン:**

TypeScript

// 1\. 環境変数の安全な参照  
const apiUrl \= import.meta.env.VITE_API_URL; // プレフィックスによる露出制御

// 2\. フレームループ内でのパフォーマンス・セーフティ  
const vec \= new THREE.Vector3();  
useFrame((state, delta) \=\> {  
 // オブジェクトの再生成を避け、既存のインスタンスをミューテーションする  
 meshRef.current.position.x \+= Math.sin(state.clock.elapsedTime) \* delta;  
});

// 3\. アセットのキャッシュと再利用  
const { nodes, materials } \= useGLTF('/models/secure-asset.glb'); // 自動的にキャッシュされる

// 4\. 数学的な安全性  
const targetPosition \= new THREE.Vector3(inputX, 0, inputZ);  
if (\!isNaN(targetPosition.length())) {  
 mesh.position.lerp(targetPosition, 0.1);  
}

**❌ 避けるべきパターン:**

TypeScript

// 1\. ハードコードされたシークレット  
const apiKey \= 'sk_live_123456789'; // 露出のリスク

// 2\. フレームループ内でのオブジェクト生成 (GC DoS)  
useFrame(() \=\> {  
 const tempVec \= new THREE.Vector3(1, 2, 3); // 毎秒60回生成される  
 meshRef.current.position.add(tempVec);  
});

// 3\. シェーダー内への文字列インジェクション  
const fragmentShader \= \`void main() { gl_FragColor \= vec4(${userInputColor}, 1.0); }\`; // シェーダーインジェクション

// 4\. 重い計算によるメインスレッドのブロック  
useEffect(() \=\> {  
 computeExpensivePhysics(hugeDataset); // Web Workerを使用すべき  
},);

#### **🛡️ Sentinel の日常的プロセス**

1. **🔍 スキャン (SCAN)** \- 以下の優先順位で脆弱性を探索します。  
   **🚨 クリティカル (即時修正):**
   - vite.config.ts での allowedHosts: true 設定 (DNSリバインディングリスク)
   - .env ファイルのコミットや、クライアント側への機密情報の露出
   - ユーザー入力をそのまま ShaderMaterial のソースコードに結合する行為
   - 認証なしでアクセス可能な敏感なデータエンドポイント

   **⚠️ 高優先度:**
   - クロスサイト・スクリプティング (XSS) 対策の欠如
   - コンテンツセキュリティポリシー (CSP) の欠如、または過度に寛容な設定
   - フレームループ内での setState 呼び出し (Reactレンダリングループの過負荷)
   - アセットの読み込みにおけるサニタイズ不足 (不正なGLBファイルによるブラウザハング)

   **🔒 中優先度:**
   - .dispose() の呼び出し漏れによるメモリリーク
   - useFrame 内でのデルタ時間 (delta) を無視したアニメーション (実行環境による速度差)
   - エラーメッセージによる内部スタックトレースの露出

2. **🎯 優先順位付け (PRIORITIZE)** \- 最も影響が大きく、かつ50行以内でクリーンに修正可能な問題を選択します。
3. **🔧 修正の実施 (SECURE)** \- 防御的プログラミングを徹底します。入力の検証、適切なフックの使用、リソースの破棄を確実に行います。
4. **✅ 検証 (VERIFY)** \- リンター、テスト、およびビルドを実行し、修正によって新たな脆弱性や回帰バグが発生していないことを確認します。
5. **🎁 報告 (PRESENT)** \- 修正内容、脆弱性のインパクト、および検証結果をまとめたプルリクエストを作成します。

## ---

**グラフィックス・パイプラインにおける防御的プログラミング**

3Dアプリケーションにおけるセキュリティは、ネットワークや認証のレイヤーだけでなく、数学的な計算やGPUへの命令セットにおいても考慮されるべきである15。特にシェーダープログラム（GLSL）は、不適切に記述されるとGPUをハングアップさせ、システム全体の不安定化を招く可能性がある15。

### **シェーダー・インジェクションの防止**

シェーダー内で動的な値を使用する場合、JavaScript側で文字列を組み立てるのではなく、必ず「Uniforms」を使用しなければならない17。UniformsはJavaScriptとGPU間の安全なインターフェースを提供し、シェーダーの再コンパイルを防ぐとともに、コードインジェクションのリスクを排除する18。

OpenGL Shading Language

// ✅ 安全なGLSL (Uniformsを使用)  
uniform vec3 uColor;  
void main() {  
 gl_FragColor \= vec4(uColor, 1.0);  
}

Sentinelは、ShaderMaterial や RawShaderMaterial の定義を走査し、動的な文字列挿入が行われていないかを確認する。また、シェーダー内のループ処理においては、無限ループを防ぐために静的な反復回数を強制する手法が推奨される15。

### **数学的安定性と数値のサニタイズ**

3D空間における座標計算では、NaN（Not a Number）や Infinity が発生しやすく、これが一度発生するとレンダリング全体が崩壊し、デバッグが困難な状態に陥る。これは、意図的に不正な値を入力することでアプリケーションをクラッシュさせる攻撃手法にもなり得る。

計算式：

![][image1]  
この単純な更新式においても、![][image2]（デルタ時間）が極端に大きな値になったり、Velocityに不正な値が含まれていると、オブジェクトが視界外に飛び出し、物理エンジンがクラッシュする原因となる10。Sentinelは、useFrame 内での計算において、入力値のバリデーションが行われているか、および delta が適切に使用されているかを監視する10。

## **アセット保護と知的財産セキュリティ**

3Dモデル（GLTF/GLBファイル）は、ウェブ上で公開される性質上、完全に「盗難」を防ぐことは不可能である。ブラウザがレンダリングを行うためには、最終的に生の頂点データがGPUに渡される必要があるからだ19。しかし、Sentinelは以下のような「多層防御」を提案することで、アセットの不正利用のコストを大幅に高めることができる。

### **プログレッシブ・ローディングとアクセス制御**

高精細なモデルは機密性が高いため、最初は低解像度のモデルを表示し、ユーザーが特定の操作を行ったり、認証を済ませた後にのみ高解像度のアセットをロードする手法が有効である13。

| 対策                         | 手法                                | 効果                                          |
| :--------------------------- | :---------------------------------- | :-------------------------------------------- |
| 難読化                       | バイナリデータのエンコード/難読化   | ツールによる直接的なリッピングを困難にする 20 |
| サーバーサイド・レンダリング | サーバーで描画した画像のみを送信    | モデルデータを一切クライアントに渡さない 20   |
| 透かし入れ (Steganography)   | 頂点座標への微小な摂動の埋め込み    | 漏洩したアセットのソース特定が可能 21         |
| 認証ベースのロード           | connect-src による制限と署名付きURL | 未認証のドメインからのアセット取得を防止 15   |

Sentinelは、アセットのロードが useLoader を通じて行われ、適切な Suspense 境界が設定されているかを確認する13。また、アセットを取得するオリジンがコンテンツセキュリティポリシー（CSP）の connect-src で制限されているかを検証する23。

## **パフォーマンスとセキュリティのトレードオフ：オンデマンド・レンダリング**

通常、Three.jsのアプリケーションは毎秒60回（またはそれ以上）の描画ループを実行するが、これはデバイスのバッテリーを急速に消耗させ、ハードウェアへの負荷を高める13。これは、意図的に複雑なシーンを描画させることでユーザーのデバイスを加熱させる「リソース枯渇攻撃」の対象となり得る。

最新のR3Fにおける推奨事項は、静的なシーンや動きの少ないアプリケーションにおいて frameloop="demand" を使用することである13。これにより、状態が変化したときのみ描画が行われるようになり、不要なGPU使用率を抑えることができる。

TypeScript

\<Canvas frameloop="demand"\>  
 {/\* シーンの内容 \*/}  
\</Canvas\>

Sentinelは、アプリケーションの用途に応じてこの設定が適切に検討されているか、およびアニメーションが必要な場合には手動で invalidate() が呼び出されているかを確認する13。

## **自動化された品質管理とセキュリティ・パイプライン**

Sentinelが効果的に機能するためには、CI/CDパイプラインに以下のツールが統合されている必要がある。

### **ESLintと3D特有のルール**

@react-three/eslint-plugin は、3Dアプリケーションに特有のアンチパターンを検出するための強力なツールである11。特に以下のルールは、安定性とセキュリティの観点から重要である。

- @react-three/no-new-in-loop: フレームループ内での new THREE.Vector3() などの呼び出しを禁止する11。
- @react-three/no-clone-in-loop: フレームループ内でのオブジェクトのクローンを禁止する11。
- @react-three/no-fast-state: useFrame 内での頻繁な setState を警告し、直接的なミューテーションや regress() の使用を促す24。

### **Vitestによる単体テストと統合テスト**

2025年以降、Viteとの親和性が高い Vitest が標準的なテストランナーとなっている26。3Dコンポーネントのテストにおいては、@react-three/test-renderer を使用して、WebGLコンテキストなしでシーングラフを検証することが可能である7。

Sentinelは、新しい機能が追加された際に、対応するテストが作成されているか、および既存のセキュリティ要件（例：不正な入力値の拒否）を満たしているかを検証する。

## **結論と推奨事項**

React Three Fiber と Vite 6 を用いた現代のウェブ3D開発において、セキュリティは単なる「追加の作業」ではなく、設計の根幹に関わる要素である。Vite 6のホスト検証による開発環境の保護、React 19の自動メモ化による安定性の向上、そしてR3F 9のリソース管理機能の活用は、堅牢なアプリケーションを構築するための三本の柱となる。

本レポートで再定義されたセキュリティ・エージェント「Sentinel」は、これらの最新の技術基準を自動的に適用し、人間の開発者が見落としがちなGPUリソースの不適切な管理や、ネットワーク構成の脆弱性を即座に特定・修正する役割を果たす。今後、ウェブグラフィックスがより高度化し、WebGPUのような新しいAPIが普及するにつれ、グラフィックス・パイプラインそのものを保護対象とする「Sentinel」の重要性はさらに増していくであろう。

開発チームは、本レポートの指針に従い、自動化された監視ツールと厳格なコーディングスタンダードを組み合わせることで、ユーザーに安全かつ快適な3D体験を提供し続けることが求められる。

#### **引用文献**

1. Server Options \- Vite, 3月 10, 2026にアクセス、 [https://vite.dev/config/server-options](https://vite.dev/config/server-options)
2. CVE-2025-24010 Detail \- NVD \- NIST, 3月 10, 2026にアクセス、 [https://nvd.nist.gov/vuln/detail/CVE-2025-24010](https://nvd.nist.gov/vuln/detail/CVE-2025-24010)
3. Actively Exploited Vite Vitejs Vulnerability (CVE-2025-31125) | UpGuard, 3月 10, 2026にアクセス、 [https://www.upguard.com/news/vitejs-data-breach-2026-01-23](https://www.upguard.com/news/vitejs-data-breach-2026-01-23)
4. 2393983 – (CVE-2025-58752) CVE-2025-58752 vite: Vite's \`server.fs\` settings were not applied to HTML files \- Red Hat Bugzilla, 3月 10, 2026にアクセス、 [https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2025-58752](https://bugzilla.redhat.com/show_bug.cgi?id=CVE-2025-58752)
5. Resolving CORS Issues in React Applications with Vite | by Kamatchi \- Medium, 3月 10, 2026にアクセス、 [https://medium.com/@kam96.5.20/resolving-cors-issues-in-react-applications-with-vite-0d78753ca12d](https://medium.com/@kam96.5.20/resolving-cors-issues-in-react-applications-with-vite-0d78753ca12d)
6. React 19 Best Practices: Write Clean, Modern, and Efficient React Code \- DEV Community, 3月 10, 2026にアクセス、 [https://dev.to/jay_sarvaiya_reactjs/react-19-best-practices-write-clean-modern-and-efficient-react-code-1beb](https://dev.to/jay_sarvaiya_reactjs/react-19-best-practices-write-clean-modern-and-efficient-react-code-1beb)
7. React Three Fiber: Introduction, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/](https://r3f.docs.pmnd.rs/)
8. pmndrs/react-three-fiber: A React renderer for Three.js \- GitHub, 3月 10, 2026にアクセス、 [https://github.com/pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber)
9. v9 Migration Guide \- Introduction \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
10. Performance pitfalls \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/advanced/pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)
11. @react-three/eslint-plugin \- npm, 3月 10, 2026にアクセス、 [https://npmjs.com/package/@react-three/eslint-plugin](https://npmjs.com/package/@react-three/eslint-plugin)
12. WebGL best practices \- Web APIs | MDN \- Mozilla, 3月 10, 2026にアクセス、 [https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
13. Scaling performance \- React Three Fiber, 3月 10, 2026にアクセス、 [https://r3f.docs.pmnd.rs/advanced/scaling-performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
14. React-Three-Fiber: Enhancing Scene Quality with Drei \+ Performance Tips \- Medium, 3月 10, 2026にアクセス、 [https://medium.com/@ertugrulyaman99/react-three-fiber-enhancing-scene-quality-with-drei-performance-tips-976ba3fba67a](https://medium.com/@ertugrulyaman99/react-three-fiber-enhancing-scene-quality-with-drei-performance-tips-976ba3fba67a)
15. WebGL Security Best Practices: Ensuring Safe 3D Web Experiences \- PixelFreeStudio Blog, 3月 10, 2026にアクセス、 [https://blog.pixelfreestudio.com/webgl-security-best-practices-ensuring-safe-3d-web-experiences/](https://blog.pixelfreestudio.com/webgl-security-best-practices-ensuring-safe-3d-web-experiences/)
16. WebGL and WebGPU must robustly defend against malicious web content making the A... | Hacker News, 3月 10, 2026にアクセス、 [https://news.ycombinator.com/item?id=46418766](https://news.ycombinator.com/item?id=46418766)
17. The Study of Shaders with React Three Fiber | by Sarvar Murad \- Medium, 3月 10, 2026にアクセス、 [https://sarvar-murad.medium.com/the-study-of-shaders-with-react-three-fiber-7f49351efdce](https://sarvar-murad.medium.com/the-study-of-shaders-with-react-three-fiber-7f49351efdce)
18. The Study of Shaders with React Three Fiber \- Maxime Heckel's Blog, 3月 10, 2026にアクセス、 [https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/](https://blog.maximeheckel.com/posts/the-study-of-shaders-with-react-three-fiber/)
19. Encrypting 3D Models for WebGL \- Reddit, 3月 10, 2026にアクセス、 [https://www.reddit.com/r/webgl/comments/2z22qe/encrypting_3d_models_for_webgl/](https://www.reddit.com/r/webgl/comments/2z22qe/encrypting_3d_models_for_webgl/)
20. Protecting 3D models \- Questions \- Babylon.js \- BabylonJS Forum, 3月 10, 2026にアクセス、 [https://forum.babylonjs.com/t/protecting-3d-models/49835](https://forum.babylonjs.com/t/protecting-3d-models/49835)
21. Protecting 3D Graphics Content \- Communications of the ACM, 3月 10, 2026にアクセス、 [https://cacm.acm.org/research/protecting-3d-graphics-content/](https://cacm.acm.org/research/protecting-3d-graphics-content/)
22. Protecting 3D Graphics Content \- Stanford Computer Graphics Laboratory, 3月 10, 2026にアクセス、 [https://graphics.stanford.edu/papers/protecting/protecting.pdf](https://graphics.stanford.edu/papers/protecting/protecting.pdf)
23. How to Implement Content Security Policy (CSP) for React Apps \- OneUptime, 3月 10, 2026にアクセス、 [https://oneuptime.com/blog/post/2026-01-15-content-security-policy-csp-react/view](https://oneuptime.com/blog/post/2026-01-15-content-security-policy-csp-react/view)
24. RFC: @react-three/eslint-plugin rules · Issue \#2701 \- GitHub, 3月 10, 2026にアクセス、 [https://github.com/pmndrs/react-three-fiber/issues/2701](https://github.com/pmndrs/react-three-fiber/issues/2701)
25. Setup \- Wawa Sensei, 3月 10, 2026にアクセス、 [https://wawasensei.dev/courses/react-three-fiber/lessons/setup](https://wawasensei.dev/courses/react-three-fiber/lessons/setup)
26. Advanced Guide to Using Vite with React in 2025 \- CodeParrot AI, 3月 10, 2026にアクセス、 [https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025](https://codeparrot.ai/blogs/advanced-guide-to-using-vite-with-react-in-2025)
27. Is Vitest still necessary in 2025? : r/node \- Reddit, 3月 10, 2026にアクセス、 [https://www.reddit.com/r/node/comments/1ioguv6/is_vitest_still_necessary_in_2025/](https://www.reddit.com/r/node/comments/1ioguv6/is_vitest_still_necessary_in_2025/)

[image1]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAoCAYAAABDw6Z2AAAJNUlEQVR4Xu3cB6xsRRnA8U9FsYsd63uKvUWwl/AUsWDsDWLsGgv23o29EBsoUmyIHWPsorGAvcfYFdGHDRV7b7HMPzMfOzucvffde0Xvve//S77sOXPO290zuy/z7TdzboQkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZLWh++V+FmLH5X4SYkvlXhkf9IqPL/E9cfGwa1L7DI2bhIPiVm/nlziB1H798YlztCdt1L02TPGxgn3HBs2mE+UOLHEd0tsL/Go7hjf2RPa8UWuU+LfJY4bD6zQY8aGdeDuUa9NkrSTuXDUxOKMLfYo8Z4St+lPWiEGlHeOjQMG4quPjZvIYVH74cFt/2wl/hw1iWB7NeizcbC+ybC/pcSvY22J4Xpw0ajXermh/YgSX476PV0KCfJaEjb6kdfv+/FeJS7W7f+v8f/z6yX+UeLiw7Heq6P+OJAkbSJnL/H9sTHqYLXv2LhKNx0bdgIHRe3De3Rtj25tn+za1ioTwo3gSWPDMugrqm29H5Y4y9A25XOxtoRtdP4Svytx5fHAClxqbGjONDYs8JWoCexlSvylxO7zh09FQnfOsVGStLGRsDHN1KOK8PcSl+7aLhF1OmYcdLZFTRr2K7FriTNHrfrQjutFncK6bAvw/EyZXqjtp6nXuGqJW7Xt3WL+Pa1nmbBxPemVre1VXRseVuJ2Q9sFS9yvxOVL7N3a6DOmRcGA/LyoU6TZr7hCiTt0++Az4TX6atwFStwy6uB/pajJ+Y4kQmux0oSNKfp/xfxnfmi3nXjvTEP31/fZOG3Ctn+JB5S4xtCOa5W4S9T+AP2Y32G8L+pnR59lle0iUSvUVANBAnXJqJ/dlLeMDVFfl/+DO+KN3Tbv5YXdPvh/w3fha1ETu0UJnSRpA5pK2A6MmgyAKaFnlvhiiQOiTsul80VdL8VAyQBCErC1bTNYMm3zgahTrh9sAZKMX8b8gDi+xhOirnGjGsW5vA5TtawHI/FZ76YSNq7rN1EHeZw76jWRkD4iatKb3hS1X/lsXt7a6AeeE/QPffPNmPUr3hvz06YkHpzDcx8es+Tu3lHP47N4VonXlfhtO3Z6WWnC9oKo7/FpXdu1u23wHSMBJpH6Qsymm8eE7bZRkzUS3uNLnKO1n6vEu0t8J+paOX6ogH78W9sGfch7+VSJ57S2U1obnwteEzXBfGLbH5EQ363b51o+3u0v54rd9j9L/LHbB98DKpLfatuPnz8sSdrISNh+H3VAY9CjmpODGUgwqC70cgr1qSVeWmKfqIlBTu2QePWD5THddiJJyYSNtTnja3y+22ZQ5Plx57a/3mXCdmTUJOFm84djz6jHH9u1sc+gT/9/tcT9S5w1ZlUf+qy/dipjU1OieQ43j7BNFac/ltO0bPdVn29021O2x2mrdyRJixJoKlBUnzK4GaXfz8rUUvgu5fWMCcgNox6jvzL4gYA+YXtX1O94j3+3pT32lSuqvKmvYPEjhnPHKVGuPZM8/h8shyo0STpJ8lhhXspnhn0qzySHVJ17z435/7+SpE2ChC0rBFMYpN4w0XbeFmwT/Z2lJFs5WGIqYSM53Na2SUjG1/hw1OcHz88UIO7Y9te7TNiYqpvCdCfHeUysPWKdElijxHEqOiQWoM/6aydhm3r+PIc+ZTsTvjx2cLfdJyVMpS2FNVxM+fV4jYcObaByRZXwzV1wbf0+sRymcvN6xvf3wKjHju4i76LtE7Yft+jx727fHklypvAZpkzYrtK14ZqtHeN3eJF9S/xpbFwCa0DfMTZGbeurj/j0sC9J2iRI2LircBEWeffVLio+WQ3jbrS0PWaD5bjge2rtDlN029o2FbbxNf7a7TMg5lQXFZ4cIKkkMD1FteEpMb/QmkGOaVZQ+cuEktcCVSb+/MMiTJ/xnEvFUjJhI+GYwto0prX6pIDzqbj1VR4SOs7bJWqf5bWDqiNTqeB6U56TSSGJXn8spxXZZtoxUdVLTIWzpuvFXRvVv3SDqInOr2LH70hd6ZRookJ2QsxPJ4J+GhOfvLuZ79PxbZtEij7s/Tzq94cKclaM0V9L3zeZHHJn87FR1wX2x3iP9+naFiGhyjVub4v5KfNF3j82dHhPWXmkipuf/Y1K3LdtS5I2gfNEXQuTicyIxfB/iDpAg0Rnr7Z9VMz+3Ykl7tS2qaT0a3MYUBiktnRtVMr6KaTxNfoBlkEoBznWuOWgRHWJKlNWeLJaxaCbgycLsZ8d9Txkkkai9Iq2fXp4SdT3+bjxQIcpwpPaNgkAi+xJoLeWuG5rpy/4Uw4Yq4uce0jbHqtoJKkkeaxpYj0WqFj2lRrOO7Tb/3bMPk+m4DIJzBsicioVTOlhqvKzyGoTNq6bKU2ud0Qi3q9rI9EGySdVNq5nj5ivsLGO7+Ft+8lR+4ElAeinqF8Ws2n+/Ntu/GA47tQzKtYiUn1cbiqSG3BY55n4zI/p9hdhTdqHYrYOlGnfDN4TySc/aDKppLr50ajvS5K0CbDQmiSBwZDHRbjjjF/5rCfqE7GjSry2xIuiJkAkSgxKPB8DGMkgeKSKQRUCVNw456dR18FhfA0qGSzS5iYDzqWSQzXpF22fqgl3+/VJHxUhsPaLRfU5XcQarlzrxWJ9sBapn8b9byKRZAE/75MKzrjuq3fzqGuoqGTmzQhbo1azSMboq0wyeT4i+wxUR7Nf6f/sLx5BwkK/Mf1If+/a2vmjsJxHokwfbm/7J0dNgEg4E1OoJC45HbpnzCqeWeHbEatN2Pge9NW9HtdHQkPV6+2tLb+DeT3gO/iRqMkrN3L0+G6Q0PEah8WsH+kbHqlcgYoyn2f+MOlxQ8dyeO4RSfVSidVeUZOw5YJr4EfNSVGT6HHqVpKk/6uPtcf9ow5ue8es+oPd2yPJKUiMsGjdkmoSQWUSrPNiqpnEjOoVC+WzOnW1dt5d2/5y+psfNoOjoybA3FwhSZIWoBJyStu+RdQpIZBEsP30to8Do1YEXx91GozqnBY7Imql8K1tnz8x8qC2zZ/SoKJDxYy7hFlzuDNinSWV4ewjSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkSZIkafAfchLgXjwPED0AAAAASUVORK5CYII=
[image2]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAYCAYAAAARfGZ1AAABaElEQVR4Xu2UyyuEURjGH+QWSRamLCyUsp4UZWeBnZWaYsVCSokyCzsbl5UiC1lZsLFVxiUbkbKi5JKFhYWZf0AoPO+85xvne2dGySyk+dWv5rzPey6d0zdAkb/GIO2wxULQQt/oFS012a9Zp8/0gw6YLB+TdNoWLc30mg5DF7+gJaGObGroC523gWWVjtAyeg/doD/UkU0vtK/PBj5N9IaWu7FsIpPOMx1hIrSVrtB3GoW+V06W6Kg3lk0ekP9Ua3Qf+j5Jukc3Qx2ORnpLK0x9DLr4iakHyH2/0jkb+CzQcVsklfQRukG3yYQeaCb3npMGekerbOCYgC5wZAPoieWbqLVBwCydskWPauidygZdJjulZ6aWoQ56arm774hDF9/1asF9L7pxPV3+ioEZ+kQP6QH09eXVE8Zj6OJie3om0ObGQ268QTvd7/RjpVzDT9yWydAvd4de0i0ac/WCIn8Z8kUX+a98An/iUWZJ2DlRAAAAAElFTkSuQmCC

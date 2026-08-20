# infra (AWS CDK)

`threejs-profile-test` フロントエンド（Viteの静的ビルド）を S3 + CloudFront にデプロイするための CDK スタック。

- **FrontendStack**: 非公開のS3バケット + CloudFront（Origin Access Control 経由でのみS3へアクセス）。ビルド成果物 (`../dist`) を `BucketDeployment` でアップロードし、デプロイの都度キャッシュを invalidate する。
- **GithubOidcStack**: GitHub Actions が長期アクセスキーなしでAWSにデプロイできるようにする OIDC 用 IAM ロール。CDKブートストラップロール一式のみを AssumeRole できる最小権限構成。

## 初回セットアップ（手動・一度だけ）

CI自身にはまだAWSへの権限がないため、以下は管理者権限を持つローカル環境（`aws configure` 等で認証済み）から実行する。

```bash
cd infra
npm install

# 1. このAWSアカウント/リージョンでCDKを未ブートストラップの場合のみ
npx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>

# 2. GitHub ActionsからAssumeされるOIDCロールを作成
npx cdk deploy GithubOidcStack
```

デプロイ後に出力される `DeployRoleArn` を、対象リポジトリの GitHub Secrets に登録する。

- `AWS_DEPLOY_ROLE_ARN`: 上記で出力されたロールARN
- (任意) リポジトリ変数 `AWS_REGION`: デプロイ先リージョン（未設定時は `ap-northeast-1`）

以降、`main` ブランチへのpush（または手動実行）で `.github/workflows/deploy.yml` が `FrontendStack` をデプロイする。

## デフォルトの前提

- GitHub リポジトリ: `niranken/threejs-profile-test`
- OIDCロールをAssumeできるのは `main` ブランチからのワークフロー実行のみ（`bin/infra.ts` の `githubRepo` / `allowedBranch` で変更可能）
- CloudFrontはカスタムドメイン未設定（`*.cloudfront.net` のデフォルトドメインで配信）。独自ドメインを使う場合は `us-east-1` のACM証明書とRoute 53設定を `FrontendStack` に追加すること。
- `SiteBucket` は `RemovalPolicy.DESTROY` + `autoDeleteObjects: true`。検証用途のための設定であり、本番でバケットを誤削除から守りたい場合は `RETAIN` に変更する。

## ローカルでの確認

```bash
cd infra
npm install
npx cdk diff FrontendStack   # 差分確認
npx cdk synth                # CloudFormationテンプレート出力
```

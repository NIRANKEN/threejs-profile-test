import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

export interface E2eScreenshotsStackProps extends cdk.StackProps {
  /** "owner/repo" 形式のGitHubリポジトリ */
  readonly githubRepo: string;
}

/**
 * PR起動時のE2E CIが撮影したスクリーンショットを保存する非公開バケットと、
 * そこへPutObject/GetObjectするためだけのOIDCデプロイ専用ロール。
 * GithubOidcStack のデプロイ用ロール（main/production限定）とは異なり、
 * このロールは pull_request イベントごとに引き受けられる必要があるため分離している。
 */
export class E2eScreenshotsStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly uploadRole: iam.Role;

  constructor(scope: Construct, id: string, props: E2eScreenshotsStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "E2eScreenshotsBucket", {
      bucketName: `github-actions-threejs-profile-e2e-screenshots-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: false,
      // CI実行ごとの使い捨て成果物のため、ライフサイクルルールで自動失効させる
      // （署名付きURLの有効期限7日に対して余裕を持たせた14日）。
      lifecycleRules: [
        {
          prefix: "e2e/",
          expiration: cdk.Duration.days(14),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // GitHub OIDCプロバイダはAWSアカウントにつき同一URLで1つしか作成できない
    // （IAMの制約）。GithubOidcStack で作成済みのものを新規作成せず参照する。
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GithubOidcProvider",
      `arn:${this.partition}:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    this.uploadRole = new iam.Role(this, "GithubActionsE2eScreenshotsRole", {
      roleName: "github-actions-threejs-profile-e2e-screenshots",
      description: `E2E screenshot upload role assumed via OIDC by GitHub Actions on pull_request (${props.githubRepo})`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          // mainブランチ限定のデプロイ用ロールとは異なり、PRごとに引き受けられる
          // 必要があるため pull_request イベントのsubクレームを許可する。
          "token.actions.githubusercontent.com:sub": `repo:${props.githubRepo}:pull_request`,
        },
      }),
    });

    // アップロード（PutObject）と署名付きURL生成（GetObjectの署名にはGetObject権限が必要）
    // のみに限定し、ListBucket・Delete系は付与しない。
    this.uploadRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "UploadAndSignE2eScreenshots",
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject", "s3:GetObject"],
        resources: [this.bucket.arnForObjects("e2e/*")],
      }),
    );

    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "GitHub Actionsのvars(E2E_SCREENSHOT_BUCKET_NAME)に設定するバケット名",
    });
    new cdk.CfnOutput(this, "RoleArn", {
      value: this.uploadRole.roleArn,
      description: "GitHub Actionsのsecrets(AWS_E2E_SCREENSHOT_ROLE_ARN)に設定するARN",
    });
  }
}

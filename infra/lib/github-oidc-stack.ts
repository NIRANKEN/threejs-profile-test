import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

export interface GithubOidcStackProps extends cdk.StackProps {
  /** "owner/repo" 形式のGitHubリポジトリ */
  readonly githubRepo: string;
  /** このロールを引き受けられるブランチ（例: "main"） */
  readonly allowedBranch: string;
  /** ワークフローが `environment:` で指定するGitHub Environment名（例: "production"） */
  readonly allowedEnvironment: string;
  /** CDKブートストラップの qualifier（未指定時は既定値 "hnb659fds"） */
  readonly bootstrapQualifier?: string;
}

/**
 * GitHub Actions が OIDC でAssumeRoleし、CDKブートストラップロール一式のみを
 * 引き受けられるようにするデプロイ専用ロール。
 * 長期のアクセスキーをGitHub Secretsに保持しないための構成。
 */
export class GithubOidcStack extends cdk.Stack {
  public readonly deployRole: iam.Role;

  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const qualifier = props.bootstrapQualifier ?? "hnb659fds";

    // GitHub OIDCプロバイダはAWSアカウントにつき同一URLで1つしか作成できない
    // （IAMの制約）。他プロジェクトで既に作成済みのことが多いため、新規作成はせず
    // 既存のものを参照する。ARNはプロバイダのホスト名で決まるため、アカウントIDが
    // 分かれば固定形式で組み立てられる。
    const provider = iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(
      this,
      "GithubOidcProvider",
      `arn:${this.partition}:iam::${this.account}:oidc-provider/token.actions.githubusercontent.com`,
    );

    this.deployRole = new iam.Role(this, "GithubActionsDeployRole", {
      roleName: "github-actions-threejs-profile-deploy",
      description: `CDK deploy role assumed via OIDC by GitHub Actions (${props.githubRepo}@${props.allowedBranch}, environment:${props.allowedEnvironment})`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        },
        StringLike: {
          // ワークフローが `environment: production` を宣言していると、OIDCトークンの
          // subクレームはref形式ではなくenvironment形式になるため、両方を許可する。
          "token.actions.githubusercontent.com:sub": [
            `repo:${props.githubRepo}:ref:refs/heads/${props.allowedBranch}`,
            `repo:${props.githubRepo}:environment:${props.allowedEnvironment}`,
          ],
        },
      }),
    });

    // CDKデプロイ自体はブートストラップ済みのロール（file-publishing-role /
    // deploy-role 等）に委譲されるため、このロールはそれらをAssumeできれば十分。
    this.deployRole.addToPolicy(
      new iam.PolicyStatement({
        sid: "AssumeCdkBootstrapRoles",
        effect: iam.Effect.ALLOW,
        actions: ["sts:AssumeRole"],
        resources: [
          `arn:${this.partition}:iam::${this.account}:role/cdk-${qualifier}-deploy-role-${this.account}-${this.region}`,
          `arn:${this.partition}:iam::${this.account}:role/cdk-${qualifier}-file-publishing-role-${this.account}-${this.region}`,
          `arn:${this.partition}:iam::${this.account}:role/cdk-${qualifier}-lookup-role-${this.account}-${this.region}`,
        ],
      }),
    );

    new cdk.CfnOutput(this, "DeployRoleArn", {
      value: this.deployRole.roleArn,
      description: "GitHub Actionsのsecrets(AWS_DEPLOY_ROLE_ARN)に設定するARN",
    });
  }
}

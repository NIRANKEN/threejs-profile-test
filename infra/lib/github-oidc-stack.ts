import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

export interface GithubOidcStackProps extends cdk.StackProps {
  /** "owner/repo" 形式のGitHubリポジトリ */
  readonly githubRepo: string;
  /** このロールを引き受けられるブランチ（例: "main"） */
  readonly allowedBranch: string;
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

    // GitHubのOIDCプロバイダ。アカウント内に既存の場合は
    // `cdk import` または手動作成済みのARNを参照する形に切り替えること。
    const provider = new iam.OpenIdConnectProvider(this, "GithubOidcProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
    });

    this.deployRole = new iam.Role(this, "GithubActionsDeployRole", {
      roleName: "github-actions-threejs-profile-deploy",
      description: `CDK deploy role assumed via OIDC by GitHub Actions (${props.githubRepo}@${props.allowedBranch})`,
      maxSessionDuration: cdk.Duration.hours(1),
      assumedBy: new iam.WebIdentityPrincipal(provider.openIdConnectProviderArn, {
        StringEquals: {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        },
        StringLike: {
          "token.actions.githubusercontent.com:sub": `repo:${props.githubRepo}:ref:refs/heads/${props.allowedBranch}`,
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

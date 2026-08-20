#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { GithubOidcStack } from "../lib/github-oidc-stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
};

// GitHub Actions からOIDCでAssumeするデプロイ専用ロール。
// 管理者権限を持つローカル環境から一度だけ `cdk deploy GithubOidcStack` する。
new GithubOidcStack(app, "GithubOidcStack", {
  env,
  githubRepo: app.node.tryGetContext("githubRepo") ?? "niranken/threejs-profile-test",
  allowedBranch: app.node.tryGetContext("allowedBranch") ?? "main",
});

// S3 + CloudFront による静的サイト配信。GitHub Actionsからは通常こちらのみをデプロイする。
new FrontendStack(app, "FrontendStack", { env });

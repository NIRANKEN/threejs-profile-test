#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CertificateStack } from "../lib/certificate-stack";
import { E2eScreenshotsStack } from "../lib/e2e-screenshots-stack";
import { FrontendStack } from "../lib/frontend-stack";
import { GithubOidcStack } from "../lib/github-oidc-stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "ap-northeast-1",
};

const githubRepo: string = app.node.tryGetContext("githubRepo") ?? "NIRANKEN/threejs-profile-test";

// GitHub Actions からOIDCでAssumeするデプロイ専用ロール。
// 管理者権限を持つローカル環境から一度だけ `cdk deploy GithubOidcStack` する。
new GithubOidcStack(app, "GithubOidcStack", {
  env,
  githubRepo,
  allowedBranch: app.node.tryGetContext("allowedBranch") ?? "main",
  allowedEnvironment: app.node.tryGetContext("allowedEnvironment") ?? "production",
});

// E2E CIが撮影したスクリーンショットのアップロード先バケット + PRごとにOIDCで
// Assumeするアップロード専用ロール。他スタックへの依存はなく単独でデプロイ可能。
// 管理者権限を持つローカル環境から一度だけ `cdk deploy E2eScreenshotsStack` する。
new E2eScreenshotsStack(app, "E2eScreenshotsStack", {
  env,
  githubRepo,
});

// カスタムドメインを使う場合は `-c siteDomain=portfolio.example.com` のように指定する。
// 未指定時はGitHub Actionsからのデプロイでもカスタムドメインが失われないよう、
// 本番で使用しているドメインをデフォルト値とする。
// hostedZoneDomain を省略した場合、siteDomainの先頭ラベルを除いた部分をゾーン名とみなす
// （例: siteDomain=portfolio.example.com -> hostedZoneDomain=example.com）。
const siteDomain: string | undefined =
  app.node.tryGetContext("siteDomain") ?? "portfolio.mayatecholab.com";
const hostedZoneDomain: string | undefined =
  app.node.tryGetContext("hostedZoneDomain") ?? siteDomain?.split(".").slice(1).join(".");

// CloudFrontにアタッチする証明書はus-east-1固定という制約があるため、
// FrontendStackとは別リージョンのスタックに分離する。
const certificateStack = siteDomain
  ? new CertificateStack(app, "CertificateStack", {
      env: { account: env.account, region: "us-east-1" },
      crossRegionReferences: true,
      siteDomain,
      hostedZoneDomain: hostedZoneDomain as string,
    })
  : undefined;

// S3 + CloudFront による静的サイト配信。GitHub Actionsからは通常こちらのみをデプロイする。
new FrontendStack(app, "FrontendStack", {
  env,
  crossRegionReferences: true,
  siteDomain,
  hostedZoneDomain,
  certificate: certificateStack?.certificate,
});

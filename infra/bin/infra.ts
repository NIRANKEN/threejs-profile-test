#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CertificateStack } from "../lib/certificate-stack";
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
  allowedEnvironment: app.node.tryGetContext("allowedEnvironment") ?? "production",
});

// カスタムドメインを使う場合は `-c siteDomain=portfolio.example.com` のように指定する。
// hostedZoneDomain を省略した場合、siteDomainの先頭ラベルを除いた部分をゾーン名とみなす
// （例: siteDomain=portfolio.example.com -> hostedZoneDomain=example.com）。
const siteDomain: string | undefined = app.node.tryGetContext("siteDomain");
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

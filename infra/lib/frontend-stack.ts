import * as path from "node:path";
import * as cdk from "aws-cdk-lib";
import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";

export interface FrontendStackProps extends cdk.StackProps {
  /** カスタムドメインを割り当てる場合のFQDN（例: "portfolio.example.com"）。未指定時は*.cloudfront.netのまま配信する */
  readonly siteDomain?: string;
  /** siteDomainを管理するRoute53ホストゾーン名（例: "example.com"）。siteDomain指定時は必須 */
  readonly hostedZoneDomain?: string;
  /** us-east-1で発行済みのACM証明書（siteDomain指定時は必須）。CertificateStackの出力を渡す */
  readonly certificate?: acm.ICertificate;
}

/**
 * 静的SPA（Vite build出力）を配信するS3 + CloudFront構成。
 * S3バケットは非公開のまま、CloudFront Origin Access Control (OAC) 経由でのみ
 * アクセスを許可する（レガシーなOAIは使わない）。
 */
export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: FrontendStackProps) {
    super(scope, id, props);

    const { siteDomain, hostedZoneDomain, certificate } = props ?? {};
    if (siteDomain && (!hostedZoneDomain || !certificate)) {
      throw new Error("siteDomain を指定する場合は hostedZoneDomain と certificate も必須です");
    }

    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      // ポートフォリオ/検証用途のため destroy 可能にしている。
      // 本番運用でバケットの誤削除を防ぎたい場合は RETAIN に変更すること。
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      comment: "threejs-profile-test frontend",
      defaultRootObject: "index.html",
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      domainNames: siteDomain ? [siteDomain] : undefined,
      certificate,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      // SPAのクライアントサイドルーティング用に、S3からの403/404を
      // index.htmlへフォールバックさせる。
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(0),
        },
      ],
    });

    const distPath = path.join(__dirname, "..", "..", "dist");

    // ハッシュ付きファイル（Viteの assets/*）は長期キャッシュ。
    const hashedAssetsDeployment = new s3deploy.BucketDeployment(this, "DeployHashedAssets", {
      sources: [s3deploy.Source.asset(distPath, { exclude: ["*", "!assets/**"] })],
      destinationBucket: siteBucket,
      cacheControl: [
        s3deploy.CacheControl.maxAge(cdk.Duration.days(365)),
        s3deploy.CacheControl.fromString("immutable"),
      ],
      prune: false,
    });

    // index.html・モデル(.glb)など非ハッシュ付きファイルは再検証必須で配信し、
    // 最後にCloudFrontのキャッシュを全体invalidateする。
    const rootFilesDeployment = new s3deploy.BucketDeployment(this, "DeployRootFiles", {
      sources: [s3deploy.Source.asset(distPath, { exclude: ["assets/**"] })],
      destinationBucket: siteBucket,
      cacheControl: [
        s3deploy.CacheControl.maxAge(cdk.Duration.seconds(0)),
        s3deploy.CacheControl.mustRevalidate(),
      ],
      prune: false,
      distribution,
      distributionPaths: ["/*"],
    });
    rootFilesDeployment.node.addDependency(hashedAssetsDeployment);

    if (siteDomain && hostedZoneDomain) {
      const zone = route53.HostedZone.fromLookup(this, "HostedZone", {
        domainName: hostedZoneDomain,
      });
      const target = route53.RecordTarget.fromAlias(
        new route53targets.CloudFrontTarget(distribution),
      );
      new route53.ARecord(this, "SiteAliasRecordA", {
        zone,
        recordName: siteDomain,
        target,
      });
      new route53.AaaaRecord(this, "SiteAliasRecordAAAA", {
        zone,
        recordName: siteDomain,
        target,
      });
    }

    new cdk.CfnOutput(this, "BucketName", { value: siteBucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: distribution.distributionDomainName,
      description: "CloudFrontのデフォルトドメイン（https://を付けてアクセス）",
    });
    if (siteDomain) {
      new cdk.CfnOutput(this, "SiteUrl", {
        value: `https://${siteDomain}`,
        description: "カスタムドメインでのサイトURL",
      });
    }
  }
}

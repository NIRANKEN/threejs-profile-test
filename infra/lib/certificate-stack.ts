import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export interface CertificateStackProps extends cdk.StackProps {
  /** CloudFrontに割り当てるFQDN（例: "portfolio.example.com"） */
  readonly siteDomain: string;
  /** 対象FQDNを管理するRoute53ホストゾーン名（例: "example.com"） */
  readonly hostedZoneDomain: string;
}

/**
 * CloudFront用のACM証明書。CloudFrontの制約上、証明書は必ずus-east-1で
 * 発行する必要があるため、他リージョンのFrontendStackとは別スタックに分離し、
 * crossRegionReferences 経由で証明書を参照させる。
 */
export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.ICertificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const zone = route53.HostedZone.fromLookup(this, "HostedZone", {
      domainName: props.hostedZoneDomain,
    });

    this.certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.siteDomain,
      validation: acm.CertificateValidation.fromDns(zone),
    });
  }
}

import { appendFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const SCREENSHOT_DIR = "e2e-screenshots";
const COMMENT_MARKER = "<!-- e2e-screenshots -->";
const PRESIGNED_URL_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

interface UploadEnv {
  readonly bucket: string;
  readonly repository: string;
  readonly prNumber: string;
  readonly sha: string;
}

function readRequiredEnv(): UploadEnv {
  const bucket = process.env.E2E_SCREENSHOT_BUCKET;
  const repository = process.env.GITHUB_REPOSITORY;
  const prNumber = process.env.PR_NUMBER;
  const sha = process.env.GITHUB_SHA;

  const missing = [
    !bucket && "E2E_SCREENSHOT_BUCKET",
    !repository && "GITHUB_REPOSITORY",
    !prNumber && "PR_NUMBER",
    !sha && "GITHUB_SHA",
  ].filter((name): name is string => Boolean(name));

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        "This script is intended to run only inside the CI e2e-test job.",
    );
  }

  return { bucket: bucket!, repository: repository!, prNumber: prNumber!, sha: sha! };
}

async function listScreenshots(): Promise<string[]> {
  const entries = await readdir(SCREENSHOT_DIR);
  return entries.filter((name) => name.endsWith(".png")).sort();
}

async function main(): Promise<void> {
  const env = readRequiredEnv();
  const files = await listScreenshots();

  if (files.length === 0) {
    throw new Error(`No .png files found in ${SCREENSHOT_DIR}/`);
  }

  const s3 = new S3Client({});
  const keyPrefix = `e2e/${env.repository}/pr-${env.prNumber}/${env.sha}/`;

  const rows: string[] = [];
  for (const file of files) {
    const key = `${keyPrefix}${file}`;
    const body = await readFile(path.join(SCREENSHOT_DIR, file));

    await s3.send(
      new PutObjectCommand({
        Bucket: env.bucket,
        Key: key,
        Body: body,
        ContentType: "image/png",
      }),
    );

    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: env.bucket, Key: key }), {
      expiresIn: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    rows.push(`### ${file}\n\n![${file}](${url})`);
    console.log(`Uploaded ${file} -> s3://${env.bucket}/${key}`);
  }

  const markdown = [
    COMMENT_MARKER,
    "## 📸 E2E スクリーンショット",
    `commit \`${env.sha.slice(0, 7)}\` / 署名付きURLの有効期限: 7日間`,
    "",
    ...rows,
    "",
  ].join("\n");

  await mkdir(SCREENSHOT_DIR, { recursive: true });
  await writeFile(path.join(SCREENSHOT_DIR, "pr-comment.md"), markdown, "utf-8");

  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `\n${markdown}\n`, "utf-8");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

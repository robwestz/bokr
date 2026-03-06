import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

function buildS3Client() {
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION || "us-east-1";
  const accessKeyId = process.env.S3_ACCESS_KEY;
  const secretAccessKey = process.env.S3_SECRET_KEY;

  // For MinIO/local, endpoint + forcePathStyle are typical.
  return new S3Client({
    region,
    endpoint,
    forcePathStyle: Boolean(endpoint),
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  });
}

export const s3 = buildS3Client();

export async function presignPut(objectKey: string, contentType = "application/pdf", expiresSeconds = 60 * 5) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET || "mtb-assets",
    Key: objectKey,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn: expiresSeconds });
}

export async function presignGet(objectKey: string, expiresSeconds = 60 * 10) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET || "mtb-assets",
    Key: objectKey,
  });
  return getSignedUrl(s3, cmd, { expiresIn: expiresSeconds });
}

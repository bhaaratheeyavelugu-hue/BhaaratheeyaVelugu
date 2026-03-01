import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_BUCKET ?? process.env.R2_BUCKET;
const region = process.env.AWS_REGION ?? "auto";
const endpoint = process.env.S3_ENDPOINT ?? process.env.R2_ENDPOINT;
const forcePathStyle = false; // R2 usually doesn't need this anymore, S3 might

console.log("Storage init:", { bucket, region, endpoint, hasR2Key: !!process.env.R2_ACCESS_KEY_ID });

const isR2 = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && endpoint);
const s3 =
  bucket && (process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID)
    ? new S3Client({
        region,
        ...(endpoint && {
          endpoint,
          forcePathStyle,
        }),
        credentials:
          process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
            ? {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
              }
            : undefined,
        // R2 does not support x-amz-checksum-mode; omit it from presigned GetObject URLs to avoid 400
        ...(isR2 && {
          requestChecksumCalculation: "WHEN_REQUIRED" as const,
          responseChecksumValidation: "WHEN_REQUIRED" as const,
        }),
      })
    : null;

export async function getSignedReadUrl(key: string, expiresIn = 3600): Promise<string> {
  if (!s3 || !bucket) return "";
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export async function uploadBuffer(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!s3 || !bucket) throw new Error("Storage not configured");
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

export function isStorageConfigured(): boolean {
  return !!(bucket && (process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID));
}

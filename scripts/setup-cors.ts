import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const bucket = process.env.S3_BUCKET ?? process.env.R2_BUCKET;
const endpoint = process.env.S3_ENDPOINT ?? process.env.R2_ENDPOINT;
const isR2 = !!(process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && endpoint);
const region = isR2 ? "auto" : (process.env.AWS_REGION ?? "auto");

if (!bucket) {
  console.error("No S3_BUCKET or R2_BUCKET configured.");
  process.exit(1);
}

const credentials = isR2
  ? {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    }
  : process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  : undefined;

const s3 = new S3Client({
  region,
  ...(endpoint && { endpoint, forcePathStyle: !isR2 }),
  credentials,
});

const corsCommand = new PutBucketCorsCommand({
  Bucket: bucket,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        AllowedOrigins: ["*"],
        ExposeHeaders: ["ETag"],
        MaxAgeSeconds: 3600,
      },
    ],
  },
});

async function run() {
  try {
    console.log(`Applying permissive CORS policy for direct uploads to bucket: ${bucket}...`);
    await s3.send(corsCommand);
    console.log("\n✅ CORS configured successfully! Your browser uploads will now be accepted.");
  } catch (err) {
    console.error("❌ Failed to configure CORS:", err);
  }
}

run();

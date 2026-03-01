/**
 * Generate favicons from public/logo.png for all devices.
 * Run: node scripts/generate-favicons.js
 * Requires: npm install sharp --save-dev
 */

const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "..", "public");
const logoPath = path.join(publicDir, "logo.png");

if (!fs.existsSync(logoPath)) {
  console.warn("public/logo.png not found. Add your logo there and run again.");
  process.exit(1);
}

async function run() {
  let sharp;
  try {
    sharp = require("sharp");
  } catch {
    console.warn("Install sharp first: npm install sharp --save-dev");
    process.exit(1);
  }

  const sizes = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "favicon-32.png", size: 32 },
  ];

  const buffer = await sharp(logoPath).resize(512, 512).png().toBuffer();

  for (const { name, size } of sizes) {
    const outPath = path.join(publicDir, name);
    await sharp(buffer).resize(size, size).png().toFile(outPath);
    console.log("Created " + name);
  }
  console.log("For favicon.ico: use an online converter (e.g. favicon.io) with favicon-32.png, or copy favicon-32.png to favicon.ico if your server allows.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

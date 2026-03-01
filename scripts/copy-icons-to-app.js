/**
 * Copy favicon and apple-icon from public/ to app/ so Next.js file conventions
 * auto-emit the right <link> tags (improves iPhone and all platforms).
 * Run before build: node scripts/copy-icons-to-app.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");

const copies = [
  { from: "favicon.ico", to: "favicon.ico" },
  { from: "apple-touch-icon.png", to: "apple-icon.png" },
];

for (const { from, to } of copies) {
  const src = path.join(publicDir, from);
  const dest = path.join(appDir, to);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("Copied", from, "-> app/" + to);
  }
}

import sharp from "sharp";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const SOURCE_DIR =
  "C:\\Users\\samgo\\PizzaDAO Dropbox\\Dread Pizza Roberts\\pizza-oven-py\\ingredients-db";
const OUT_DIR = join(__dirname, "..", "public", "toppings");
const DATA_PATH = join(__dirname, "..", "src", "data", "toppings.json");

const toppings = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const skus = new Set<number>(toppings.map((t: { sku: number }) => t.sku));

// Build a map of sku -> source file path
const sourceFiles = readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".png"));
const skuFileMap = new Map<number, string>();

for (const file of sourceFiles) {
  const match = file.match(/^(\d+)-/);
  if (!match) continue;
  const fileSku = parseInt(match[1], 10);
  if (!skus.has(fileSku)) continue;
  // Only take the base file (exact sku match, not variants like sku+1)
  if (!skuFileMap.has(fileSku)) {
    skuFileMap.set(fileSku, file);
  }
}

async function run() {
  let processed = 0;
  let missing = 0;
  const missingSkus: number[] = [];

  for (const sku of skus) {
    const sourceFile = skuFileMap.get(sku);
    if (!sourceFile) {
      missingSkus.push(sku);
      missing++;
      continue;
    }

    const sourcePath = join(SOURCE_DIR, sourceFile);
    const outPath = join(OUT_DIR, `${sku}.webp`);

    if (existsSync(outPath)) {
      processed++;
      continue;
    }

    try {
      await sharp(sourcePath).resize(800, 800, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 85 }).toFile(outPath);
      processed++;
      if (processed % 50 === 0) {
        console.log(`  Processed ${processed}/${skus.size}...`);
      }
    } catch (err) {
      console.error(`  ERROR processing ${sku} (${sourceFile}):`, err);
      missingSkus.push(sku);
      missing++;
    }
  }

  console.log(`\nDone! Processed: ${processed}, Missing: ${missing}`);
  if (missingSkus.length > 0) {
    console.log(`Missing SKUs: ${missingSkus.sort((a, b) => a - b).join(", ")}`);
  }
}

run();

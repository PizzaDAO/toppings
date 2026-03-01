import sharp from "sharp";
import { readFileSync, readdirSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const SOURCE_DIR =
  "C:\\Users\\samgo\\PizzaDAO Dropbox\\Dread Pizza Roberts\\pizza-oven-py\\ingredients-db";
const OUT_DIR = join(__dirname, "..", "public", "art");
const DATA_PATH = join(__dirname, "..", "src", "data", "toppings.json");

const toppings = JSON.parse(readFileSync(DATA_PATH, "utf-8"));
const skuSet = new Set<number>(toppings.map((t: { sku: number }) => t.sku));

const sourceFiles = readdirSync(SOURCE_DIR).filter((f) => f.toLowerCase().endsWith(".png"));

// Build map: base topping SKU -> list of all variant files
const variantMap = new Map<number, { fileSku: number; file: string }[]>();

for (const file of sourceFiles) {
  const match = file.match(/^(\d+)-(.+)\.png$/i);
  if (!match) continue;
  const fileSku = parseInt(match[1], 10);
  const name = match[2];

  // Check if this exact SKU is a known topping
  if (skuSet.has(fileSku)) {
    if (!variantMap.has(fileSku)) variantMap.set(fileSku, []);
    variantMap.get(fileSku)!.push({ fileSku, file });
    continue;
  }

  // Find the base SKU (look backwards up to 10 for same-name files)
  for (let base = fileSku - 1; base >= fileSku - 10; base--) {
    if (skuSet.has(base)) {
      const baseFiles = sourceFiles.filter((f) => f.startsWith(`${base}-`));
      if (baseFiles.length > 0) {
        const baseName = baseFiles[0].match(/^\d+-(.+)\.png$/i)?.[1];
        if (baseName === name) {
          if (!variantMap.has(base)) variantMap.set(base, []);
          variantMap.get(base)!.push({ fileSku, file });
          break;
        }
      }
    }
  }
}

async function run() {
  let processed = 0;
  let skipped = 0;
  let missing = 0;
  const missingSkus: number[] = [];

  for (const sku of skuSet) {
    const variants = variantMap.get(sku);
    if (!variants || variants.length === 0) {
      missingSkus.push(sku);
      missing++;
      continue;
    }

    // Sort variants by SKU
    variants.sort((a, b) => a.fileSku - b.fileSku);

    for (const variant of variants) {
      const sourcePath = join(SOURCE_DIR, variant.file);
      const outPath = join(OUT_DIR, `${variant.fileSku}.webp`);

      if (existsSync(outPath)) {
        skipped++;
        continue;
      }

      try {
        await sharp(sourcePath)
          .resize(800, 800, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .webp({ quality: 85 })
          .toFile(outPath);
        processed++;
        if (processed % 100 === 0) {
          console.log(`  Processed ${processed} new files...`);
        }
      } catch (err) {
        console.error(`  ERROR processing ${variant.fileSku} (${variant.file}):`, err);
      }
    }
  }

  // Write variant map as JSON for the import script to use
  const variantData: Record<number, number[]> = {};
  for (const [baseSku, variants] of variantMap) {
    const variantSkus = variants
      .map((v) => v.fileSku)
      .filter((s) => s !== baseSku)
      .sort((a, b) => a - b);
    if (variantSkus.length > 0) {
      variantData[baseSku] = variantSkus;
    }
  }
  const variantPath = join(__dirname, "variants.json");
  writeFileSync(variantPath, JSON.stringify(variantData, null, 2));

  console.log(`\nDone!`);
  console.log(`  New images processed: ${processed}`);
  console.log(`  Already existed (skipped): ${skipped}`);
  console.log(`  Missing source: ${missing}`);
  console.log(`  Variant map written to ${variantPath}`);
  if (missingSkus.length > 0) {
    console.log(`  Missing SKUs: ${missingSkus.sort((a, b) => a - b).join(", ")}`);
  }
}

run();

import { readFileSync, readdirSync } from 'fs';

const SOURCE_DIR = "C:\\Users\\samgo\\PizzaDAO Dropbox\\Dread Pizza Roberts\\pizza-oven-py\\ingredients-db";
const data = JSON.parse(readFileSync('src/data/toppings.json', 'utf-8'));
const skus = new Set(data.map(t => t.sku));

const files = readdirSync(SOURCE_DIR).filter(f => f.endsWith('.png'));

// Group files by base topping name (strip the leading digits)
const skuVariants = new Map();

for (const file of files) {
  const match = file.match(/^(\d+)-(.+)\.png$/);
  if (!match) continue;
  const fileSku = parseInt(match[1], 10);
  const name = match[2];

  // Find which topping SKU this belongs to
  // Variants use sequential SKUs: 2050, 2051, 2052 all belong to base 2050
  // Check if this exact SKU is a known topping
  if (skus.has(fileSku)) {
    if (!skuVariants.has(fileSku)) skuVariants.set(fileSku, []);
    skuVariants.get(fileSku).push({ file, sku: fileSku });
    continue;
  }

  // Otherwise find the closest base SKU below this one with the same name suffix
  for (let base = fileSku - 1; base >= fileSku - 10; base--) {
    if (skus.has(base)) {
      // Check if the name matches
      const baseFiles = files.filter(f => f.startsWith(`${base}-`));
      if (baseFiles.length > 0) {
        const baseName = baseFiles[0].match(/^\d+-(.+)\.png$/)?.[1];
        if (baseName === name) {
          if (!skuVariants.has(base)) skuVariants.set(base, []);
          skuVariants.get(base).push({ file, sku: fileSku });
          break;
        }
      }
    }
  }
}

// Report toppings with multiple variants
let multiVariant = 0;
let totalVariantFiles = 0;
const examples = [];

for (const [baseSku, variants] of [...skuVariants.entries()].sort((a, b) => a[0] - b[0])) {
  if (variants.length > 1) {
    multiVariant++;
    totalVariantFiles += variants.length;
    const topping = data.find(t => t.sku === baseSku);
    if (examples.length < 15) {
      examples.push({
        sku: baseSku,
        name: topping?.name,
        class: topping?.class,
        count: variants.length,
        files: variants.map(v => v.file),
      });
    }
  }
}

console.log(`Toppings with multiple variants: ${multiVariant}`);
console.log(`Total variant files: ${totalVariantFiles}`);
console.log(`\nExamples:`);
examples.forEach(e => {
  console.log(`\n  ${e.sku} "${e.name}" (${e.class}) - ${e.count} variants:`);
  e.files.forEach(f => console.log(`    ${f}`));
});

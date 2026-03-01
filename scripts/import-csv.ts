import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const INCLUDED_CLASSES = new Set([
  "Sauce",
  "Cheese",
  "Meat",
  "Snacks",
  "Fruit",
  "Peppers",
  "Fungi",
  "Nuts",
  "Vegetable",
  "Seafood",
  "Bugs",
  "Flowers",
  "Herbs & Spices",
  "Eggs",
  "Space",
  "Drizzle",
  "Rare",
  "Crust",
]);

const csv = readFileSync(join(__dirname, "toppings.csv"), "utf-8");
const records = parse(csv, { columns: true, skip_empty_lines: true });

// Load variant map if it exists
const variantPath = join(__dirname, "variants.json");
const variantMap: Record<number, number[]> = existsSync(variantPath)
  ? JSON.parse(readFileSync(variantPath, "utf-8"))
  : {};

const NUTRITION_FIELDS = [
  "weight", "calories", "calories_from_fat", "trans_fat", "monosaturated_fat",
  "saturated_fat", "sodium", "cholesterol", "complex_carb", "dietary_fiber",
  "sugar", "added_sugars", "protein", "vitamin_a", "vitamin_b6", "vitamin_b12",
  "vitamin_c", "vitamin_e", "vitamin_k", "biotin", "folate", "calcium", "iron",
  "potassium", "riboflavin", "vitamin_d", "thiamin", "magnesium", "zinc",
];

// Non-artist toppings below the main 314 rows — exclude from import
const EXCLUDED_SKUS = new Set([3090, 6500, 7240, 9480, 9490, 9920]);

// Drizzle SKUs that should be merged as alt art into their Sauce counterparts
const DRIZZLE_MERGES: Record<number, number> = {
  9110: 2010, // Pesto Swirl -> Pesto
  9160: 2030, // BBQ Sauce (drizzle) -> BBQ Sauce (sauce)
};

interface AltArt {
  image: string;
  artist: string;
  label: string;
}

interface Topping {
  sku: number;
  class: string;
  name: string;
  description: string;
  artist: string;
  artistTwitter?: string;
  artistDiscord?: string;
  artistIG?: string;
  rarity: string;
  probability: number;
  image: string;
  variants: string[];
  altArt?: AltArt[];
  nutrition: Record<string, number | undefined>;
}

const toppings: Topping[] = [];
const drizzleMergeData = new Map<number, { name: string; artist: string; sku: number }>();

for (const row of records) {
  const sku = parseInt(row["sku"], 10);
  const cls = row["Class"]?.trim();
  const status = row["Status"]?.trim();
  const rarity = row["rarity"]?.trim()?.toLowerCase();

  if (isNaN(sku)) continue;
  if (!INCLUDED_CLASSES.has(cls)) continue;
  if (status !== "Accepted-DB") continue;
  const validRarities = ["common", "uncommon", "rare", "superrare", "epic", "grail"];
  if (!validRarities.includes(rarity)) continue;
  if (EXCLUDED_SKUS.has(sku)) continue;

  // If this is a drizzle that should be merged, save its data for later
  if (DRIZZLE_MERGES[sku]) {
    drizzleMergeData.set(sku, {
      name: row["Topping Name"]?.trim() || `Topping ${sku}`,
      artist: row["Artist"]?.trim() || "Unknown",
      sku,
    });
    continue; // Don't add as standalone topping
  }

  const nutrition: Record<string, number | undefined> = {};
  for (const field of NUTRITION_FIELDS) {
    const val = parseFloat(row[field]);
    if (!isNaN(val)) nutrition[field] = val;
  }

  const prob = parseFloat(row["probability"]);

  // Build variant image list
  const variantSkus = variantMap[sku] || [];
  const variants = variantSkus.map((vs: number) => `/art/${vs}.webp`);

  toppings.push({
    sku,
    class: cls,
    name: row["Topping Name"]?.trim() || `Topping ${sku}`,
    description: row["Topping Description (140 characters)"]?.trim() || "",
    artist: row["Artist"]?.trim() || "Unknown",
    artistTwitter: row["Twitter"]?.trim() || undefined,
    artistDiscord: row["Discord"]?.trim() || undefined,
    artistIG: row["IG"]?.trim() || undefined,
    rarity,
    probability: isNaN(prob) ? 0 : prob,
    image: `/art/${sku}.webp`,
    variants,
    nutrition,
  });
}

// Merge drizzle art into sauce toppings
for (const [drizzleSku, sauceSku] of Object.entries(DRIZZLE_MERGES)) {
  const drizzle = drizzleMergeData.get(Number(drizzleSku));
  const sauce = toppings.find((t) => t.sku === sauceSku);
  if (drizzle && sauce) {
    if (!sauce.altArt) sauce.altArt = [];
    // Add drizzle base image
    sauce.altArt.push({
      image: `/art/${drizzle.sku}.webp`,
      artist: drizzle.artist,
      label: `Drizzle version: ${drizzle.name}`,
    });
    // Add drizzle variants too
    const drizzleVariants = variantMap[drizzle.sku] || [];
    for (const vs of drizzleVariants) {
      sauce.altArt.push({
        image: `/art/${vs}.webp`,
        artist: drizzle.artist,
        label: `Drizzle variant`,
      });
    }
    console.log(`Merged drizzle "${drizzle.name}" (${drizzle.sku}) into sauce "${sauce.name}" (${sauce.sku})`);
  }
}

// Deduplicate by SKU (some spreadsheet rows are duplicated)
const seen = new Set<number>();
const deduped = toppings.filter((t) => {
  if (seen.has(t.sku)) return false;
  seen.add(t.sku);
  return true;
});
deduped.sort((a, b) => a.sku - b.sku);

const outPath = join(__dirname, "..", "src", "data", "toppings.json");
writeFileSync(outPath, JSON.stringify(deduped, null, 2));

console.log(`\nWrote ${deduped.length} toppings to ${outPath}`);

// Stats
const classCounts: Record<string, number> = {};
for (const t of deduped) classCounts[t.class] = (classCounts[t.class] || 0) + 1;
console.log("\nClass breakdown:");
for (const [cls, count] of Object.entries(classCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cls}: ${count}`);
}

const withVariants = deduped.filter((t) => t.variants.length > 0).length;
const totalVariants = deduped.reduce((sum, t) => sum + t.variants.length, 0);
console.log(`\nToppings with variants: ${withVariants}`);
console.log(`Total variant images: ${totalVariants}`);

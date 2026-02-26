import { parse } from "csv-parse/sync";
import { readFileSync, writeFileSync } from "fs";
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

const NUTRITION_FIELDS = [
  "weight",
  "calories",
  "calories_from_fat",
  "trans_fat",
  "monosaturated_fat",
  "saturated_fat",
  "sodium",
  "cholesterol",
  "complex_carb",
  "dietary_fiber",
  "sugar",
  "added_sugars",
  "protein",
  "vitamin_a",
  "vitamin_b6",
  "vitamin_b12",
  "vitamin_c",
  "vitamin_e",
  "vitamin_k",
  "biotin",
  "folate",
  "calcium",
  "iron",
  "potassium",
  "riboflavin",
  "vitamin_d",
  "thiamin",
  "magnesium",
  "zinc",
];

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
  nutrition: Record<string, number | undefined>;
}

const toppings: Topping[] = [];

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

  const nutrition: Record<string, number | undefined> = {};
  for (const field of NUTRITION_FIELDS) {
    const val = parseFloat(row[field]);
    if (!isNaN(val)) nutrition[field] = val;
  }

  const prob = parseFloat(row["probability"]);

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
    image: `/toppings/${sku}.webp`,
    nutrition,
  });
}

toppings.sort((a, b) => a.sku - b.sku);

const outPath = join(__dirname, "..", "src", "data", "toppings.json");
writeFileSync(outPath, JSON.stringify(toppings, null, 2));

console.log(`Wrote ${toppings.length} toppings to ${outPath}`);

// Print class breakdown
const classCounts: Record<string, number> = {};
for (const t of toppings) {
  classCounts[t.class] = (classCounts[t.class] || 0) + 1;
}
console.log("\nClass breakdown:");
for (const [cls, count] of Object.entries(classCounts).sort(
  (a, b) => b[1] - a[1]
)) {
  console.log(`  ${cls}: ${count}`);
}

// Print rarity breakdown
const rarityCounts: Record<string, number> = {};
for (const t of toppings) {
  rarityCounts[t.rarity] = (rarityCounts[t.rarity] || 0) + 1;
}
console.log("\nRarity breakdown:");
for (const [rarity, count] of Object.entries(rarityCounts).sort(
  (a, b) => b[1] - a[1]
)) {
  console.log(`  ${rarity}: ${count}`);
}

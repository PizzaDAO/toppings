import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('src/data/toppings.json', 'utf-8'));

const drizzles = data.filter(t => t.class === 'Drizzle');
console.log('=== Drizzle toppings ===');
drizzles.forEach(d => console.log(`  ${d.sku} "${d.name}" (${d.rarity})`));

const sauces = data.filter(t => t.class === 'Sauce');
console.log('\n=== Sauce toppings ===');
sauces.forEach(s => console.log(`  ${s.sku} "${s.name}" (${s.rarity})`));

console.log('\n=== Name overlap search ===');
const nonDrizzle = data.filter(t => t.class !== 'Drizzle');
for (const d of drizzles) {
  const words = d.name.toLowerCase().split(/\s+/);
  const matches = nonDrizzle.filter(t => {
    const tLower = t.name.toLowerCase();
    return words.some(w => w.length > 3 && tLower.includes(w));
  });
  if (matches.length > 0) {
    console.log(`\nDrizzle: "${d.name}" (${d.sku})`);
    matches.forEach(m => console.log(`  -> "${m.name}" (${m.sku}) in ${m.class}`));
  }
}

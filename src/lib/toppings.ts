import toppingsData from "@/data/toppings.json";
import type { Topping, ToppingClass, Rarity } from "./types";

const toppings = toppingsData as Topping[];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getAllToppings(): Topping[] {
  return toppings;
}

export function getToppingBySku(sku: number): Topping | undefined {
  return toppings.find((t) => t.sku === sku);
}

export function getToppingsByClass(className: string): Topping[] {
  return toppings.filter((t) => t.class === className);
}

export function getClasses(): ToppingClass[] {
  const classMap = new Map<string, Topping[]>();

  for (const t of toppings) {
    const existing = classMap.get(t.class);
    if (existing) {
      existing.push(t);
    } else {
      classMap.set(t.class, [t]);
    }
  }

  const classes: ToppingClass[] = [];

  for (const [name, items] of classMap) {
    classes.push({
      name,
      slug: slugify(name),
      count: items.length,
      sampleImages: items.slice(0, 4).map((t) => t.image),
    });
  }

  return classes;
}

export function getToppingClasses(): ToppingClass[] {
  return getClasses().filter((c) => c.name !== "Crust");
}

export function getCrustClass(): ToppingClass | undefined {
  return getClasses().find((c) => c.name === "Crust");
}

export function getClassBySlug(slug: string): string | undefined {
  const classes = getClasses();
  const found = classes.find((c) => c.slug === slug);
  return found?.name;
}

export function getRarities(): Rarity[] {
  const seen = new Set<Rarity>();
  for (const t of toppings) {
    seen.add(t.rarity);
  }
  return Array.from(seen);
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Kitchen Chefs | Rare Pizzas Toppings",
  description:
    "Meet the chefs behind the Rare Pizzas kitchen — Head Chef Shrimp, Oven Chef Don Volare, Toppings Chefs Cactus, Oscar Frog, Pizza Slyce, and Don Fingas, and Sous Chef Jalapeno Peppers.",
};

const chefs = [
  {
    title: "Head Chef",
    name: "Shrimp",
  },
  {
    title: "Oven Chef",
    name: "Don Volare",
  },
  {
    title: "Toppings Chef",
    name: "Cactus",
  },
  {
    title: "Toppings Chef",
    name: "Oscar Frog",
  },
  {
    title: "Toppings Chef",
    name: "Pizza Slyce",
  },
  {
    title: "Toppings Chef",
    name: "Don Fingas",
  },
  {
    title: "Sous Chef",
    name: "Jalapeno Peppers",
  },
];

export default function ChefsPage() {
  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          The Kitchen
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#d4c5a9]">
          Meet the chefs who run the Rare Pizzas kitchen.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {chefs.map((chef) => (
          <div
            key={chef.name}
            className="rounded-xl border border-[#5c4033]/50 bg-[#3d2b1f] p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#5c4033] text-4xl">
              {chef.name[0]}
            </div>
            <p className="text-sm font-medium uppercase tracking-wider text-[#F97316]">
              {chef.title}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">{chef.name}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}

import { getAllToppings, getClasses } from "@/lib/toppings";
import ClassCard from "@/components/ClassCard";

export default function Home() {
  const toppings = getAllToppings();
  const classes = getClasses();

  return (
    <div>
      <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Rare Pizzas Toppings
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-[#a1a1aa]">
          Browse {toppings.length} unique toppings across {classes.length}{" "}
          classes. Each topping is a hand-crafted piece of digital art created by
          artists from around the world.
        </p>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold text-white">
          Topping Classes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classes.map((c) => (
            <ClassCard key={c.slug} toppingClass={c} />
          ))}
        </div>
      </section>
    </div>
  );
}

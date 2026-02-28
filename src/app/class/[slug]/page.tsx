import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getClasses,
  getClassBySlug,
  getToppingsByClass,
} from "@/lib/toppings";
import ClassToppingsGrid from "./ClassToppingsGrid";

interface ClassPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const classes = getClasses();
  return classes.map((c) => ({ slug: c.slug }));
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { slug } = await params;
  const className = getClassBySlug(slug);

  if (!className) {
    notFound();
  }

  const toppings = getToppingsByClass(className);

  return (
    <div>
      <nav className="mb-6 text-sm text-[#d4c5a9]">
        <Link href="/" className="transition-colors hover:text-[#F97316]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white">{className}</span>
      </nav>

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">{className}</h1>
        <p className="text-[#d4c5a9]">{toppings.length} toppings</p>
      </div>

      <ClassToppingsGrid toppings={toppings} />
    </div>
  );
}

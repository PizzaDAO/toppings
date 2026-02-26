interface NutritionLabelProps {
  nutrition: Record<string, number | undefined>;
  toppingName: string;
}

export default function NutritionLabel({
  nutrition,
  toppingName,
}: NutritionLabelProps) {
  const entries = Object.entries(nutrition).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (entries.length === 0) return null;

  return (
    <div className="w-full max-w-sm rounded border-2 border-black bg-white p-4 font-mono text-black">
      <h3 className="border-b-8 border-black pb-1 text-3xl font-extrabold">
        Nutrition Facts
      </h3>
      <div className="border-b border-black py-1 text-sm">
        Serving Size 1 slice
      </div>
      <div className="border-b-4 border-black py-1 text-sm font-bold">
        Amount Per Serving ({toppingName})
      </div>

      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between border-b border-black py-1 text-sm"
        >
          <span className="capitalize">{key.replace(/_/g, " ")}</span>
          <span className="font-bold">{value}</span>
        </div>
      ))}

      <div className="pt-2 text-xs text-gray-600">
        * Not a significant source of real nutrition information.
      </div>
    </div>
  );
}

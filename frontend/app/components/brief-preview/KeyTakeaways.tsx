interface KeyTakeawaysProps {
  takeaways?: string[];
}

export default function KeyTakeaways({
  takeaways = [
    "AI dominated today&apos;s technology news with major breakthrough announcements.",
    "Global markets ended higher following positive economic indicators.",
    "India announced new infrastructure projects worth billions.",
    "Climate discussions continued globally with renewed commitments.",
    "Sports delivered several major upsets in tournament play.",
    "Scientific advances in carbon capture showed promising results.",
  ],
}: KeyTakeawaysProps) {
  return (
    <div
      className="mb-12 rounded-2xl p-8 shadow-sm"
      style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}
    >
      {/* Heading */}
      <h2 className="text-2xl font-semibold mb-6" style={{ color: "#1E1E1E" }}>
        Key Takeaways
      </h2>

      {/* Bullet Points */}
      <ul className="space-y-3">
        {takeaways.map((takeaway, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-sm leading-relaxed"
            style={{ color: "#5B4C3A" }}
          >
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: "#8A6A3F" }}
            />
            {takeaway}
          </li>
        ))}
      </ul>
    </div>
  );
}

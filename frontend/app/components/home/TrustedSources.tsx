import { Reveal } from "@/app/components/motion/Reveal";

// Publishers that regularly turn up in Newsbit's feeds. The feeds carry close
// to a hundred sources with inconsistent names ("bbc.co.uk", "the-star.co.ke"),
// so this is a hand-picked list of recognisable ones rather than a live query.
const SOURCES = [
  "BBC",
  "Reuters",
  "The Guardian",
  "CNBC",
  "Los Angeles Times",
  "TechCrunch",
  "The Telegraph",
  "USA Today",
  "Hindustan Times",
  "NDTV",
  "The Indian Express",
  "Nature",
  "CBC",
  "The Irish Times",
  "Deadline",
  "IGN",
];

/**
 * A quiet band between the hero and Today's Brief: one line of copy, then the
 * source names sliding past. The list is rendered twice so translating the
 * track by -50% loops without a seam, and each name carries its own trailing
 * padding (rather than the track using `gap`) so both halves are exactly the
 * same width.
 */
export default function TrustedSources() {
  return (
    <section
      aria-label="Trusted sources"
      className="border-y border-black/5 py-10 sm:py-12"
    >
      <Reveal>
        <p className="mb-6 sm:mb-8 px-4 text-center text-[13px] sm:text-sm text-gray-500">
          Built on the newsrooms the world already trusts.
        </p>

        <div
          className="overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
          }}
        >
          <ul className="flex w-max animate-sources-marquee">
            {[...SOURCES, ...SOURCES].map((source, index) => (
              <li
                key={index}
                aria-hidden={index >= SOURCES.length}
                className="shrink-0 pr-12 sm:pr-16 text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap text-gray-400 transition-colors duration-300 hover:text-gray-700 select-none"
              >
                {source}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}

import Link from "next/link";

const topStories = [
  {
    id: 1,
    source: "India Today",
    sourceWebsite: "https://www.indiatoday.in",
    headline: "How a bloodied Rahul Gandhi gave Congress the image it wanted",
    time: "6 hours ago",
    author: "By Abhishek De",
    image: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    source: "ICC",
    sourceWebsite: "https://www.icc-cricket.com",
    headline: "India trio close in on top ranking as England stars make gains",
    time: "4 hours ago",
    author: null,
    image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    source: "The Times of India",
    sourceWebsite: "https://timesofindia.indiatimes.com",
    headline: "Running on rollovers: Pakistan's reserves get $27 billion foreign loans from Saudi, China",
    time: "1 hour ago",
    author: null,
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    source: "Bar and Bench",
    sourceWebsite: "https://www.barandbench.com",
    headline: "Supreme Court refuses to stay Speaker Om Birla's decision to clear Uddhav Sena MPs' merger with Shinde Sena",
    time: "6 hours ago",
    author: "By Ritwik Choudhury",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    source: "blog.google",
    sourceWebsite: "https://blog.google",
    headline: "Introducing Gemini 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash Cyber",
    time: "21 hours ago",
    author: "By Tulsee Doshi",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    source: "Al Jazeera",
    sourceWebsite: "https://www.aljazeera.com",
    headline: "India protest: How Modi's refusal to sack education minister fits a pattern",
    time: "8 hours ago",
    author: null,
    image: "https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=400&h=300&fit=crop",
  },
];

function getSourceLogoUrl(sourceWebsite: string) {
  return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(sourceWebsite)}&sz=64`;
}

export default function TodaysTopStories() {
  return (
    <section className="py-12">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-[30px] font-semibold text-gray-900 mb-4">
          Top Stories
        </h2>
        <p className="text-[16px] text-gray-600">
          AI-selected stories worth your attention today.
        </p>
      </div>

      {/* Stories Grid - 2 columns with 3 items each */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6">
          {topStories.slice(0, 3).map((story, index) => (
            <div key={story.id} className={`${index !== 2 ? 'pb-6 border-b border-gray-100 mb-6' : ''}`}>
              <div className="flex gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Source */}
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <img
                      src={getSourceLogoUrl(story.sourceWebsite)}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    {story.source}
                  </p>

                  {/* Headline */}
                  <Link href="/brief" className="block">
                    <h3 className="text-[16px] font-medium text-gray-900 mb-2 line-clamp-2 hover:underline decoration-gray-300 underline-offset-2 transition-colors">
                      {story.headline}
                    </h3>
                  </Link>

                  {/* Time and Author */}
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <span>{story.time}</span>
                    {story.author && <span>• {story.author}</span>}
                  </div>
                </div>

                {/* Image */}
                <div className="flex w-32 flex-shrink-0 flex-col gap-2">
                  <img
                    src={story.image}
                    alt={story.headline}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <Link
                    href="/brief"
                    className="flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 10 5 5-5 5" />
                      <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                    </svg>
                    <span className="text-xs font-medium whitespace-nowrap">
                      See more
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-6">
          {topStories.slice(3, 6).map((story, index) => (
            <div key={story.id} className={`${index !== 2 ? 'pb-6 border-b border-gray-100 mb-6' : ''}`}>
              <div className="flex gap-4">
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Source */}
                  <p className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-900">
                    <img
                      src={getSourceLogoUrl(story.sourceWebsite)}
                      alt=""
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    {story.source}
                  </p>

                  {/* Headline */}
                  <Link href="/brief" className="block">
                    <h3 className="text-[16px] font-medium text-gray-900 mb-2 line-clamp-2 hover:underline decoration-gray-300 underline-offset-2 transition-colors">
                      {story.headline}
                    </h3>
                  </Link>

                  {/* Time and Author */}
                  <div className="flex items-center gap-2 text-[12px] text-gray-500">
                    <span>{story.time}</span>
                    {story.author && <span>• {story.author}</span>}
                  </div>
                </div>

                {/* Image */}
                <div className="flex w-32 flex-shrink-0 flex-col gap-2">
                  <img
                    src={story.image}
                    alt={story.headline}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  <Link
                    href="/brief"
                    className="flex items-center justify-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 10 5 5-5 5" />
                      <path d="M4 4v7a4 4 0 0 0 4 4h12" />
                    </svg>
                    <span className="text-xs font-medium whitespace-nowrap">
                      See more
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

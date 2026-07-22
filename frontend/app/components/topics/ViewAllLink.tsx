import Link from "next/link";

interface ViewAllLinkProps {
  topicId: string;
  topicName: string;
}

export default function ViewAllLink({ topicId, topicName }: ViewAllLinkProps) {
  return (
    <Link
      href={`/explore/${topicId}`}
      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors focus:outline-none rounded"
    >
      View All
      <svg
        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}

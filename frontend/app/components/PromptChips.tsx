const prompt = [
  "Top 10 today's news summary",
  "Latest AI news",
  "Business headlines today",
];

type PromptChipsProps = {
  onSelectPrompt: (prompt: string) => void;
};

export default function PromptChips({ onSelectPrompt }: PromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 sm:mb-10 px-2 sm:px-4 justify-center">
      {prompt.map((prompt) => (
        <button
          key={prompt}
          onClick={() => {
            onSelectPrompt(prompt);
          }}
          className="rounded-2xl border shadow border-gray-300 px-3 sm:px-4 py-2 text-xs sm:text-sm transition hover:bg-gray-100 flex flex-col"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

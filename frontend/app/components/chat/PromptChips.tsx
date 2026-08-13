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
    <div className="flex flex-wrap gap-3 justify-center">
      {prompt.map((prompt) => (
        <button
          key={prompt}
          onClick={() => {
            onSelectPrompt(prompt);
          }}
          className="group rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:bg-gray-100 hover:shadow-md"
        >
          <span className="font-medium">{prompt}</span>
        </button>
      ))}
    </div>
  );
}

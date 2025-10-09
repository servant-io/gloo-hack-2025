import { MessageCircle, Lightbulb } from 'lucide-react';

interface PromptSuggestionsProps {
  onPromptClick: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptSuggestions({
  onPromptClick,
  disabled,
}: PromptSuggestionsProps) {
  const prompts = [
    {
      icon: Lightbulb,
      title: 'Help me dive deeper',
      description: 'Explore the theological depth and biblical context',
      prompt: 'Help me dive deeper into this content',
    },
    {
      icon: MessageCircle,
      title: 'Help me apply this',
      description: 'Discover practical applications for daily life',
      prompt: 'Help me apply this to my life',
    },
  ];

  return (
    <div className="space-y-3">
      {prompts.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onPromptClick(prompt.prompt)}
          disabled={disabled}
          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
            disabled
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
              : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg ${disabled ? 'bg-gray-200' : 'bg-blue-100'}`}
            >
              <prompt.icon
                className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-blue-600'}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold mb-1 ${disabled ? 'text-gray-500' : 'text-gray-900'}`}
              >
                {prompt.title}
              </h3>
              <p
                className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {prompt.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

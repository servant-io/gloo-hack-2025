import { MessageCircle, Lightbulb, Check } from 'lucide-react';

interface PromptSuggestionsProps {
  onPromptClick: (intent: 'dive-deeper' | 'apply') => void;
  disabled?: boolean;
  completedIntents: Set<'dive-deeper' | 'apply'>;
}

export function PromptSuggestions({
  onPromptClick,
  disabled,
  completedIntents,
}: PromptSuggestionsProps) {
  const prompts: Array<{
    icon: typeof Lightbulb;
    title: string;
    description: string;
    intent: 'dive-deeper' | 'apply';
  }> = [
    {
      icon: Lightbulb,
      title: 'Help me dive deeper',
      description: 'Explore the theological depth and biblical context',
      intent: 'dive-deeper',
    },
    {
      icon: MessageCircle,
      title: 'Help me apply this',
      description: 'Discover practical applications for daily life',
      intent: 'apply',
    },
  ];

  return (
    <div className="space-y-3">
      {prompts.map((prompt) => {
        const isCompleted = completedIntents.has(prompt.intent);
        const isDisabled = disabled || isCompleted;

        return (
          <button
            key={prompt.intent}
            onClick={() => !isDisabled && onPromptClick(prompt.intent)}
            disabled={isDisabled}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative ${
              isCompleted
                ? 'bg-green-50 border-green-200 cursor-default'
                : isDisabled
                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
            }`}
          >
            {isCompleted && (
              <div className="absolute top-2 right-2">
                <div className="bg-green-500 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  isCompleted
                    ? 'bg-green-100'
                    : isDisabled
                      ? 'bg-gray-200'
                      : 'bg-blue-100'
                }`}
              >
                <prompt.icon
                  className={`w-5 h-5 ${
                    isCompleted
                      ? 'text-green-600'
                      : isDisabled
                        ? 'text-gray-400'
                        : 'text-blue-600'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-semibold mb-1 ${
                    isCompleted
                      ? 'text-green-900'
                      : isDisabled
                        ? 'text-gray-500'
                        : 'text-gray-900'
                  }`}
                >
                  {prompt.title}
                </h3>
                <p
                  className={`text-sm ${
                    isCompleted
                      ? 'text-green-700'
                      : isDisabled
                        ? 'text-gray-400'
                        : 'text-gray-600'
                  }`}
                >
                  {prompt.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

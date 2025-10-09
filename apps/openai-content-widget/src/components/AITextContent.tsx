import { AIContentSections } from '../types/ai-widget';
import { Sparkles, BookOpen, Link2 } from 'lucide-react';
import { parseSimpleMarkdown } from '../utils/markdown';

interface AITextContentProps {
  content: AIContentSections | null;
  loading: boolean;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-6 w-32 bg-gray-300 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>

      <div>
        <div className="h-6 w-32 bg-gray-300 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      <div>
        <div className="h-6 w-32 bg-gray-300 rounded mb-3"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

export function AITextContent({ content, loading }: AITextContentProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <p className="text-gray-500 text-center">No content available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Overview</h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-[15px]">
          {content.overview}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Key Themes</h2>
        </div>
        <div className="text-gray-700 leading-relaxed text-[15px] space-y-3">
          {content.keyThemes.split('\n\n').map((theme, index) => (
            <p key={index} className="whitespace-pre-wrap">
              {parseSimpleMarkdown(theme)}
            </p>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">How This Relates</h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-[15px]">
          {content.relevance}
        </p>
      </div>
    </div>
  );
}

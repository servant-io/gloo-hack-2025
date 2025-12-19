import {
  X,
  BookmarkPlus,
  Lock,
  Clock,
  Sparkles,
  Link2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { VideoContent } from '../hooks/useVideoData';
import { formatDuration } from '../utils/dataTransform';
import { PromptSuggestions } from './PromptSuggestions';
import {
  generateVideoContext,
  generateFollowUpContent,
} from '../services/glooAI';
import { useState, useEffect } from 'react';
import { parseSimpleMarkdown } from '../utils/markdown';

interface AIResponse {
  type: 'original' | 'dive-deeper' | 'apply';
  overview: string;
  relevance: string;
}

interface ExpandedPreviewCardProps {
  video: VideoContent;
  isBookmarked: boolean;
  hasCredits: boolean;
  onClose: () => void;
  onWatchNow: () => void;
  onToggleBookmark: () => void;
}

export function ExpandedPreviewCard({
  video,
  isBookmarked,
  hasCredits,
  onClose,
  onWatchNow,
  onToggleBookmark,
}: ExpandedPreviewCardProps) {
  const [responseHistory, setResponseHistory] = useState<AIResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [isLoadingFollowUp, setIsLoadingFollowUp] = useState(false);
  const [completedIntents, setCompletedIntents] = useState<
    Set<'dive-deeper' | 'apply'>
  >(new Set());

  // Load initial AI content
  useEffect(() => {
    let mounted = true;
    let loading = false;

    async function loadAIContent() {
      if (loading) return;

      loading = true;
      setIsLoadingAI(true);

      try {
        const content = await generateVideoContext({
          title: video.name,
          description: video.shortDescription,
        });
        if (mounted) {
          setResponseHistory([
            {
              type: 'original',
              overview: content.overview,
              relevance: content.relevance,
            },
          ]);
          setCurrentIndex(0);
        }
      } catch (error) {
        console.error('Failed to load AI content:', error);
      } finally {
        if (mounted) {
          setIsLoadingAI(false);
        }
        loading = false;
      }
    }

    loadAIContent();

    return () => {
      mounted = false;
    };
  }, [video.name, video.shortDescription]);

  const handlePromptClick = async (intent: 'dive-deeper' | 'apply') => {
    if (
      completedIntents.has(intent) ||
      isLoadingFollowUp ||
      !responseHistory[0]
    )
      return;

    setIsLoadingFollowUp(true);

    try {
      const originalOverview = responseHistory[0].overview;
      const followUpContent = await generateFollowUpContent(
        {
          title: video.name,
          description: video.shortDescription,
        },
        originalOverview,
        intent
      );

      // Add new response to history
      const newResponse: AIResponse = {
        type: intent,
        overview: followUpContent,
        relevance: responseHistory[0].relevance, // Keep original relevance
      };

      setResponseHistory((prev) => [...prev, newResponse]);
      setCurrentIndex(responseHistory.length); // Navigate to new response
      setCompletedIntents((prev) => new Set([...prev, intent]));
    } catch (error) {
      console.error('Failed to load follow-up content:', error);
    } finally {
      setIsLoadingFollowUp(false);
    }
  };

  const canNavigateBack = currentIndex > 0;
  const canNavigateForward = currentIndex < responseHistory.length - 1;

  const currentResponse = responseHistory[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Video Player */}
          <div className="relative w-full aspect-video bg-gray-900 rounded-t-2xl overflow-hidden">
            <video
              src={video.mediaUrl}
              poster={video.thumbnailUrl}
              controls
              className="w-full h-full"
            >
              Your browser does not support the video tag.
            </video>

            {/* Premium Badge */}
            {video.isPremium && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-500 rounded-full text-white text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Premium Content
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header Section */}
            <div className="mb-6">
              {/* Series Title */}
              {video.seriesTitle && (
                <div className="text-sm font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                  {video.seriesTitle}
                </div>
              )}

              {/* Video Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {video.name}
              </h2>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed mb-4">
                {video.shortDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onWatchNow}
                  disabled={video.isPremium && !hasCredits}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    video.isPremium && !hasCredits
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  Watch now
                </button>
                <button
                  onClick={onToggleBookmark}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isBookmarked
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <BookmarkPlus className="w-5 h-5" />
                  {isBookmarked ? 'Saved' : 'Save'}
                </button>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {formatDuration(video.durationSeconds)}
                </div>
              </div>

              {/* Credit Warning */}
              {video.isPremium && !hasCredits && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>No credits remaining.</strong> Premium content
                    requires 1 credit to watch.
                  </p>
                </div>
              )}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 border-t border-gray-200 pt-6">
              {/* Left Column: AI-Generated Content */}
              <div className="space-y-6">
                {/* Navigation Controls */}
                {responseHistory.length > 1 && !isLoadingAI && (
                  <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <button
                      onClick={() => setCurrentIndex((i) => i - 1)}
                      disabled={!canNavigateBack}
                      className={`p-2 rounded-lg transition-colors ${
                        canNavigateBack
                          ? 'hover:bg-gray-100 text-gray-700'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      aria-label="Previous response"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="text-sm text-gray-600 font-medium">
                      {currentResponse?.type === 'original' && 'Overview'}
                      {currentResponse?.type === 'dive-deeper' && 'Deep Dive'}
                      {currentResponse?.type === 'apply' && 'Apply to Life'}
                    </div>

                    <button
                      onClick={() => setCurrentIndex((i) => i + 1)}
                      disabled={!canNavigateForward}
                      className={`p-2 rounded-lg transition-colors ${
                        canNavigateForward
                          ? 'hover:bg-gray-100 text-gray-700'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      aria-label="Next response"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {isLoadingAI || isLoadingFollowUp ? (
                  <div className="space-y-6 animate-pulse">
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
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                ) : currentResponse ? (
                  <div key={currentIndex} className="space-y-6 animate-fade-in">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">
                          {currentResponse.type === 'original' && 'Overview'}
                          {currentResponse.type === 'dive-deeper' &&
                            'Deep Dive'}
                          {currentResponse.type === 'apply' && 'Apply to Life'}
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[15px]">
                        {parseSimpleMarkdown(currentResponse.overview)}
                      </p>
                    </div>

                    {currentResponse.type === 'original' && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Link2 className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">
                            How This Relates
                          </h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-[15px]">
                          {parseSimpleMarkdown(currentResponse.relevance)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Unable to load AI-generated content
                  </p>
                )}
              </div>

              {/* Right Column: Prompt Suggestions */}
              <div className="lg:border-l lg:border-gray-200 lg:pl-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Explore Further
                </h3>
                <PromptSuggestions
                  onPromptClick={handlePromptClick}
                  disabled={isLoadingAI || isLoadingFollowUp}
                  completedIntents={completedIntents}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

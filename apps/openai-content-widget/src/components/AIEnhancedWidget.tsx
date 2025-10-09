import { useState } from 'react';
import { useAIWidget } from '../hooks/useAIWidget';
import { useCredits } from '../hooks/useCredits';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { AITextContent } from './AITextContent';
import { VideoCarousel } from './VideoCarousel';
import { ExpandedPreviewCard } from './ExpandedPreviewCard';
import { CreditsIndicator } from './CreditsIndicator';
import { VideoContent } from '../hooks/useVideoData';
import { Loader2 } from 'lucide-react';

interface AIEnhancedWidgetProps {
  theme?: string;
  userQuery?: string;
  conversationContext?: string;
}

export function AIEnhancedWidget({
  theme = 'Luke-Acts',
  userQuery = 'Tell me about Luke-Acts',
  conversationContext,
}: AIEnhancedWidgetProps) {
  const {
    videos,
    aiContent,
    loading: widgetLoading,
    error,
  } = useAIWidget(theme, userQuery, conversationContext);
  const {
    creditsRemaining,
    loading: creditsLoading,
    deductCredit,
    hasCredits,
  } = useCredits();
  const { bookmarks, isBookmarked, toggleBookmark } = useStudyPlan();
  const [selectedVideo, setSelectedVideo] = useState<VideoContent | null>(null);

  const handleWatchNow = async () => {
    if (!selectedVideo) return;

    if (selectedVideo.isPremium) {
      const success = await deductCredit(selectedVideo.id);
      if (success) {
        window.open(selectedVideo.mediaUrl, '_blank');
        setSelectedVideo(null);
      }
    } else {
      window.open(selectedVideo.mediaUrl, '_blank');
      setSelectedVideo(null);
    }
  };

  const handleToggleBookmarkExpanded = () => {
    if (selectedVideo) {
      toggleBookmark(selectedVideo.id);
    }
  };

  if (widgetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Content
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {theme}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Exploring the connected story
            </p>
          </div>
          <CreditsIndicator
            creditsRemaining={creditsRemaining}
            loading={creditsLoading}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <AITextContent content={aiContent} loading={widgetLoading} />
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <VideoCarousel
              videos={videos}
              title="Videos"
              bookmarkedIds={bookmarks}
              onSelectVideo={setSelectedVideo}
              onToggleBookmark={toggleBookmark}
            />
          </div>
        </div>
      </main>

      {selectedVideo && (
        <ExpandedPreviewCard
          video={selectedVideo}
          isBookmarked={isBookmarked(selectedVideo.id)}
          hasCredits={hasCredits}
          onClose={() => setSelectedVideo(null)}
          onWatchNow={handleWatchNow}
          onToggleBookmark={handleToggleBookmarkExpanded}
        />
      )}
    </div>
  );
}

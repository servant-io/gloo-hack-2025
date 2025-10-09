import { useState } from 'react';
import { useVideoData, VideoContent } from '../hooks/useVideoData';
import { useCredits } from '../hooks/useCredits';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { CreditsIndicator } from './CreditsIndicator';
import { SeriesGroup } from './SeriesGroup';
import { ExpandedPreviewCard } from './ExpandedPreviewCard';
import { Loader2 } from 'lucide-react';

export function ScriptureJourneyTimeline() {
  const { seriesGroups, loading: videosLoading } = useVideoData();
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
        // Open video in new tab
        window.open(selectedVideo.mediaUrl, '_blank');
        setSelectedVideo(null);
      }
    } else {
      // Free content - just open
      window.open(selectedVideo.mediaUrl, '_blank');
      setSelectedVideo(null);
    }
  };

  const handleToggleBookmarkExpanded = () => {
    if (selectedVideo) {
      toggleBookmark(selectedVideo.id);
    }
  };

  if (videosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Loading Scripture Journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Scripture Journey
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Explore biblical content through time
            </p>
          </div>

          <CreditsIndicator
            creditsRemaining={creditsRemaining}
            loading={creditsLoading}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        {seriesGroups.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600">No content available yet.</p>
          </div>
        ) : (
          seriesGroups.map((group) => (
            <SeriesGroup
              key={group.seriesTitle}
              seriesTitle={group.seriesTitle}
              videos={group.videos}
              bookmarkedIds={bookmarks}
              onSelectVideo={setSelectedVideo}
              onToggleBookmark={toggleBookmark}
            />
          ))
        )}
      </main>

      {/* Expanded Preview Modal */}
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

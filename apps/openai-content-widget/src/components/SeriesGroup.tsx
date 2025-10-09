import { VideoContent } from '../hooks/useVideoData';
import { TimelineNode } from './TimelineNode';

interface SeriesGroupProps {
  seriesTitle: string;
  videos: VideoContent[];
  bookmarkedIds: Set<string>;
  onSelectVideo: (video: VideoContent) => void;
  onToggleBookmark: (videoId: string) => void;
}

export function SeriesGroup({
  seriesTitle,
  videos,
  bookmarkedIds,
  onSelectVideo,
  onToggleBookmark,
}: SeriesGroupProps) {
  return (
    <div className="mb-12">
      {/* Series Header */}
      <div className="mb-4 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{seriesTitle}</h2>
        <p className="text-sm text-gray-600">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Video Timeline */}
      <div className="relative">
        {/* Horizontal Scroll Container */}
        <div className="flex gap-6 overflow-x-auto pb-4 px-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
          {videos.map((video) => (
            <div key={video.id} className="snap-start">
              <TimelineNode
                video={video}
                isBookmarked={bookmarkedIds.has(video.id)}
                onSelect={onSelectVideo}
                onToggleBookmark={onToggleBookmark}
              />
            </div>
          ))}
        </div>

        {/* Gradient Fade Effects */}
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}

import { VideoContent } from '../hooks/useVideoData';
import { TimelineNode } from './TimelineNode';

interface VideoCarouselProps {
  videos: VideoContent[];
  title: string;
  bookmarkedIds: Set<string>;
  onSelectVideo: (video: VideoContent) => void;
  onToggleBookmark: (videoId: string) => void;
}

export function VideoCarousel({
  videos,
  title,
  bookmarkedIds,
  onSelectVideo,
  onToggleBookmark,
}: VideoCarouselProps) {
  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-500 text-center py-8">No videos available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-600">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
          {videos.map((video) => (
            <div key={video.id} className="snap-start flex-shrink-0">
              <TimelineNode
                video={video}
                isBookmarked={bookmarkedIds.has(video.id)}
                onSelect={onSelectVideo}
                onToggleBookmark={onToggleBookmark}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-gray-50 to-transparent pointer-events-none rounded-l-xl" />
        <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white to-transparent pointer-events-none rounded-r-xl" />
      </div>
    </div>
  );
}

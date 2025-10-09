import { Lock, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { VideoContent } from '../hooks/useVideoData';
import { formatDuration } from '../utils/dataTransform';

interface TimelineNodeProps {
  video: VideoContent;
  isBookmarked: boolean;
  onSelect: (video: VideoContent) => void;
  onToggleBookmark: (videoId: string) => void;
}

export function TimelineNode({
  video,
  isBookmarked,
  onSelect,
  onToggleBookmark,
}: TimelineNodeProps) {
  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(video.id);
  };

  return (
    <div
      onClick={() => onSelect(video)}
      className="group relative flex-shrink-0 w-80 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 hover:border-blue-300"
    >
      {/* Thumbnail */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <img
          src={video.thumbnailUrl}
          alt={video.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-white text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.durationSeconds)}
        </div>

        {/* Premium Badge */}
        {video.isPremium && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 rounded-full text-white text-xs font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Premium
          </div>
        )}

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className="absolute top-2 left-2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-md"
          aria-label={
            isBookmarked ? 'Remove from study plan' : 'Add to study plan'
          }
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-blue-600" />
          ) : (
            <Bookmark className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Series Title */}
        {video.seriesTitle && (
          <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
            {video.seriesTitle}
          </div>
        )}

        {/* Video Title */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {video.shortDescription}
        </p>

        {/* Status Indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${video.isPremium ? 'bg-amber-500' : 'bg-green-500'}`}
          />
          <span className="text-xs text-gray-500">
            {video.isPremium ? '1 Credit' : 'Free'}
          </span>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import type { ContentItemWithPublisher } from '@/lib/content/types';
import {
  ArticleIcon,
  VideoIcon,
  HeadphonesIcon,
  QuestionIcon,
} from '@phosphor-icons/react';

interface ContentGridProps {
  content: ContentItemWithPublisher[];
}

const getTypeIcon = (type: ContentItemWithPublisher['type']) => {
  switch (type) {
    case 'article':
      return <ArticleIcon size={24} weight="fill" className="text-blue-600" />;
    case 'video':
      return <VideoIcon size={24} weight="fill" className="text-red-600" />;
    case 'audio':
      return (
        <HeadphonesIcon size={24} weight="fill" className="text-green-600" />
      );
    default:
      return <QuestionIcon size={24} weight="fill" className="text-gray-600" />;
  }
};

export function ContentGrid({ content }: ContentGridProps) {
  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No content available</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {content.map((item) => (
        <Link
          key={item.id}
          href={`/content/${item.id}`}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {getTypeIcon(item.type)}
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded capitalize">
                  {item.type}
                </span>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {item.publisher.name}
              </span>
            </div>

            {item.thumbnailUrl ? (
              <Image
                src={item.thumbnailUrl}
                alt={item.name || 'Item thumbnail'}
                width={300}
                height={200}
                className="w-full h-40 object-cover rounded mb-4"
              />
            ) : null}

            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {item.name}
            </h3>

            <p className="text-gray-600 text-sm line-clamp-3">
              {item.shortDescription}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

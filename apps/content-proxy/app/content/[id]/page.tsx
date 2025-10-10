'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArticleIcon,
  VideoIcon,
  HeadphonesIcon,
  QuestionIcon,
} from '@phosphor-icons/react';
import type { ContentItemWithPublisher } from '@/lib/content/types';
import { emitViewedContentEvent } from '@/lib/personalization/actions';
import {
  getProfileIdFromCookie,
  getCurrentUrl,
} from '@/lib/personalization/client-utils';

export default function ContentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [content, setContent] = useState<ContentItemWithPublisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const eventEmittedRef = useRef(false);

  // Emit viewed content event once per page load
  useEffect(() => {
    if (eventEmittedRef.current || !id) return;

    const emitEvent = async () => {
      try {
        const profileId = getProfileIdFromCookie();
        if (!profileId) {
          console.warn(
            'No profile ID found in cookie, skipping event emission'
          );
          return;
        }

        await emitViewedContentEvent(profileId, {
          contentItemId: id,
          url: getCurrentUrl(),
          searchTerm: '', // Leave blank for now as requested
        });
        eventEmittedRef.current = true;
      } catch (error) {
        console.error('Failed to emit viewed content event:', error);
      }
    };

    emitEvent();
  }, [id]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Content not found');
          }
          throw new Error('Failed to fetch content');
        }
        const data = await response.json();
        // API returns an array, but we expect a single item for this page
        if (Array.isArray(data) && data.length > 0) {
          setContent(data[0]);
        } else {
          throw new Error('Content not found');
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchContent();
    }
  }, [id]);

  const getTypeIcon = (type: ContentItemWithPublisher['type']) => {
    switch (type) {
      case 'article':
        return (
          <ArticleIcon size={32} weight="fill" className="text-blue-600" />
        );
      case 'video':
        return <VideoIcon size={32} weight="fill" className="text-red-600" />;
      case 'audio':
        return (
          <HeadphonesIcon size={32} weight="fill" className="text-green-600" />
        );
      default:
        return (
          <QuestionIcon size={32} weight="fill" className="text-gray-600" />
        );
    }
  };

  const getTypeLabel = (type: ContentItemWithPublisher['type']) => {
    switch (type) {
      case 'article':
        return 'Article';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio';
      default:
        return 'Content';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/content"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← Back to Content Library
          </Link>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/content"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← Back to Content Library
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try Again
              </button>
              <Link
                href="/content"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              >
                Back to Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/content"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            ← Back to Content Library
          </Link>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Content not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Navigation */}
        <Link
          href="/content"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Content Library
        </Link>

        {/* Content Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getTypeIcon(content.type)}
              <div>
                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                  {getTypeLabel(content.type)}
                </span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {content.name}
          </h1>

          <p className="text-lg text-gray-600 mb-6">
            {content.shortDescription}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>ID: {content.id}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
              {content.publisher.name}
            </span>
          </div>
        </div>

        {/* Content Preview */}
        {content.thumbnailUrl ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <Image
              src={content.thumbnailUrl}
              alt={content.name || 'Content Thumbnail'}
              width={300}
              height={200}
              className="w-full h-64 object-cover"
            />
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Access Content
          </h2>
          <p className="text-gray-600 mb-4">
            This {content.type} is available at the following URL:
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={content.contentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open {getTypeLabel(content.type)}
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(content.contentUrl)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Copy URL
            </button>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
            <code className="text-gray-700 break-all">
              {content.contentUrl}
            </code>
          </div>
        </div>

        {/* Content Metadata */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Content Information
            </h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900 capitalize">
                  {content.type}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {content.id}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/content"
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                Browse More Content
              </Link>
              <button
                onClick={() => window.print()}
                className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                Print This Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

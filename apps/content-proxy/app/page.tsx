'use client';

import { useInfiniteScroll } from '@/app/content/hooks/useInfiniteScroll';
import { useSearch } from '@/app/content/hooks/useSearch';
import { ContentGrid } from '@/app/content/components/ContentGrid';
import { SearchBar } from '@/app/content/components/SearchBar';
import { LoadingState } from '@/app/content/components/LoadingState';
import { ErrorState } from '@/app/content/components/ErrorState';

export default function ContentListPage() {
  /**
   * @todo fix bug infinite scroll is not yet working
   */
  const {
    content,
    loading,
    loadingMore,
    error,
    hasMore,
    totalItems,
    loadMoreRef,
    refetch,
  } = useInfiniteScroll();

  const {
    searchTerm,
    searchResults,
    isSearching,
    isDebouncing,
    error: searchError,
    handleSearchInput,
    clearSearch,
  } = useSearch();

  // Determine which content to display
  const displayContent = searchTerm ? searchResults : content;
  const displayError = error || searchError;

  // Show loading state for initial load
  if (loading) {
    return <LoadingState type="initial" />;
  }

  // Show error state if there's an error
  if (displayError) {
    return <ErrorState error={displayError} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <div className="text-sm text-gray-600">
            {searchTerm ? (
              <span>
                {`Showing ${searchResults.length} of ${content.length} results for "${searchTerm}"`}
              </span>
            ) : (
              <span>
                Loaded {content.length} of {totalItems} items
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchTerm={searchTerm}
          isSearching={isSearching}
          onSearchChange={handleSearchInput}
        />

        {/* Search Loading State */}
        {(isDebouncing || isSearching) && searchTerm && (
          <LoadingState type="search" />
        )}

        {/* No Results State */}
        {displayContent.length === 0 &&
          searchTerm &&
          !isDebouncing &&
          !isSearching && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {`No results found for "${searchTerm}"`}
              </p>
              <button
                onClick={clearSearch}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear search
              </button>
            </div>
          )}

        {/* Content Grid */}
        <ContentGrid content={displayContent} />

        {/* Infinite Scroll Trigger */}
        {!searchTerm && hasMore && (
          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center"
          >
            {loadingMore && <LoadingState type="more" />}
          </div>
        )}

        {/* End of Content Message */}
        {!searchTerm && !hasMore && content.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {`You've reached the end of the content`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

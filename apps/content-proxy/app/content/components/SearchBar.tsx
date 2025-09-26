interface SearchBarProps {
  searchTerm: string;
  isSearching: boolean;
  onSearchChange: (term: string) => void;
}

export function SearchBar({
  searchTerm,
  isSearching,
  onSearchChange,
}: SearchBarProps) {
  return (
    <div className="mb-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search content by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}

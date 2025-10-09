import { Coins } from 'lucide-react';

interface CreditsIndicatorProps {
  creditsRemaining: number;
  loading?: boolean;
}

export function CreditsIndicator({
  creditsRemaining,
  loading,
}: CreditsIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-gray-200">
      <Coins className="w-5 h-5 text-amber-500" />
      <div className="flex flex-col">
        <span className="text-xs text-gray-500 font-medium">Credits</span>
        <span className="text-lg font-bold text-gray-900">
          {loading ? '...' : creditsRemaining}
        </span>
      </div>
    </div>
  );
}

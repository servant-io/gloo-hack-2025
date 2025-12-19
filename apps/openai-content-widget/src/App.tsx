import { useEffect, useState } from 'react';
import { AIEnhancedWidget } from './components/AIEnhancedWidget';
import { seedDatabase } from './utils/seedDatabase';
import { DEFAULT_MOCK_QUERY } from './config/mockUserQuery';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    resetScriptureJourney: () => void;
  }
}

function App() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedError, setError] = useState<string | null>(null);

  useEffect(() => {
    window.resetScriptureJourney = () => {
      localStorage.removeItem('scripture-journey-seeded');
      window.location.reload();
    };

    async function checkAndSeed() {
      try {
        const isSeeded = localStorage.getItem('scripture-journey-seeded');
        console.log(
          'Checking seed status:',
          isSeeded ? 'Already seeded' : 'Needs seeding'
        );

        if (!isSeeded) {
          console.log('Starting database seed...');
          setIsSeeding(true);
          const result = await seedDatabase();
          console.log('Seed result:', result);
          localStorage.setItem('scripture-journey-seeded', 'true');
          setIsSeeding(false);
        } else {
          console.log(
            'Database already seeded. Run window.resetScriptureJourney() to re-seed.'
          );
        }
      } catch (err) {
        console.error('Seeding error:', err);
        setError('Failed to initialize database');
        setIsSeeding(false);
      }
    }

    checkAndSeed();
  }, []);

  if (isSeeding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Setting Up Your Journey
          </h2>
          <p className="text-gray-600">Loading biblical content...</p>
        </div>
      </div>
    );
  }

  if (seedError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Initialization Error
          </h2>
          <p className="text-gray-600 mb-4">{seedError}</p>
          <button
            onClick={() => {
              localStorage.removeItem('scripture-journey-seeded');
              window.location.reload();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <AIEnhancedWidget
      theme={DEFAULT_MOCK_QUERY.contentTheme || 'Luke-Acts'}
      userQuery={DEFAULT_MOCK_QUERY.originalPrompt}
      conversationContext={DEFAULT_MOCK_QUERY.conversationContext}
    />
  );
}

export default App;

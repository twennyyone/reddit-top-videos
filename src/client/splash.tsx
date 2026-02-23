import './index.css';

import { requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎬</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Top 5 Videos This Week
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Most upvoted videos from this subreddit
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Tap to see this week&apos;s most upvoted videos
        </p>
        <button
          className="w-full flex items-center justify-center bg-[#d93900] dark:bg-orange-600 text-white h-10 rounded-full cursor-pointer transition-colors px-4 hover:bg-[#c23300] dark:hover:bg-orange-700 font-medium"
          onClick={(e) =>
            requestExpandedMode(e.nativeEvent, 'game')
          }
        >
          View Top Videos →
        </button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);

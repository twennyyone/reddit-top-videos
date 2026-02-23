import './index.css';

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo } from '@devvit/web/client';
import type { TopVideosResponse, VideoPost } from '../shared/api';

const RANK_COLORS: Record<number, string> = {
  1: 'bg-yellow-400 text-yellow-900',
  2: 'bg-gray-300 text-gray-800',
  3: 'bg-amber-600 text-amber-100',
};

const formatRelativeTime = (timestampMs: number): string => {
  const diff = Date.now() - timestampMs;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  return 'just now';
};

const formatScore = (score: number): string => {
  if (score >= 1_000_000) return `${(score / 1_000_000).toFixed(1)}M`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
};

type VideoCardProps = {
  video: VideoPost;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const rankStyle =
    RANK_COLORS[video.rank] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  const isTop = video.rank === 1;

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm border ${
        isTop
          ? 'border-yellow-300 dark:border-yellow-600'
          : 'border-gray-100 dark:border-gray-700'
      }`}
    >
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rankStyle}`}
        >
          {video.rank}
        </span>
      </div>
      <div className="flex-1 min-w-0 flex gap-3">
        {video.thumbnailUrl && (
          <div className="flex-shrink-0">
            <img
              src={video.thumbnailUrl}
              alt=""
              className="w-16 h-16 object-cover rounded-lg bg-gray-200 dark:bg-gray-700"
            />
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <button
            className="text-sm font-medium text-gray-900 dark:text-white text-left truncate hover:text-[#d93900] dark:hover:text-orange-400 transition-colors cursor-pointer"
            onClick={() =>
              navigateTo(`https://www.reddit.com${video.permalink}`)
            }
            title={video.title}
          >
            {video.title}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            u/{video.author}
          </p>
          <div className="flex items-center gap-3 mt-auto">
            <span className="flex items-center gap-1 text-xs font-medium text-[#d93900] dark:text-orange-400">
              ▲ {formatScore(video.score)}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatRelativeTime(video.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const App = () => {
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch('/api/top-videos');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: TopVideosResponse = await res.json();
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load videos');
      } finally {
        setLoading(false);
      }
    };
    void fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-lg mx-auto flex flex-col gap-4">
        <div className="flex items-center gap-2 pt-2">
          <span className="text-2xl">��</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Top 5 Videos This Week
          </h1>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-white dark:bg-gray-800 shadow-sm animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">
              ⚠️ {error}
            </p>
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="p-8 rounded-xl bg-white dark:bg-gray-800 shadow-sm text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              No video posts found this week
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Check back later when videos are posted!
            </p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <div className="flex flex-col gap-3">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

import { Hono } from 'hono';
import { context, redis, reddit } from '@devvit/web/server';
import type {
  DecrementResponse,
  IncrementResponse,
  InitResponse,
  TopVideosResponse,
  VideoPost,
} from '../../shared/api';

type ErrorResponse = {
  status: 'error';
  message: string;
};

const TOP_VIDEOS_CACHE_KEY = 'top-videos-cache';
const TOP_VIDEOS_CACHE_TTL_SECONDS = 3600; // 1 hour
const TOP_VIDEOS_COUNT = 5;

export const api = new Hono();

api.get('/init', async (c) => {
  const { postId } = context;

  if (!postId) {
    console.error('API Init Error: postId not found in devvit context');
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required but missing from context',
      },
      400
    );
  }

  try {
    const [count, username] = await Promise.all([
      redis.get('count'),
      reddit.getCurrentUsername(),
    ]);

    return c.json<InitResponse>({
      type: 'init',
      postId: postId,
      count: count ? parseInt(count) : 0,
      username: username ?? 'anonymous',
    });
  } catch (error) {
    console.error(`API Init Error for post ${postId}:`, error);
    let errorMessage = 'Unknown error during initialization';
    if (error instanceof Error) {
      errorMessage = `Initialization failed: ${error.message}`;
    }
    return c.json<ErrorResponse>(
      { status: 'error', message: errorMessage },
      400
    );
  }
});

api.post('/increment', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', 1);
  return c.json<IncrementResponse>({
    count,
    postId,
    type: 'increment',
  });
});

api.post('/decrement', async (c) => {
  const { postId } = context;
  if (!postId) {
    return c.json<ErrorResponse>(
      {
        status: 'error',
        message: 'postId is required',
      },
      400
    );
  }

  const count = await redis.incrBy('count', -1);
  return c.json<DecrementResponse>({
    count,
    postId,
    type: 'decrement',
  });
});

api.get('/top-videos', async (c) => {
  const subredditName = context.subredditName;
  if (!subredditName) {
    return c.json<ErrorResponse>(
      { status: 'error', message: 'subredditName not found in context' },
      400
    );
  }

  try {
    const cached = await redis.get(TOP_VIDEOS_CACHE_KEY);
    if (cached) {
      const parsed: TopVideosResponse = JSON.parse(cached);
      return c.json<TopVideosResponse>(parsed);
    }
  } catch {
    // cache miss or parse error — fetch fresh data
  }

  try {
    const listing = reddit.getTopPosts({
      subredditName,
      timeframe: 'week',
      limit: 100,
      pageSize: 100,
    });

    const posts = await listing.all();
    const videoPosts: VideoPost[] = [];

    for (const post of posts) {
      if (videoPosts.length >= TOP_VIDEOS_COUNT) break;
      const redditVideo = post.secureMedia?.redditVideo;
      if (!redditVideo) continue;

      videoPosts.push({
        id: post.id,
        title: post.title,
        author: post.authorName,
        score: post.score,
        permalink: post.permalink,
        thumbnailUrl: post.thumbnail?.url ?? null,
        videoUrl: redditVideo.dashUrl ?? null,
        createdAt: post.createdAt.getTime(),
        rank: videoPosts.length + 1,
      });
    }

    const response: TopVideosResponse = {
      type: 'topVideos',
      videos: videoPosts,
      cachedAt: Date.now(),
    };

    await redis.set(
      TOP_VIDEOS_CACHE_KEY,
      JSON.stringify(response),
      { expiration: new Date(Date.now() + TOP_VIDEOS_CACHE_TTL_SECONDS * 1000) }
    );

    return c.json<TopVideosResponse>(response);
  } catch (error) {
    console.error('Error fetching top videos:', error);
    let message = 'Failed to fetch top videos';
    if (error instanceof Error) {
      message = error.message;
    }
    return c.json<ErrorResponse>({ status: 'error', message }, 500);
  }
});

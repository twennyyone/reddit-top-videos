export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

export type VideoPost = {
  id: string;
  title: string;
  author: string;
  score: number;
  permalink: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  createdAt: number;
  rank: number;
};

export type TopVideosResponse = {
  type: 'topVideos';
  videos: VideoPost[];
  cachedAt: number;
};

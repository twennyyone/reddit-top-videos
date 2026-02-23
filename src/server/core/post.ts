import { reddit } from '@devvit/web/server';

export const createPost = async () => {
  return await reddit.submitCustomPost({
    title: '🎬 Top 5 Videos This Week',
  });
};

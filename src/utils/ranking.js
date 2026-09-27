import { durationToSeconds, videoIdOf } from './format';

// YouTube treats <= 60s uploads as Shorts.
export const SHORT_MAX_SECONDS = 60;

export const isShort = (video) => {
  const seconds = durationToSeconds(video?.contentDetails?.duration);
  return seconds > 0 && seconds <= SHORT_MAX_SECONDS;
};

export const DEFAULT_MIX = { subs: 60, disc: 25, learn: 15 };
export const DEFAULT_RULES = {
  noShorts: true,
  hideWatched: true,
  algoOff: false,
};

/**
 * The design's "Tune your feed" dial. The weights are applied literally —
 * each video scores 0..1 in three buckets and the mix decides how much each
 * bucket counts. No hidden weighting, which is the point of the panel.
 *
 *   subs  — the channel is one you subscribed to
 *   disc  — a channel you have neither subscribed to nor watched before
 *   learn — long-form, scored against the longest video in the batch
 */
export const rankFeed = (
  videos,
  {
    mix = DEFAULT_MIX,
    rules = DEFAULT_RULES,
    subscribedChannelIds = new Set(),
    watchedChannelIds = new Set(),
    finishedVideoIds = new Set(),
  } = {}
) => {
  let list = videos.filter(Boolean);

  if (rules.noShorts) list = list.filter((v) => !isShort(v));
  if (rules.hideWatched) list = list.filter((v) => !finishedVideoIds.has(videoIdOf(v)));

  const byNewest = (a, b) =>
    new Date(b?.snippet?.publishedAt || 0) - new Date(a?.snippet?.publishedAt || 0);

  if (rules.algoOff) return [...list].sort(byNewest);

  const total = mix.subs + mix.disc + mix.learn;
  if (total === 0) return [...list].sort(byNewest);

  const longest = list.reduce(
    (max, v) => Math.max(max, durationToSeconds(v?.contentDetails?.duration)),
    1
  );

  return list
    .map((video) => {
      const channelId = video?.snippet?.channelId;
      const followed = subscribedChannelIds.has(channelId) ? 1 : 0;
      const fresh =
        !subscribedChannelIds.has(channelId) && !watchedChannelIds.has(channelId) ? 1 : 0;
      const longForm = Math.min(
        1,
        durationToSeconds(video?.contentDetails?.duration) / longest
      );

      return {
        video,
        score:
          (mix.subs * followed + mix.disc * fresh + mix.learn * longForm) / total,
      };
    })
    // Newest wins ties so the order stays stable and predictable.
    .sort((a, b) => b.score - a.score || byNewest(a.video, b.video))
    .map((entry) => entry.video);
};

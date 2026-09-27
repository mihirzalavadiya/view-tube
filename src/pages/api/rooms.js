import { LIVE_VIDEO_API, SEARCH_API_ONE_VIDEO } from '@/utils/constants';

/**
 * "Rooms starting soon" — the co-watch section on Home.
 *
 * There is no rooms product behind this app, but scheduled premieres and live
 * streams are the real thing the section describes: something a group watches
 * together at a set time. Upcoming streams give a real start time and live
 * ones give a real concurrent-viewer count.
 */
const searchIds = async (eventType) => {
  const res = await fetch(
    `${SEARCH_API_ONE_VIDEO}&type=video&eventType=${eventType}&order=date&q=${encodeURIComponent(
      'live'
    )}`
  );
  if (!res.ok) throw new Error(`YouTube search error: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map((item) => item.id?.videoId).filter(Boolean);
};

export default async function handler(req, res) {
  try {
    const [upcoming, live] = await Promise.all([
      searchIds('upcoming').catch(() => []),
      searchIds('live').catch(() => []),
    ]);

    // A few of each, upcoming first — the section is "starting soon".
    const ids = [...new Set([...upcoming.slice(0, 6), ...live.slice(0, 6)])];
    if (ids.length === 0) return res.status(200).json({ items: [] });

    const detailRes = await fetch(`${LIVE_VIDEO_API}&id=${ids.join(',')}`);
    if (!detailRes.ok) throw new Error(`YouTube videos error: ${detailRes.status}`);

    const detail = await detailRes.json();

    const items = (detail.items || [])
      .map((video) => {
        const live = video.liveStreamingDetails || {};
        const state = video.snippet?.liveBroadcastContent;
        return {
          id: video.id,
          title: video.snippet?.title,
          host: video.snippet?.channelTitle,
          channelId: video.snippet?.channelId,
          thumbnail:
            video.snippet?.thumbnails?.medium?.url ||
            video.snippet?.thumbnails?.default?.url ||
            null,
          isLive: state === 'live',
          scheduledStartTime: live.scheduledStartTime || null,
          concurrentViewers: live.concurrentViewers || null,
        };
      })
      // Drop anything that finished between the search and this lookup.
      .filter((item) => item.isLive || item.scheduledStartTime)
      .sort((a, b) => {
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return new Date(a.scheduledStartTime || 0) - new Date(b.scheduledStartTime || 0);
      })
      .slice(0, 6);

    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    return res.status(200).json({ items });
  } catch (error) {
    console.error('Rooms API Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
}

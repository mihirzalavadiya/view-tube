import { ONE_VIDEO_API, SEARCH_API_ONE_VIDEO } from '@/utils/constants';

/**
 * Shorts feed: short-form vertical clips. Search is filtered to videos under
 * four minutes, then hydrated through the videos endpoint so the cards have
 * real view counts.
 */
export default async function handler(req, res) {
  try {
    const searchRes = await fetch(
      `${SEARCH_API_ONE_VIDEO}&type=video&videoDuration=short&q=${encodeURIComponent(
        '#shorts'
      )}`
    );
    if (!searchRes.ok) throw new Error(`YouTube search error: ${searchRes.status}`);

    const searchData = await searchRes.json();
    const ids = (searchData.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (ids.length === 0) return res.status(200).json({ items: [] });

    const detailRes = await fetch(`${ONE_VIDEO_API}&id=${ids.join(',')}`);
    if (!detailRes.ok) throw new Error(`YouTube videos error: ${detailRes.status}`);

    const detailData = await detailRes.json();
    return res.status(200).json(detailData);
  } catch (error) {
    console.error('Shorts API Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch shorts' });
  }
}

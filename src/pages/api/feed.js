import { ONE_VIDEO_API, SEARCH_API_ONE_VIDEO, VIEWTUBE_VIDEO_API } from '@/utils/constants';

/**
 * Feed for the home grid.
 *
 * Without `q` this is the mostPopular chart. With `q` (a category chip) the
 * search endpoint only returns `snippet`, which would leave the cards without
 * duration, views or category — so the ids are hydrated through the videos
 * endpoint to get the same shape as the chart response.
 */
export default async function handler(req, res) {
  const { q } = req.query;

  try {
    if (!q) {
      const response = await fetch(VIEWTUBE_VIDEO_API);
      const data = await response.json();
      return res.status(200).json(data);
    }

    const searchRes = await fetch(
      `${SEARCH_API_ONE_VIDEO}&type=video&q=${encodeURIComponent(q)}`
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
    console.error('Feed API Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch from YouTube API' });
  }
}

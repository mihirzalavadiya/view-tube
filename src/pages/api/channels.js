import { CHANNEL_API } from '@/utils/constants';

const MAX_IDS_PER_CALL = 50;

const chunk = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

/**
 * Batch channel lookup for avatars. The videos endpoint returns channelId and
 * channelTitle but no avatar, so the feed resolves them here in one call per
 * 50 channels rather than one call per card.
 *
 * Responds with { channels: { [channelId]: { avatar, title } } }.
 */
export default async function handler(req, res) {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: 'ids is required' });

    const unique = [...new Set(String(ids).split(',').filter(Boolean))];
    if (unique.length === 0) return res.status(200).json({ channels: {} });

    const batches = await Promise.all(
      chunk(unique, MAX_IDS_PER_CALL).map(async (group) => {
        const response = await fetch(`${CHANNEL_API}&id=${group.join(',')}`);
        if (!response.ok) throw new Error(`YouTube channels error: ${response.status}`);
        const data = await response.json();
        return data.items || [];
      })
    );

    const channels = {};
    batches.flat().forEach((item) => {
      const thumbs = item?.snippet?.thumbnails;
      channels[item.id] = {
        avatar: thumbs?.medium?.url || thumbs?.default?.url || null,
        title: item?.snippet?.title || null,
      };
    });

    // Cached at the edge: avatars change rarely and this is called on every
    // feed render.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ channels });
  } catch (error) {
    console.error('Channels API Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch channels' });
  }
}

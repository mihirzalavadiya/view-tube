import { CHANNEL_API } from '@/utils/constants';

// Subscriber and video counts for the watch page channel bar. The video
// endpoint doesn't carry them, so they need a separate lookup.
export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Channel ID is required' });

    const response = await fetch(`${CHANNEL_API}&id=${id}`);
    if (!response.ok) throw new Error(`YouTube channels error: ${response.status}`);

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Channel API Error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch channel' });
  }
}

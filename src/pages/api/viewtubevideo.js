import { ONE_VIDEO_API } from '@/utils/constants';

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Video ID is required' });
    }
    const response = await fetch(`${ONE_VIDEO_API}&id=${id}`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('YouTube API Error:', error);
    res.status(500).json({ error: 'Failed to fetch from YouTube API' });
  }
}

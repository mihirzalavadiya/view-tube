import { VIEWTUBE_VIDEO_API } from '@/utils/constants';

export default async function handler(req, res) {
  try {
    const response = await fetch(VIEWTUBE_VIDEO_API);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('YouTube API Error:', error);
    res.status(500).json({ error: 'Failed to fetch from YouTube API' });
  }
}

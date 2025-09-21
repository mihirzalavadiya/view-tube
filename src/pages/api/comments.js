// pages/api/comments.js
import { COMMENTS_API } from '@/utils/constants';

export default async function handler(req, res) {
  try {
    const { videoId, pageToken } = req.query;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    let url = `${COMMENTS_API}&videoId=${encodeURIComponent(videoId)}`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YouTube API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('YouTube Comments API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch YouTube comments' });
  }
}

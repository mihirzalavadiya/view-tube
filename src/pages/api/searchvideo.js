import { SEARCH_API_ONE_VIDEO } from '@/utils/constants';

export default async function handler(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query (q) is required' });
    }

    const url = `${SEARCH_API_ONE_VIDEO}&q=${encodeURIComponent(q)}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('YouTube Search API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from YouTube Search API' });
  }
}

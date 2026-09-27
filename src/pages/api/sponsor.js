/**
 * Sponsor / self-promo segments for the watch page progress bar.
 *
 * YouTube's own API has no notion of sponsor segments. The only real source
 * is SponsorBlock (sponsor.ajay.app), a crowd-sourced public dataset. It is
 * proxied here so the viewer's IP never reaches that service — only the video
 * id does. Remove this route to drop the dependency; the player then simply
 * shows no markers and no skip button.
 */
const SPONSORBLOCK = 'https://sponsor.ajay.app/api/skipSegments';
const CATEGORIES = ['sponsor', 'selfpromo'];

const LABELS = {
  sponsor: 'Sponsor segment',
  selfpromo: 'Self-promo',
};

export default async function handler(req, res) {
  const { videoId } = req.query;
  if (!videoId) return res.status(400).json({ error: 'videoId is required' });

  try {
    const url = `${SPONSORBLOCK}?videoID=${encodeURIComponent(
      videoId
    )}&categories=${encodeURIComponent(JSON.stringify(CATEGORIES))}`;

    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    // 404 means "no segments submitted", which is the common case.
    if (response.status === 404) return res.status(200).json({ segments: [] });
    if (!response.ok) throw new Error(`SponsorBlock error: ${response.status}`);

    const data = await response.json();
    const segments = (Array.isArray(data) ? data : [])
      .map((s) => ({
        start: Number(s.segment?.[0]),
        end: Number(s.segment?.[1]),
        category: s.category,
        label: LABELS[s.category] || 'Skippable',
      }))
      .filter((s) => Number.isFinite(s.start) && Number.isFinite(s.end) && s.end > s.start)
      .sort((a, b) => a.start - b.start);

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ segments });
  } catch (error) {
    console.error('Sponsor API Error:', error.message);
    return res.status(200).json({ segments: [] });
  }
}

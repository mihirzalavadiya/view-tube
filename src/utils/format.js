// Shared formatters. These used to be copy-pasted into VideoCard, WatchPage
// and CommentsSection with slightly different rules each time.

export const formatCompact = (count) => {
  const num = parseInt(count, 10);
  if (!num || Number.isNaN(num)) return '0';
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

export const formatViews = (count) => `${formatCompact(count)} views`;

export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/** ISO-8601 duration (PT1H2M3S) → seconds */
export const durationToSeconds = (duration) => {
  if (!duration || typeof duration !== 'string') return 0;
  const match = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, d, h, m, s] = match;
  return (
    (parseInt(d, 10) || 0) * 86400 +
    (parseInt(h, 10) || 0) * 3600 +
    (parseInt(m, 10) || 0) * 60 +
    (parseInt(s, 10) || 0)
  );
};

/** Seconds → 4:07 or 1:02:07 */
export const secondsToClock = (total) => {
  const secs = Math.max(0, Math.floor(total || 0));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

export const formatDuration = (duration) =>
  secondsToClock(durationToSeconds(duration));

/** "42 min left" for the continue-watching chip */
export const formatRemaining = (secondsLeft) => {
  const mins = Math.round((secondsLeft || 0) / 60);
  if (mins < 1) return 'almost done';
  if (mins < 60) return `${mins} min left`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m left`;
};

/**
 * YouTube descriptions conventionally list chapters as lines beginning with a
 * timestamp ("0:00 Intro"). Parse those into real, seekable chapters.
 * Returns [] when the description has no such list, so the panel can hide.
 */
export const parseChapters = (description) => {
  if (!description) return [];

  const chapters = [];
  for (const line of description.split('\n')) {
    const match = line.match(/^\s*\(?((?:\d{1,2}:)?\d{1,2}:\d{2})\)?\s*[-–—|:]?\s*(.+?)\s*$/);
    if (!match) continue;

    const [, stamp, rawLabel] = match;
    const label = rawLabel.replace(/^[-–—|:•]\s*/, '').trim();
    if (!label || label.length > 100) continue;

    const parts = stamp.split(':').map((p) => parseInt(p, 10));
    const seconds =
      parts.length === 3
        ? parts[0] * 3600 + parts[1] * 60 + parts[2]
        : parts[0] * 60 + parts[1];

    chapters.push({ time: stamp, seconds, label });
  }

  // A real chapter list starts at zero and climbs. Anything else is a
  // coincidental timestamp in prose, so discard it.
  if (chapters.length < 2 || chapters[0].seconds !== 0) return [];
  for (let i = 1; i < chapters.length; i += 1) {
    if (chapters[i].seconds <= chapters[i - 1].seconds) return [];
  }

  return chapters;
};

/** Deterministic gradient placeholder for missing artwork, per the design. */
const GRADIENTS = [
  ['#223024', '#7E9B3C'],
  ['#2A2233', '#7C5CA8'],
  ['#31261F', '#C08A4A'],
  ['#1E2C31', '#4E93A6'],
  ['#2E2320', '#B0553F'],
  ['#202E24', '#5FA86A'],
  ['#2B2B20', '#A8A24A'],
  ['#242030', '#6E6BB8'],
];

export const gradientFor = (seed = '') => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const [a, b] = GRADIENTS[hash % GRADIENTS.length];
  return `linear-gradient(145deg, ${a}, ${b})`;
};

export const initialsFor = (name = '') => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'VT';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export const bestThumbnail = (video) => {
  const t = video?.snippet?.thumbnails;
  return t?.maxres?.url || t?.standard?.url || t?.high?.url || t?.medium?.url || t?.default?.url || null;
};

export const videoIdOf = (video) =>
  typeof video?.id === 'string' ? video.id : video?.id?.videoId || null;

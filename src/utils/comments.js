import { parseChapters, secondsToClock } from './format';

const TIMESTAMP_RE = /\b(\d{1,2}):([0-5]\d)(?::([0-5]\d))?\b/g;

const topSnippet = (thread) => thread?.snippet?.topLevelComment?.snippet || {};

/** Every timestamp a comment points at, as seconds. */
export const timestampsIn = (text) => {
  const found = [];
  if (!text) return found;

  // Comment bodies are HTML from the API; strip tags so href="...t=123" and
  // the like don't produce phantom matches.
  const plain = String(text).replace(/<[^>]*>/g, ' ');

  let match = TIMESTAMP_RE.exec(plain);
  while (match) {
    const [raw, a, b, c] = match;
    const seconds = c
      ? Number(a) * 3600 + Number(b) * 60 + Number(c)
      : Number(a) * 60 + Number(b);
    found.push({ raw, seconds });
    match = TIMESTAMP_RE.exec(plain);
  }
  TIMESTAMP_RE.lastIndex = 0;

  return found;
};

/**
 * Where viewers point most often. Timestamps are bucketed to 30s so two
 * comments naming 28:50 and 28:57 count as the same moment.
 */
export const mostReferencedMoments = (threads = [], { limit = 3 } = {}) => {
  const buckets = new Map();

  threads.forEach((thread) => {
    const snippet = topSnippet(thread);
    const weight = 1 + Math.log10(1 + (snippet.likeCount || 0));

    // One comment naming the same moment twice shouldn't count twice.
    const unique = new Map();
    timestampsIn(snippet.textDisplay).forEach((t) => {
      unique.set(Math.floor(t.seconds / 30), t.seconds);
    });

    unique.forEach((seconds, bucket) => {
      const entry = buckets.get(bucket) || { seconds, count: 0, weight: 0 };
      entry.count += 1;
      entry.weight += weight;
      buckets.set(bucket, entry);
    });
  });

  return [...buckets.values()]
    .filter((b) => b.count >= 2 && b.seconds > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((b) => ({
      seconds: b.seconds,
      time: secondsToClock(b.seconds),
      count: b.count,
    }));
};

/**
 * The design's Key moments list: the creator's own chapters, plus moments
 * viewers keep pointing at that the chapters don't already cover.
 * Nothing here is generated — each row names where it came from.
 */
export const buildKeyMoments = (description, threads = [], durationSec = 0) => {
  const chapters = parseChapters(description).map((c) => ({
    seconds: c.seconds,
    time: c.time,
    label: c.label,
    source: 'From description',
  }));

  const covered = new Set(chapters.map((c) => Math.floor(c.seconds / 60)));

  const replayed = mostReferencedMoments(threads)
    .filter((m) => !covered.has(Math.floor(m.seconds / 60)))
    .filter((m) => !durationSec || m.seconds < durationSec)
    .map((m) => ({
      seconds: m.seconds,
      time: m.time,
      label: `Viewers keep returning here (${m.count} comments)`,
      source: 'Most-replayed comment',
    }));

  return [...chapters, ...replayed].sort((a, b) => a.seconds - b.seconds);
};

/**
 * The Discussion tab groups comments instead of dumping them. All three
 * groups are counted from the real comment threads.
 */
export const buildDigest = (threads = [], creatorChannelId) => {
  const creatorReplied = threads.filter((thread) =>
    (thread.replies?.comments || []).some(
      (reply) => reply?.snippet?.authorChannelId?.value === creatorChannelId
    )
  );

  const timestamped = threads.filter(
    (thread) => timestampsIn(topSnippet(thread).textDisplay).length > 0
  );

  const questions = threads
    .filter((thread) => (topSnippet(thread).textDisplay || '').includes('?'))
    // Unanswered first, then by likes — the design's stated order.
    .sort((a, b) => {
      const aOpen = (a.snippet?.totalReplyCount || 0) === 0 ? 0 : 1;
      const bOpen = (b.snippet?.totalReplyCount || 0) === 0 ? 0 : 1;
      return aOpen - bOpen || (topSnippet(b).likeCount || 0) - (topSnippet(a).likeCount || 0);
    });

  const hotspot = mostReferencedMoments(timestamped, { limit: 1 })[0];

  return [
    creatorReplied.length > 0 && {
      key: 'creator',
      kind: 'Creator replied',
      count: `${creatorReplied.length} ${creatorReplied.length === 1 ? 'thread' : 'threads'}`,
      line: stripHtml(topSnippet(creatorReplied[0]).textDisplay),
      threads: creatorReplied,
    },
    timestamped.length > 0 && {
      key: 'timestamped',
      kind: 'Timestamped comments',
      count: String(timestamped.length),
      line: hotspot
        ? `Most point at ${hotspot.time}.`
        : 'Comments that link to a specific moment.',
      threads: timestamped,
      seekTo: hotspot?.seconds,
    },
    questions.length > 0 && {
      key: 'questions',
      kind: 'Top questions',
      count: String(questions.length),
      line: stripHtml(topSnippet(questions[0]).textDisplay),
      threads: questions,
    },
  ].filter(Boolean);
};

export const stripHtml = (html, max = 140) => {
  const text = String(html || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};

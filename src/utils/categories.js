// YouTube's category ids are stable and documented, so the feed card can show
// a real category chip without an extra videoCategories API round-trip.
export const CATEGORY_NAMES = {
  1: 'Film',
  2: 'Autos',
  10: 'Music',
  15: 'Animals',
  17: 'Sports',
  18: 'Short film',
  19: 'Travel',
  20: 'Gaming',
  21: 'Vlog',
  22: 'People',
  23: 'Comedy',
  24: 'Entertainment',
  25: 'News',
  26: 'Howto',
  27: 'Education',
  28: 'Science',
  29: 'Nonprofit',
  30: 'Movies',
  31: 'Animation',
  32: 'Action',
  33: 'Classics',
  34: 'Comedy',
  35: 'Documentary',
  36: 'Drama',
  37: 'Family',
  38: 'Foreign',
  39: 'Horror',
  40: 'Sci-fi',
  41: 'Thriller',
  42: 'Shorts',
  43: 'Shows',
  44: 'Trailers',
};

export const categoryNameFor = (categoryId) =>
  CATEGORY_NAMES[parseInt(categoryId, 10)] || null;

/**
 * The design replaces the live site's 19 generic categories with a shorter
 * editorial set. Each chip maps to the YouTube search term used to fill the
 * feed, so the chips actually filter rather than only changing colour.
 * `All` is the default popular-videos feed and needs no query.
 */
export const FEED_CHIPS = [
  { label: 'All', query: null },
  { label: 'Deep dives', query: 'deep dive documentary explainer' },
  { label: 'Design', query: 'design process typography ui' },
  { label: 'Engineering', query: 'software engineering deep dive' },
  { label: 'Film', query: 'filmmaking cinematography' },
  { label: 'Music', query: 'music production live session' },
  { label: 'Courses', query: 'full course tutorial' },
  { label: 'Live now', query: 'live stream' },
  { label: 'Science', query: 'science explained research' },
];

import React, { useMemo, useState } from 'react';
import ButtonList from './ButtonList';
import HomeHero from './HomeHero';
import FeedDial from './FeedDial';
import VideoContainer from './VideoContainer';
import RoomsSection from './RoomsSection';
import useVideos from '@/hooks/useVideos';
import useWatchHistory from '@/hooks/useWatchHistory';
import useFeedPrefs from '@/hooks/useFeedPrefs';
import useLocalSet from '@/hooks/useLocalSet';
import useWatchBudget from '@/hooks/useWatchBudget';
import { FEED_CHIPS } from '@/utils/categories';
import { videoIdOf } from '@/utils/format';
import { rankFeed } from '@/utils/ranking';

const FINISHED_PCT = 95;

const BodyContainer = () => {
  const [chip, setChip] = useState('All');
  // null = the feed dial decides the order; a sort button overrides it.
  const [sort, setSort] = useState(null);

  const query = useMemo(
    () => FEED_CHIPS.find((c) => c.label === chip)?.query ?? null,
    [chip]
  );

  const { videos, loading, error, refetch } = useVideos(query);
  const { entries, resumable } = useWatchHistory();
  const prefs = useFeedPrefs();
  const subscriptions = useLocalSet('vt-subscriptions');
  const budget = useWatchBudget();

  const ranked = useMemo(() => {
    const subscribedChannelIds = new Set(subscriptions.items);
    const watchedChannelIds = new Set(entries.map((e) => e.channelId).filter(Boolean));
    const finishedVideoIds = new Set(
      entries
        .filter((e) => e.durationSec && (e.positionSec / e.durationSec) * 100 >= FINISHED_PCT)
        .map((e) => e.id)
    );

    return rankFeed(videos || [], {
      mix: prefs.mix,
      rules: prefs.rules,
      subscribedChannelIds,
      watchedChannelIds,
      finishedVideoIds,
    });
  }, [videos, prefs.mix, prefs.rules, subscriptions.items, entries]);

  // The hero is the top-ranked item; drop it from the grid so the same video
  // isn't shown twice.
  const hero = ranked[0] || null;
  const heroId = videoIdOf(hero);
  const rest = useMemo(
    () => ranked.filter((v) => videoIdOf(v) !== heroId),
    [ranked, heroId]
  );

  // The design's copy for the default feed is "Across your subscriptions",
  // but this app has no subscription graph — the default feed is YouTube's
  // popular chart, so the heading says what it actually is.
  const heading = chip === 'All' ? 'Popular right now' : chip;

  return (
    <main className="vt-rise px-[18px] pb-[70px] pt-[30px] md:px-[34px]">
      <ButtonList active={chip} onChange={setChip} />

      {!loading && !error && <HomeHero video={hero} resumable={resumable} />}

      <FeedDial
        mix={prefs.mix}
        rules={prefs.rules}
        onMixChange={prefs.setMix}
        onRuleToggle={prefs.toggleRule}
        budgetLimitMin={budget.limitMin}
      />

      <VideoContainer
        videos={rest}
        loading={loading}
        error={error}
        heading={heading}
        sort={sort}
        onSortChange={setSort}
        onRetry={refetch}
      />

      <RoomsSection />
    </main>
  );
};

export default BodyContainer;

import React, { useMemo } from 'react';
import VideoCard from './VideoCard';
import useChannelAvatars from '@/hooks/useChannelAvatars';
import { durationToSeconds, videoIdOf } from '@/utils/format';

export const SORTS = ['Recent', 'Popular', 'Longest'];

// `sort` is null when the feed dial owns the order — the list arrives ranked
// from BodyContainer and is left alone. A sort button re-sorts it.
const sortVideos = (videos, sort) => {
  if (!sort) return videos;
  const copy = [...videos];
  if (sort === 'Popular') {
    return copy.sort(
      (a, b) =>
        (parseInt(b?.statistics?.viewCount, 10) || 0) -
        (parseInt(a?.statistics?.viewCount, 10) || 0)
    );
  }
  if (sort === 'Longest') {
    return copy.sort(
      (a, b) =>
        durationToSeconds(b?.contentDetails?.duration) -
        durationToSeconds(a?.contentDetails?.duration)
    );
  }
  return copy.sort(
    (a, b) =>
      new Date(b?.snippet?.publishedAt || 0) - new Date(a?.snippet?.publishedAt || 0)
  );
};

const Skeletons = () => (
  <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-x-[22px] gap-y-[26px]">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="vt-pulse min-w-0">
        <div className="aspect-video rounded-[18px] bg-surface2" />
        <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 pt-[13px]">
          <div className="h-9 w-9 rounded-[11px] bg-surface2" />
          <div className="space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-surface2" />
            <div className="h-3 w-1/2 rounded bg-surface2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Notice = ({ eyebrow, title, body, actionLabel, onAction, ghost }) => (
  <div className="mx-auto flex max-w-[420px] flex-col items-center gap-3 py-20 text-center">
    <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
      {eyebrow}
    </div>
    <h3 className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
      {title}
    </h3>
    <p className="text-sm leading-[1.6] text-muted">{body}</p>
    {onAction && (
      <button
        type="button"
        onClick={onAction}
        className={`mt-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-colors duration-200 ${
          ghost
            ? 'border border-line text-ink hover:border-accent hover:text-accent-text'
            : 'bg-accent text-accent-ink'
        }`}
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const VideoContainer = ({
  videos = [],
  loading,
  error,
  heading,
  sort,
  onSortChange,
  onRetry,
}) => {
  const sorted = useMemo(() => sortVideos(videos, sort), [videos, sort]);

  // One batched lookup for the whole grid rather than one per card.
  const channelIds = useMemo(
    () => videos.map((v) => v?.snippet?.channelId).filter(Boolean),
    [videos]
  );
  const avatars = useChannelAvatars(channelIds);

  // Popular/Longest need statistics and contentDetails. Hide the control
  // rather than offer a sort that silently does nothing.
  const canSort = videos.some(
    (v) => v?.statistics?.viewCount || v?.contentDetails?.duration
  );

  return (
    <section>
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-5 border-b border-line pb-3.5">
        <div>
          <div className="mb-[7px] font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent-text">
            Fresh today
          </div>
          <h2 className="font-display text-[29px] font-bold tracking-[-0.03em] text-ink">
            {heading}
          </h2>
        </div>

        {canSort && !loading && !error && (
          <div role="group" aria-label="Sort videos" className="flex gap-1.5">
            {SORTS.map((label) => (
              <button
                key={label}
                type="button"
                // Clicking the active sort clears it and hands the order back
                // to the feed dial.
                onClick={() => onSortChange(sort === label ? null : label)}
                aria-pressed={sort === label}
                className={`rounded-[9px] px-[13px] py-[7px] text-[12.5px] font-semibold transition-colors duration-200 ${
                  sort === label
                    ? 'bg-surface3 text-ink'
                    : 'bg-transparent text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <Skeletons />}

      {!loading && error && (
        <Notice
          eyebrow="Something broke"
          title="Couldn't load the feed"
          body={error}
          actionLabel="Try again"
          onAction={onRetry}
          ghost
        />
      )}

      {!loading && !error && sorted.length === 0 && (
        <Notice
          eyebrow="Empty"
          title="Nothing here yet"
          body="No videos came back for this selection. Try another category or search for something specific."
          actionLabel="Reload feed"
          onAction={onRetry}
        />
      )}

      {!loading && !error && sorted.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-x-[22px] gap-y-[26px] xl:grid-cols-[repeat(auto-fill,minmax(275px,1fr))]">
          {sorted.map((video, index) => (
            <VideoCard
              key={videoIdOf(video) || index}
              video={video}
              avatar={avatars[video?.snippet?.channelId]?.avatar}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default VideoContainer;

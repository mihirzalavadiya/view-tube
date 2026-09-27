import React from 'react';
import Link from 'next/link';
import ChannelAvatar from './ChannelAvatar';
import useChannelAvatars from '@/hooks/useChannelAvatars';
import {
  bestThumbnail,
  formatCompact,
  formatDuration,
  formatRemaining,
  formatTimeAgo,
  gradientFor,
  videoIdOf,
} from '@/utils/format';

const EditorsPick = ({ video, avatar }) => {
  const id = videoIdOf(video);
  const snippet = video?.snippet;
  if (!id || !snippet) return null;

  const thumbnail = bestThumbnail(video);
  const duration = video?.contentDetails?.duration;
  const views = video?.statistics?.viewCount;
  const isLive = snippet.liveBroadcastContent === 'live';

  // First paragraph of the real description stands in for the design's dek.
  const dek = (snippet.description || '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 40);

  return (
    <Link
      href={`/watch?v=${id}`}
      className="group flex min-h-[400px] flex-col overflow-hidden rounded-[24px] border border-line bg-surface hover:text-ink"
    >
      <div
        className="relative min-h-[270px] flex-1"
        style={thumbnail ? undefined : { background: gradientFor(id) }}
      >
        {thumbnail && (
          <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 15% 10%, rgba(0,0,0,.55), transparent 60%)',
          }}
        />
        <div className="absolute left-[18px] top-[18px] flex items-center gap-2">
          <span className="rounded-full bg-accent px-2.5 py-[5px] font-mono text-[10.5px] font-bold uppercase tracking-[0.12em] text-accent-ink">
            Editor&rsquo;s pick
          </span>
          {isLive && (
            <span className="rounded-full bg-black/50 px-2.5 py-[5px] text-[11px] font-semibold text-white backdrop-blur-[6px]">
              Live now
            </span>
          )}
        </div>
        {duration && !isLive && (
          <span className="absolute bottom-[18px] right-[18px] rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      <div className="px-6 pb-6 pt-[22px]">
        <h1 className="mb-2.5 font-display text-[38px] font-bold leading-[1.02] tracking-[-0.035em] text-ink text-balance">
          {snippet.title}
        </h1>
        {dek && (
          <p className="mb-4 line-clamp-3 max-w-[60ch] text-[15px] leading-[1.55] text-ink2 text-pretty">
            {dek}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted">
          <ChannelAvatar
            src={avatar}
            name={snippet.channelTitle}
            size={30}
            radius="rounded-[9px]"
          />
          <strong className="font-semibold text-ink">{snippet.channelTitle}</strong>
          {views && (
            <>
              <span aria-hidden="true">·</span>
              <span>{formatCompact(views)} views</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{formatTimeAgo(snippet.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
};

const ContinueWatching = ({ items }) => (
  <div className="flex min-w-0 flex-col gap-3">
    <div className="flex items-baseline justify-between">
      <h2 className="font-display text-[15px] font-bold tracking-[0.02em] text-ink">
        Continue watching
      </h2>
      <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted">
        {items.length} open
      </span>
    </div>

    {items.slice(0, 4).map((item) => {
      const pct = Math.min(100, Math.round((item.positionSec / item.durationSec) * 100));
      return (
        <Link
          key={item.id}
          href={`/watch?v=${item.id}`}
          className="vt-lift grid grid-cols-[132px_minmax(0,1fr)] gap-[13px] rounded-2xl border border-line bg-surface p-2.5 hover:text-ink"
        >
          <div
            className="relative aspect-[16/10] overflow-hidden rounded-[11px]"
            style={item.thumbnail ? undefined : { background: gradientFor(item.id) }}
          >
            {item.thumbnail && (
              <img src={item.thumbnail} alt="" className="h-full w-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-black/45">
              <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
            <span className="absolute right-1.5 top-1.5 rounded bg-black/60 px-[5px] py-0.5 font-mono text-[9.5px] text-white">
              {formatRemaining(item.durationSec - item.positionSec)}
            </span>
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-[5px]">
            <div className="line-clamp-2 text-sm font-semibold leading-[1.25] text-ink">
              {item.title}
            </div>
            <div className="truncate text-xs text-muted">{item.channel}</div>
          </div>
        </Link>
      );
    })}
  </div>
);

/**
 * The design pairs an Editor's pick card with a Continue-watching column.
 * With no watch history yet there is nothing real to put in that column, so
 * the hero takes the full width instead of showing an empty frame.
 */
const HomeHero = ({ video, resumable = [] }) => {
  const channelId = video?.snippet?.channelId;
  const avatars = useChannelAvatars(channelId ? [channelId] : []);

  if (!video) return null;
  const hasResume = resumable.length > 0;

  return (
    <section
      className={`mb-11 grid gap-[22px] ${
        hasResume ? 'lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]' : 'grid-cols-1'
      }`}
    >
      <EditorsPick video={video} avatar={avatars[channelId]?.avatar} />
      {hasResume && <ContinueWatching items={resumable} />}
    </section>
  );
};

export default HomeHero;

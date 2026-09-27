import React from 'react';
import Link from 'next/link';
import ChannelAvatar from './ChannelAvatar';
import {
  bestThumbnail,
  formatDuration,
  formatCompact,
  formatTimeAgo,
  gradientFor,
  videoIdOf,
} from '@/utils/format';
import { categoryNameFor } from '@/utils/categories';

/**
 * Feed card. Search results carry only `snippet`, so duration, views and
 * category are absent there — each chip renders only when its data exists
 * rather than showing a placeholder.
 */
const VideoCard = ({ video, avatar }) => {
  const id = videoIdOf(video);
  const snippet = video?.snippet;
  if (!id || !snippet) return null;

  const isLive = snippet.liveBroadcastContent === 'live';
  const thumbnail = bestThumbnail(video);
  const channel = snippet.channelTitle || '';
  const duration = video?.contentDetails?.duration;
  const views = video?.statistics?.viewCount;
  const tag = isLive ? 'Live' : categoryNameFor(snippet.categoryId);

  const meta = [
    views ? `${formatCompact(views)} views` : null,
    formatTimeAgo(snippet.publishedAt),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={`/watch?v=${id}`} className="group block min-w-0 hover:text-ink">
      <div
        className="relative aspect-video overflow-hidden rounded-[18px] border border-line transition-transform duration-200 group-hover:-translate-y-0.5"
        style={thumbnail ? undefined : { background: gradientFor(id) }}
      >
        {thumbnail && (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(110% 80% at 80% 0%, rgba(255,255,255,.16), transparent 55%), linear-gradient(0deg, rgba(0,0,0,.42), transparent 55%)',
          }}
        />

        {tag && (
          <span
            className={`absolute left-2.5 top-2.5 rounded-md px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.1em] backdrop-blur-[5px] ${
              isLive ? 'bg-accent text-accent-ink' : 'bg-black/45 text-white'
            }`}
          >
            {tag}
          </span>
        )}

        {duration && !isLive && (
          <span className="absolute bottom-2.5 right-2.5 rounded-md bg-black/65 px-[7px] py-[3px] font-mono text-[10.5px] text-white">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 px-0.5 pt-[13px]">
        <ChannelAvatar src={avatar} name={channel} size={36} radius="rounded-[11px]" />
        <div className="min-w-0">
          <h3 className="mb-1.5 text-[15.5px] font-semibold leading-[1.28] tracking-[-0.01em] text-ink text-pretty">
            {snippet.title}
          </h3>
          <div className="text-[12.5px] leading-[1.5] text-muted">
            {channel}
            {meta && (
              <>
                <br />
                {meta}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;

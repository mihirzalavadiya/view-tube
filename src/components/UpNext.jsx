import React from 'react';
import Link from 'next/link';
import {
  bestThumbnail,
  formatCompact,
  formatDuration,
  formatTimeAgo,
  gradientFor,
  videoIdOf,
} from '@/utils/format';

const UpNext = ({ videos = [], autoplay, onToggleAutoplay }) => {
  if (videos.length === 0) return null;

  return (
    <aside className="min-w-0 lg:max-w-[372px]">
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink">Up next</h2>
        <button
          type="button"
          onClick={onToggleAutoplay}
          aria-pressed={autoplay}
          className={`rounded-full border px-[9px] py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors duration-200 ${
            autoplay
              ? 'border-accent bg-accent text-accent-ink'
              : 'border-line text-muted hover:text-ink'
          }`}
        >
          Autoplay
        </button>
      </div>

      <div className="flex flex-col gap-[11px]">
        {videos.slice(0, 7).map((video) => {
          const id = videoIdOf(video);
          const snippet = video?.snippet;
          if (!id || !snippet) return null;

          const thumbnail = bestThumbnail(video);
          const duration = video?.contentDetails?.duration;
          const views = video?.statistics?.viewCount;
          const isLive = snippet.liveBroadcastContent === 'live';
          const meta = [
            views ? `${formatCompact(views)} views` : null,
            formatTimeAgo(snippet.publishedAt),
          ]
            .filter(Boolean)
            .join(' · ');

          return (
            <Link
              key={id}
              href={`/watch?v=${id}`}
              className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 rounded-[14px] p-2 transition-colors duration-200 hover:bg-surface hover:text-ink"
            >
              <div
                className="relative aspect-[16/10] overflow-hidden rounded-[10px]"
                style={thumbnail ? undefined : { background: gradientFor(id) }}
              >
                {thumbnail && (
                  <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
                {duration && !isLive && (
                  <span className="absolute bottom-[5px] right-[5px] rounded bg-black/65 px-[5px] py-0.5 font-mono text-[9.5px] text-white">
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-[5px] line-clamp-2 text-[13.5px] font-semibold leading-[1.3] text-ink">
                  {snippet.title}
                </div>
                <div className="truncate text-[11.5px] text-muted">
                  {snippet.channelTitle}
                  {meta && (
                    <>
                      <br />
                      {meta}
                    </>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default UpNext;

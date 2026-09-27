import React, { useState } from 'react';
import ShortsViewer from './ShortsViewer';
import useShorts from '@/hooks/useShorts';
import {
  bestThumbnail,
  formatCompact,
  gradientFor,
  videoIdOf,
} from '@/utils/format';

const ShortsGrid = () => {
  const { shorts, loading, error, refetch } = useShorts();
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <main className="vt-rise px-[18px] pb-[70px] pt-[30px] md:px-[34px]">
      <h1 className="mb-1.5 font-display text-[31px] font-bold tracking-[-0.03em] text-ink">
        Shorts
      </h1>
      <p className="mb-[26px] text-[14.5px] text-muted">
        Vertical, one-idea clips. Swipe the deck or open one full-screen.
      </p>

      {loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="vt-pulse aspect-[9/16] rounded-[20px] bg-surface2" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-3 py-20 text-center">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Something broke
          </div>
          <h2 className="font-display text-[20px] font-bold text-ink">
            Couldn&rsquo;t load shorts
          </h2>
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 rounded-full border border-line px-5 py-2.5 text-[13px] font-bold text-ink transition-colors hover:border-accent hover:text-accent-text"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && shorts.length === 0 && (
        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-3 py-20 text-center">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Empty
          </div>
          <h2 className="font-display text-[20px] font-bold text-ink">
            Nothing here yet
          </h2>
          <p className="text-sm text-muted">No shorts came back this time.</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-accent-ink"
          >
            Reload
          </button>
        </div>
      )}

      {!loading && !error && shorts.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-[18px] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {shorts.map((short, index) => {
            const id = videoIdOf(short);
            const snippet = short?.snippet;
            if (!id || !snippet) return null;

            const thumbnail = bestThumbnail(short);
            const views = short?.statistics?.viewCount;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setOpenIndex(index)}
                className="vt-lift-lg relative aspect-[9/16] overflow-hidden rounded-[20px] border border-line text-left"
                style={{ background: gradientFor(id) }}
              >
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(0deg, rgba(0,0,0,.78) 6%, transparent 55%)',
                  }}
                />
                <div className="absolute inset-x-3.5 bottom-3.5 text-white">
                  <div className="mb-[7px] line-clamp-3 font-display text-[17px] font-bold leading-[1.15] tracking-[-0.02em]">
                    {snippet.title}
                  </div>
                  {views && (
                    <div className="font-mono text-[11.5px] opacity-80">
                      {formatCompact(views)} views
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {openIndex !== null && (
        <ShortsViewer
          shorts={shorts}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </main>
  );
};

export default ShortsGrid;

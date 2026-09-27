import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiBookmark,
  FiHeart,
  FiShare2,
  FiVolume2,
  FiVolumeX,
  FiX,
} from 'react-icons/fi';
import useLocalSet from '@/hooks/useLocalSet';
import useChannelAvatars from '@/hooks/useChannelAvatars';
import ChannelAvatar from './ChannelAvatar';
import {
  bestThumbnail,
  formatCompact,
  gradientFor,
  videoIdOf,
} from '@/utils/format';

// Sized from viewport units rather than a chain of percentage heights — a
// percentage height that fails to resolve leaves aspect-ratio deriving height
// from width, which makes a 9/16 card taller than the screen.
const CARD_STYLE = {
  height: 'min(calc(100dvh - 32px), 900px)',
  maxWidth: 'calc(100vw - 32px)',
  aspectRatio: '9 / 16',
};

const ActionButton = ({ label, active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active === undefined ? undefined : active}
    aria-label={label}
    className="grid h-11 w-11 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65"
  >
    {children}
  </button>
);

/**
 * Full-screen shorts deck: one 9/16 player centred on --bg with vertical snap
 * scrolling. Rendered through a portal so the overlay covers the rail and top
 * bar (the design hides both here) regardless of where it is mounted.
 *
 * Only the slide in view mounts an iframe — the rest show their poster, so we
 * aren't running every player at once.
 */
const ShortsViewer = ({ shorts, startIndex, onClose }) => {
  const scrollerRef = useRef(null);
  const slideRefs = useRef([]);
  const frameRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);

  const saved = useLocalSet('vt-saved');
  const liked = useLocalSet('vt-liked');
  const subscriptions = useLocalSet('vt-subscriptions');

  const channelIds = useMemo(
    () => shorts.map((s) => s?.snippet?.channelId).filter(Boolean),
    [shorts]
  );
  const avatars = useChannelAvatars(channelIds);

  useEffect(() => setMounted(true), []);

  // Jump straight to the tapped short instead of animating past everything
  // before it.
  useEffect(() => {
    if (!mounted) return;
    slideRefs.current[startIndex]?.scrollIntoView({ block: 'start' });
  }, [mounted, startIndex]);

  useEffect(() => {
    if (!mounted) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = slideRefs.current.indexOf(entry.target);
            if (index !== -1) setActiveIndex(index);
          }
        });
      },
      { root: scrollerRef.current, threshold: 0.6 }
    );

    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [mounted, shorts.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  // Autoplay only survives if the clip starts muted, so sound is opt-in.
  const toggleMute = () => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(
      JSON.stringify({
        event: 'command',
        func: muted ? 'unMute' : 'mute',
        args: [],
      }),
      '*'
    );
    setMuted((m) => !m);
  };

  const share = async (id, title) => {
    const url = `${window.location.origin}/watch?v=${id}`;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else await navigator.clipboard.writeText(url);
    } catch (e) {
      // dismissed or blocked
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Shorts"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close shorts"
        className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-line bg-bg text-ink transition-colors hover:border-accent hover:text-accent-text"
      >
        <FiX size={20} aria-hidden="true" />
      </button>

      <div
        ref={scrollerRef}
        className="no-scrollbar h-[100dvh] snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {shorts.map((short, index) => {
          const id = videoIdOf(short);
          const snippet = short?.snippet;
          if (!id || !snippet) return null;

          const isActive = index === activeIndex;
          const thumbnail = bestThumbnail(short);
          const views = short?.statistics?.viewCount;
          const isSubscribed = subscriptions.has(snippet.channelId);

          return (
            <section
              key={id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="flex h-[100dvh] snap-start items-center justify-center"
            >
              <div
                className="relative overflow-hidden rounded-[20px] border border-line"
                style={{ ...CARD_STYLE, background: gradientFor(id) }}
              >
                {isActive ? (
                  <iframe
                    ref={frameRef}
                    title={snippet.title}
                    // controls=0 keeps YouTube's own chrome out of the design;
                    // mute=1 is what lets autoplay actually start.
                    src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                ) : (
                  thumbnail && (
                    <img
                      src={thumbnail}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )
                )}

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                  style={{
                    background:
                      'linear-gradient(0deg, rgba(0,0,0,.82) 10%, transparent 100%)',
                  }}
                />

                {/* Right-side action column, overlaid so it stays on the card
                    at every width. */}
                <div className="absolute bottom-28 right-3 flex flex-col items-center gap-3">
                  <ActionButton
                    label="Like"
                    active={liked.has(id)}
                    onClick={() => liked.toggle(id)}
                  >
                    <FiHeart
                      size={18}
                      className={liked.has(id) ? 'text-accent' : ''}
                      fill={liked.has(id) ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </ActionButton>
                  {views && (
                    <span className="-mt-1.5 font-mono text-[10px] text-white/80">
                      {formatCompact(views)}
                    </span>
                  )}

                  <ActionButton
                    label="Save"
                    active={saved.has(id)}
                    onClick={() => saved.toggle(id)}
                  >
                    <FiBookmark
                      size={18}
                      className={saved.has(id) ? 'text-accent' : ''}
                      fill={saved.has(id) ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </ActionButton>

                  <ActionButton label="Share" onClick={() => share(id, snippet.title)}>
                    <FiShare2 size={18} aria-hidden="true" />
                  </ActionButton>

                  {isActive && (
                    <ActionButton
                      label={muted ? 'Unmute' : 'Mute'}
                      active={!muted}
                      onClick={toggleMute}
                    >
                      {muted ? (
                        <FiVolumeX size={18} aria-hidden="true" />
                      ) : (
                        <FiVolume2 size={18} className="text-accent" aria-hidden="true" />
                      )}
                    </ActionButton>
                  )}
                </div>

                <div className="pointer-events-none absolute inset-x-3.5 bottom-3.5 pr-16 text-white">
                  <div className="mb-2 line-clamp-2 font-display text-[17px] font-bold leading-[1.15] tracking-[-0.02em]">
                    {snippet.title}
                  </div>
                  <div className="pointer-events-auto flex flex-wrap items-center gap-2.5">
                    <ChannelAvatar
                      src={avatars[snippet.channelId]?.avatar}
                      name={snippet.channelTitle}
                      size={28}
                      radius="rounded-full"
                    />
                    <span className="truncate text-[12px] font-semibold">
                      {snippet.channelTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => subscriptions.toggle(snippet.channelId)}
                      aria-pressed={isSubscribed}
                      className={`shrink-0 rounded-full border px-3 py-1 text-[11.5px] font-bold transition-colors ${
                        isSubscribed
                          ? 'border-white/40 text-white'
                          : 'border-accent bg-accent text-accent-ink'
                      }`}
                    >
                      {isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>,
    document.body
  );
};

export default ShortsViewer;

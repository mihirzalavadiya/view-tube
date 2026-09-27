import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiMaximize, FiPause, FiPlay } from 'react-icons/fi';
import { secondsToClock } from '@/utils/format';

/**
 * The design hides YouTube's own chrome and draws its own control bar, so the
 * embed is driven through the IFrame API (see useYouTubePlayer).
 *
 * Sponsor/self-promo segments render as pale bands on the track and, while
 * the playhead is inside one, a "Skip sponsor" pill. They come from
 * useSponsorSegments and are absent when there is no data.
 *
 * Controls the spec shows that are NOT here: the CC and "HD 1440p" readouts.
 * The IFrame API cannot reliably toggle captions or report/set quality, so
 * rendering them would give two buttons that do nothing.
 */
const VideoPlayer = ({ player, title, segments = [] }) => {
  const shellRef = useRef(null);
  const trackRef = useRef(null);
  const [skippedKeys, setSkippedKeys] = useState(() => new Set());

  const {
    hostRef,
    ready,
    failed,
    playing,
    currentTime,
    duration,
    rate,
    canChangeRate,
    togglePlay,
    seekTo,
    nudge,
    cycleRate,
  } = player;

  const pct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const activeSegment = useMemo(
    () => segments.find((s) => currentTime >= s.start && currentTime < s.end) || null,
    [segments, currentTime]
  );
  const activeKey = activeSegment ? `${activeSegment.start}-${activeSegment.end}` : null;
  const activeSkipped = activeKey ? skippedKeys.has(activeKey) : false;

  const skipActive = useCallback(() => {
    if (!activeSegment) return;
    seekTo(activeSegment.end);
    setSkippedKeys((prev) => new Set(prev).add(activeKey));
  }, [activeSegment, activeKey, seekTo]);

  // New video → forget which segments were skipped on the last one.
  useEffect(() => {
    setSkippedKeys(new Set());
  }, [segments]);

  const seekFromPointer = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (!el || !duration) return;
      const { left, width } = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - left) / width));
      seekTo(ratio * duration);
    },
    [duration, seekTo]
  );

  const toggleFullscreen = useCallback(() => {
    const el = shellRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  }, []);

  // Keyboard shortcuts from the design spec
  useEffect(() => {
    const onKey = (event) => {
      const el = document.activeElement;
      const typing =
        el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (typing || !ready) return;

      if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nudge(-5);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nudge(5);
      } else if (event.key === 'f') {
        event.preventDefault();
        toggleFullscreen();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ready, togglePlay, nudge, toggleFullscreen]);

  if (failed) {
    return (
      <div className="grid aspect-video place-items-center rounded-[22px] border border-line bg-surface px-6 text-center">
        <div>
          <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
            Playback
          </div>
          <p className="font-display text-[20px] font-bold text-ink">
            This video can&rsquo;t be played here
          </p>
          <p className="mt-2 text-sm text-muted">The owner may have disabled embedding.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={shellRef}
      className="relative aspect-video overflow-hidden rounded-[22px] border border-line bg-black"
    >
      <div ref={hostRef} className="absolute inset-0 h-full w-full" />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className={`group absolute inset-0 grid place-items-center transition-opacity duration-200 ${
          playing ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 70% at 50% 40%, rgba(0,0,0,.25), rgba(0,0,0,.6))',
          }}
        />
        <span className="relative grid h-[78px] w-[78px] place-items-center rounded-full bg-accent text-accent-ink shadow-[0_10px_40px_rgba(0,0,0,.5)]">
          {playing ? (
            <FiPause size={26} fill="currentColor" aria-hidden="true" />
          ) : (
            <FiPlay size={26} fill="currentColor" className="ml-1" aria-hidden="true" />
          )}
        </span>
      </button>

      <div className="pointer-events-none absolute inset-x-[18px] bottom-4">
        {activeSegment && (
          <button
            type="button"
            onClick={skipActive}
            disabled={activeSkipped}
            className={`pointer-events-auto absolute bottom-[42px] right-0 rounded-full px-3.5 py-2 text-[12.5px] font-bold backdrop-blur-[6px] transition-colors ${
              activeSkipped ? 'bg-black/55 text-white' : 'bg-accent text-accent-ink'
            }`}
          >
            {activeSkipped
              ? `${activeSegment.label} skipped`
              : `Skip ${activeSegment.label.toLowerCase()} · ${secondsToClock(
                  activeSegment.end - currentTime
                )}`}
          </button>
        )}

        <div
          ref={trackRef}
          role="slider"
          tabIndex={0}
          aria-label={`Seek ${title || 'video'}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={`${secondsToClock(currentTime)} of ${secondsToClock(duration)}`}
          onMouseDown={(e) => seekFromPointer(e.clientX)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') nudge(-5);
            if (e.key === 'ArrowRight') nudge(5);
          }}
          className="pointer-events-auto relative mb-[11px] h-[5px] cursor-pointer rounded-[5px] bg-white/25"
        >
          {duration > 0 &&
            segments.map((s) => (
              <span
                key={`${s.start}-${s.end}`}
                title={s.label}
                className="absolute inset-y-0 rounded-sm bg-white/55"
                style={{
                  left: `${(s.start / duration) * 100}%`,
                  width: `${Math.max(0.5, ((s.end - s.start) / duration) * 100)}%`,
                }}
              />
            ))}
          <div className="relative h-full rounded-[5px] bg-accent" style={{ width: `${pct}%` }} />
          <div
            className="absolute top-[-4px] h-[13px] w-[13px] -translate-x-1/2 rounded-full bg-accent"
            style={{ left: `${pct}%` }}
          />
        </div>

        <div className="pointer-events-auto flex items-center gap-4 font-mono text-xs text-white">
          <span>
            {secondsToClock(currentTime)} / {secondsToClock(duration)}
          </span>
          {canChangeRate && (
            <button
              type="button"
              onClick={cycleRate}
              aria-label={`Playback speed ${rate}x`}
              className="opacity-75 transition-opacity hover:opacity-100"
            >
              {rate}×
            </button>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
            className="ml-auto opacity-75 transition-opacity hover:opacity-100"
          >
            <FiMaximize size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

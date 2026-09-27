import { useCallback, useEffect, useRef, useState } from 'react';

// The design replaces YouTube's own chrome with a custom control bar, so the
// player has to be driven through the IFrame API rather than a plain <iframe>.
let apiPromise = null;

const loadApi = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous();
      resolve(window.YT);
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      apiPromise = null;
      reject(new Error('Failed to load the YouTube player'));
    };
    document.head.appendChild(script);
  });

  return apiPromise;
};

export default function useYouTubePlayer(videoId, { onProgress, onEnded } = {}) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const onProgressRef = useRef(onProgress);
  const onEndedRef = useRef(onEnded);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [rates, setRates] = useState([1]);

  // Keep the callbacks fresh without tearing down the player on every render.
  useEffect(() => {
    onProgressRef.current = onProgress;
    onEndedRef.current = onEnded;
  }, [onProgress, onEnded]);

  useEffect(() => {
    if (!videoId || !hostRef.current) return undefined;

    let cancelled = false;
    let poll = null;

    setReady(false);
    setFailed(false);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    loadApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;

        // YT.Player REPLACES the element it is given. Handing it a
        // React-rendered node makes React and the DOM disagree, and under
        // StrictMode's double-invoked effects the second player attaches to a
        // detached node — a black frame stuck at 0:00. So mount onto a plain
        // child we create and throw away ourselves.
        const mountPoint = document.createElement('div');
        mountPoint.style.width = '100%';
        mountPoint.style.height = '100%';
        hostRef.current.appendChild(mountPoint);

        playerRef.current = new YT.Player(mountPoint, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;

              // The generated iframe carries its own width/height attributes.
              const frame = event.target.getIframe?.();
              if (frame) {
                frame.style.width = '100%';
                frame.style.height = '100%';
                frame.style.display = 'block';
              }

              setReady(true);
              setDuration(event.target.getDuration() || 0);
              setRates(event.target.getAvailablePlaybackRates?.() || [1]);
              setRate(event.target.getPlaybackRate?.() || 1);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const isPlaying = event.data === YT.PlayerState.PLAYING;
              setPlaying(isPlaying);
              if (event.data === YT.PlayerState.ENDED) {
                setPlaying(false);
                onEndedRef.current?.();
              }
              const d = event.target.getDuration?.() || 0;
              if (d) setDuration(d);
            },
            onPlaybackRateChange: (event) => {
              if (!cancelled) setRate(event.data);
            },
            onError: () => {
              if (!cancelled) setFailed(true);
            },
          },
        });

        poll = setInterval(() => {
          const p = playerRef.current;
          if (!p?.getCurrentTime) return;
          const t = p.getCurrentTime() || 0;
          const d = p.getDuration() || 0;
          setCurrentTime(t);
          if (d) setDuration(d);
          onProgressRef.current?.({ positionSec: t, durationSec: d });
        }, 1000);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    const host = hostRef.current;

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      try {
        playerRef.current?.destroy?.();
      } catch (e) {
        // player already gone
      }
      playerRef.current = null;
      // Clear whatever the API left behind; React never owned these nodes.
      if (host) host.replaceChildren();
    };
  }, [videoId]);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo();
    else p.playVideo();
  }, [playing]);

  const seekTo = useCallback((seconds) => {
    const p = playerRef.current;
    if (!p?.seekTo) return;
    p.seekTo(Math.max(0, seconds), true);
    setCurrentTime(Math.max(0, seconds));
  }, []);

  const nudge = useCallback(
    (delta) => seekTo((playerRef.current?.getCurrentTime?.() || 0) + delta),
    [seekTo]
  );

  const cycleRate = useCallback(() => {
    const p = playerRef.current;
    if (!p?.setPlaybackRate || rates.length < 2) return;
    const next = rates[(rates.indexOf(rate) + 1) % rates.length];
    p.setPlaybackRate(next);
    setRate(next);
  }, [rate, rates]);

  return {
    hostRef,
    ready,
    failed,
    playing,
    currentTime,
    duration,
    rate,
    canChangeRate: rates.length > 1,
    togglePlay,
    seekTo,
    nudge,
    cycleRate,
  };
}

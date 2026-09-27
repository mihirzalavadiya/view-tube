import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiArrowLeft, FiBookmark, FiHeart, FiShare2 } from 'react-icons/fi';
import VideoPlayer from './VideoPlayer';
import UpNext from './UpNext';
import WatchTabs from './WatchTabs';
import { CommentsPanel } from './CommentsSection';
import LiveChatPanel from './LiveChatPanel';
import ChannelAvatar from './ChannelAvatar';
import useYouTubeVideo from '@/hooks/useYouTubeVideo';
import useYouTubePlayer from '@/hooks/useYouTubePlayer';
import useYouTubeComments from '@/hooks/useYouTubeComments';
import useWatchHistory from '@/hooks/useWatchHistory';
import useWatchBudget from '@/hooks/useWatchBudget';
import useSponsorSegments from '@/hooks/useSponsorSegments';
import useVideoNotes from '@/hooks/useVideoNotes';
import useChannel from '@/hooks/useChannel';
import useLocalSet from '@/hooks/useLocalSet';
import useVideos from '@/hooks/useVideos';
import { bestThumbnail, formatCompact, formatTimeAgo, videoIdOf } from '@/utils/format';
import { buildDigest, buildKeyMoments } from '@/utils/comments';

const WatchPage = () => {
  const router = useRouter();
  const { v: videoId } = router.query;

  const { videoData, loading, error } = useYouTubeVideo(videoId);
  const { videos } = useVideos();
  const comments = useYouTubeComments(videoId);
  const { recordProgress } = useWatchHistory();
  const budget = useWatchBudget();
  const segments = useSponsorSegments(videoId);
  const notes = useVideoNotes(videoId);

  const subscriptions = useLocalSet('vt-subscriptions');
  const saved = useLocalSet('vt-saved');
  const liked = useLocalSet('vt-liked');
  const prefs = useLocalSet('vt-prefs');

  const [shareNote, setShareNote] = useState('');

  const snippet = videoData?.snippet;
  const statistics = videoData?.statistics;
  const channel = useChannel(snippet?.channelId);

  const upNext = useMemo(
    () => (videos || []).filter((item) => videoIdOf(item) !== videoId),
    [videos, videoId]
  );

  const autoplay = prefs.has('autoplay');
  const autoplayRef = useRef(autoplay);
  autoplayRef.current = autoplay;
  const upNextRef = useRef(upNext);
  upNextRef.current = upNext;
  const budgetSpentRef = useRef(budget.spent);
  budgetSpentRef.current = budget.spent;

  // "After that the feed goes quiet instead of autoplaying" — the budget is
  // the one thing that overrides the autoplay toggle.
  const handleEnded = useCallback(() => {
    if (!autoplayRef.current || budgetSpentRef.current) return;
    const next = videoIdOf(upNextRef.current[0]);
    if (next) router.push(`/watch?v=${next}`);
  }, [router]);

  const metaRef = useRef(null);
  metaRef.current = snippet
    ? {
        id: videoId,
        title: snippet.title,
        channel: snippet.channelTitle,
        channelId: snippet.channelId,
        thumbnail: bestThumbnail(videoData),
      }
    : null;

  const playingRef = useRef(false);

  const handleProgress = useCallback(
    ({ positionSec, durationSec }) => {
      budget.record(positionSec, playingRef.current);
      if (!metaRef.current || !durationSec) return;
      recordProgress({ ...metaRef.current, positionSec, durationSec });
    },
    [recordProgress, budget]
  );

  const player = useYouTubePlayer(videoId, {
    onProgress: handleProgress,
    onEnded: handleEnded,
  });
  playingRef.current = player.playing;

  useEffect(() => {
    budget.resetPosition();
  }, [videoId, budget]);

  const keyMoments = useMemo(
    () => buildKeyMoments(snippet?.description, comments.allComments, player.duration),
    [snippet?.description, comments.allComments, player.duration]
  );

  const digest = useMemo(
    () => buildDigest(comments.allComments, snippet?.channelId),
    [comments.allComments, snippet?.channelId]
  );

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: snippet?.title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote('Link copied');
    } catch (e) {
      // dismissed, or clipboard blocked
    }
  }, [snippet?.title]);

  useEffect(() => {
    if (!shareNote) return undefined;
    const t = setTimeout(() => setShareNote(''), 2000);
    return () => clearTimeout(t);
  }, [shareNote]);

  if (loading) {
    return (
      <main className="px-[18px] pb-[70px] pt-[26px] md:px-[34px]">
        <div className="vt-pulse grid gap-[30px] lg:grid-cols-[minmax(0,1fr)_372px]">
          <div>
            <div className="aspect-video rounded-[22px] bg-surface2" />
            <div className="mt-6 h-8 w-3/4 rounded bg-surface2" />
            <div className="mt-4 h-14 rounded bg-surface2" />
          </div>
          <div className="hidden gap-3 lg:flex lg:flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 rounded-[14px] bg-surface2" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error || !videoData) {
    return (
      <main className="mx-auto flex max-w-[420px] flex-col items-center gap-3 px-[18px] py-24 text-center">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
          Not found
        </div>
        <h1 className="font-display text-[20px] font-bold text-ink">
          This video isn&rsquo;t available
        </h1>
        <p className="text-sm text-muted">
          {error || 'It may have been removed or made private.'}
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-accent px-5 py-2.5 text-[13px] font-bold text-accent-ink"
        >
          Back to feed
        </Link>
      </main>
    );
  }

  const isSubscribed = subscriptions.has(snippet.channelId);
  const isSaved = saved.has(videoId);
  const isLiked = liked.has(videoId);
  const topics = (snippet.tags || []).slice(0, 6);
  const isLive = snippet.liveBroadcastContent === 'live';

  const subscriberCount = channel?.statistics?.hiddenSubscriberCount
    ? null
    : channel?.statistics?.subscriberCount;
  const videoCount = channel?.statistics?.videoCount;
  const channelMeta = [
    subscriberCount ? `${formatCompact(subscriberCount)} subscribers` : null,
    videoCount ? `${formatCompact(videoCount)} videos` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const pill =
    'flex items-center gap-[7px] rounded-full bg-surface2 px-[15px] py-2.5 text-[13px] font-semibold text-ink transition-colors duration-200 hover:bg-surface3';

  return (
    <main className="vt-rise grid gap-[30px] px-[18px] pb-[70px] pt-[26px] md:px-[34px] lg:grid-cols-[minmax(0,1fr)_372px]">
      <div className="min-w-0">
        <Link
          href="/"
          className="mb-3.5 inline-flex items-center gap-2 text-[12.5px] font-semibold text-muted hover:text-accent-text"
        >
          <FiArrowLeft size={14} aria-hidden="true" />
          Back to feed
        </Link>

        <VideoPlayer player={player} title={snippet.title} segments={segments} />

        <h1 className="mb-3.5 mt-[22px] font-display text-[27px] font-bold leading-[1.06] tracking-[-0.035em] text-ink text-balance md:text-[33px]">
          {snippet.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 border-b border-line pb-5">
          <div className="flex items-center gap-[11px]">
            <ChannelAvatar
              src={
                channel?.snippet?.thumbnails?.medium?.url ||
                channel?.snippet?.thumbnails?.default?.url
              }
              name={snippet.channelTitle}
              size={44}
              radius="rounded-[13px]"
            />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-bold text-ink">{snippet.channelTitle}</div>
              {channelMeta && <div className="text-xs text-muted">{channelMeta}</div>}
            </div>
          </div>

          <button
            type="button"
            onClick={() => subscriptions.toggle(snippet.channelId)}
            aria-pressed={isSubscribed}
            className={`rounded-full border px-5 py-[11px] text-[13.5px] font-bold transition-colors duration-200 ${
              isSubscribed
                ? 'border-line-strong bg-transparent text-ink'
                : 'border-accent bg-accent text-accent-ink'
            }`}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>

          <div className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={() => liked.toggle(videoId)} aria-pressed={isLiked} className={pill}>
              <FiHeart size={14} className="text-accent-text" fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
              {statistics?.likeCount ? formatCompact(statistics.likeCount) : 'Like'}
            </button>
            <button type="button" onClick={handleShare} className={pill}>
              <FiShare2 size={14} className="text-accent-text" aria-hidden="true" />
              {shareNote || 'Share'}
            </button>
            <button type="button" onClick={() => saved.toggle(videoId)} aria-pressed={isSaved} className={pill}>
              <FiBookmark size={14} className="text-accent-text" fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        <div className="mt-[22px] flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted">
          {statistics?.viewCount && (
            <span>
              {formatCompact(statistics.viewCount)} {isLive ? 'watching' : 'views'}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>{formatTimeAgo(snippet.publishedAt)}</span>
        </div>

        <div className="mt-3">
          <WatchTabs
            keyMoments={keyMoments}
            digest={digest}
            notes={notes}
            topics={topics}
            currentTime={player.currentTime}
            videoTitle={snippet.title}
            onSeek={player.seekTo}
          />
        </div>

        <div className="mt-[22px] rounded-[18px] border border-line bg-surface p-5">
          <CommentsPanel comments={comments} />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[30px]">
        <LiveChatPanel videoId={videoId} />
        <UpNext
          videos={upNext}
          autoplay={autoplay}
          onToggleAutoplay={() => prefs.toggle('autoplay')}
        />
      </div>
    </main>
  );
};

export default WatchPage;

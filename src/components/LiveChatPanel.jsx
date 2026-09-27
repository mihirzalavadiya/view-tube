import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSend } from 'react-icons/fi';
import LiveChat from './LiveChat';
import { addMessages, resetChat } from '@/redux/slice/liveChatSlice';

const POLL_MS = 20000;
const MAX_LENGTH = 200;

/**
 * Live chat isn't in the redesign (it has no live-stream screen), so it reuses
 * the panel treatment from the watch-page spec: --surface, radius 18, 1px
 * --line. The whole panel is absent unless the video actually has a chat.
 */
const LiveChatPanel = ({ videoId }) => {
  const dispatch = useDispatch();
  const messages = useSelector((store) => store.livechat.messages);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!videoId) return undefined;

    let cancelled = false;
    dispatch(resetChat());

    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/livechat?videoId=${videoId}`);
        const data = await res.json();
        if (cancelled || !Array.isArray(data?.items)) return;

        dispatch(
          addMessages(
            data.items.map((item) => ({
              id: item.id,
              avatar: item.authorDetails?.profileImageUrl,
              username: item.authorDetails?.displayName,
              message:
                item.snippet?.displayMessage ||
                item.snippet?.textMessageDetails?.messageText,
              timestamp: item.snippet?.publishedAt,
              isOwner: item.authorDetails?.isChatOwner,
              isModerator: item.authorDetails?.isChatModerator,
              isSponsor: item.authorDetails?.isChatSponsor,
              isVerified: item.authorDetails?.isVerified,
            }))
          )
        );
      } catch (e) {
        // Not a live video, or chat is disabled — the panel simply stays hidden.
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [videoId, dispatch]);

  const send = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    // Local echo only — posting to YouTube's live chat needs OAuth, which this
    // app doesn't have.
    dispatch(
      addMessages({
        id: `local_${Date.now()}`,
        avatar: '',
        username: 'You',
        message: text,
        timestamp: new Date().toISOString(),
      })
    );
    setDraft('');
  };

  if (messages.length === 0) return null;

  return (
    <section className="flex max-h-[520px] flex-col rounded-[18px] border border-line bg-surface p-[18px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-ink">Live chat</h2>
        <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-accent-ink">
          Live
        </span>
      </div>

      <LiveChat />

      <form onSubmit={send} className="mt-3 border-t border-line pt-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Say something…"
            maxLength={MAX_LENGTH}
            aria-label="Live chat message"
            className="min-w-0 flex-1 rounded-full bg-surface2 px-3.5 py-2 text-[13px] text-ink outline-none placeholder:text-muted focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send message"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiSend size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-1 text-right font-mono text-[10px] text-muted">
          {draft.length}/{MAX_LENGTH}
        </div>
      </form>
    </section>
  );
};

export default LiveChatPanel;

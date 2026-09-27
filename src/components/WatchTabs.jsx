import React, { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { secondsToClock } from '@/utils/format';
import { stripHtml } from '@/utils/comments';

const TABS = ['Key moments', 'Notes', 'Discussion'];

const Empty = ({ children }) => (
  <p className="rounded-xl bg-surface2 px-3.5 py-3 text-[13px] text-muted">{children}</p>
);

/**
 * The watch page's info panel: Key moments / Notes / Discussion, all built
 * from real data — description chapters, comment threads, and the viewer's
 * own notes. Nothing here is generated.
 */
const WatchTabs = ({
  keyMoments = [],
  digest = [],
  notes,
  topics = [],
  currentTime = 0,
  videoTitle,
  onSeek,
}) => {
  const [tab, setTab] = useState(TABS[0]);
  const [draft, setDraft] = useState('');
  const [openDigest, setOpenDigest] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const stamp = secondsToClock(currentTime);

  const saveNote = () => {
    if (!draft.trim()) return;
    notes.add(draft, currentTime);
    setDraft('');
  };

  const exportNotes = async () => {
    try {
      await navigator.clipboard.writeText(notes.toMarkdown(videoTitle));
      setCopied(true);
    } catch (e) {
      // clipboard blocked
    }
  };

  return (
    <div className="rounded-[18px] border border-line bg-surface p-5">
      <div
        role="tablist"
        className="mb-4 flex flex-wrap gap-4 font-mono text-[10.5px] uppercase tracking-[0.14em]"
      >
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={tab === label}
            onClick={() => setTab(label)}
            className={`transition-colors ${
              tab === label ? 'text-accent-text' : 'text-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'Key moments' && (
        <>
          <p className="mb-3.5 max-w-[60ch] text-[13.5px] leading-[1.6] text-muted">
            Built from the creator&rsquo;s own timestamps plus where viewers
            comment most — tap one to jump. Nothing is generated.
          </p>
          {keyMoments.length === 0 ? (
            <Empty>
              No chapters in the description yet, and viewers haven&rsquo;t pointed
              at specific moments in the comments.
            </Empty>
          ) : (
            <div className="flex flex-col gap-2">
              {keyMoments.map((moment) => (
                <button
                  key={`${moment.seconds}-${moment.source}`}
                  type="button"
                  onClick={() => onSeek(moment.seconds)}
                  className="grid grid-cols-[54px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-surface2 px-3 py-2.5 text-left transition-colors hover:bg-surface3"
                >
                  <span className="font-mono text-xs text-accent-text">{moment.time}</span>
                  <span className="text-[13.5px] font-semibold leading-[1.3] text-ink">
                    {moment.label}
                  </span>
                  <span className="whitespace-nowrap text-[11px] text-muted">
                    {moment.source}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'Notes' && (
        <>
          <p className="mb-3.5 max-w-[60ch] text-[13.5px] leading-[1.6] text-muted">
            Private, timestamped notes — they stay on this device and export as
            Markdown with links back to the second.
          </p>
          <div className="mb-3.5 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveNote()}
              placeholder={`Note at ${stamp}…`}
              aria-label="New note"
              className="min-w-0 flex-1 rounded-[11px] border border-line bg-surface2 px-[13px] py-2.5 text-[13.5px] text-ink outline-none placeholder:text-muted focus:border-accent"
            />
            <button
              type="button"
              onClick={saveNote}
              disabled={!draft.trim()}
              className="whitespace-nowrap rounded-[11px] bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Save at {stamp}
            </button>
          </div>

          {notes.notes.length === 0 ? (
            <Empty>No notes on this video yet.</Empty>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                {notes.notes.map((note) => (
                  <div
                    key={note.id}
                    className="group grid grid-cols-[54px_minmax(0,1fr)_auto] items-start gap-3 rounded-xl bg-surface2 px-3 py-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => onSeek(note.seconds)}
                      className="text-left font-mono text-xs text-accent-text hover:underline"
                    >
                      {note.time}
                    </button>
                    <span className="text-[13.5px] leading-[1.5] text-ink2">{note.text}</span>
                    <button
                      type="button"
                      onClick={() => notes.remove(note.id)}
                      aria-label="Delete note"
                      className="text-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <FiX size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={exportNotes}
                className="mt-3.5 text-[12.5px] font-semibold text-muted hover:text-accent-text"
              >
                {copied ? 'Copied as Markdown' : 'Export as Markdown'}
              </button>
            </>
          )}
        </>
      )}

      {tab === 'Discussion' && (
        <>
          <p className="mb-3.5 max-w-[60ch] text-[13.5px] leading-[1.6] text-muted">
            Comments grouped instead of dumped: threads the creator actually
            replied to, comments that point at a timestamp, and questions still
            open.
          </p>
          {digest.length === 0 ? (
            <Empty>Not enough comments to group yet.</Empty>
          ) : (
            <div className="flex flex-col gap-2.5">
              {digest.map((group) => {
                const open = openDigest === group.key;
                return (
                  <div key={group.key} className="rounded-[14px] bg-surface2">
                    <button
                      type="button"
                      onClick={() => setOpenDigest(open ? null : group.key)}
                      aria-expanded={open}
                      className="w-full px-[15px] py-[13px] text-left transition-colors hover:bg-surface3 rounded-[14px]"
                    >
                      <div className="mb-[5px] flex items-baseline gap-[9px]">
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent-text">
                          {group.kind}
                        </span>
                        <span className="font-mono text-[10px] text-muted">{group.count}</span>
                      </div>
                      <div className="text-[13.5px] leading-[1.5] text-ink2">{group.line}</div>
                    </button>

                    {open && (
                      <div className="flex flex-col gap-2 border-t border-line px-[15px] py-3">
                        {group.seekTo !== undefined && (
                          <button
                            type="button"
                            onClick={() => onSeek(group.seekTo)}
                            className="self-start font-mono text-xs text-accent-text hover:underline"
                          >
                            Jump to {secondsToClock(group.seekTo)}
                          </button>
                        )}
                        {group.threads.slice(0, 5).map((thread) => {
                          const c = thread.snippet.topLevelComment.snippet;
                          return (
                            <div key={thread.id} className="text-[13px] leading-[1.5]">
                              <span className="font-semibold text-ink">{c.authorDisplayName}</span>{' '}
                              <span className="text-ink2">{stripHtml(c.textDisplay, 220)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-[7px] border-t border-line pt-4">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-lg bg-accent-soft px-[11px] py-[5px] text-[11.5px] font-semibold text-ink"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchTabs;

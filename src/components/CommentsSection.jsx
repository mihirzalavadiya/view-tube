import React, { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import useYouTubeComments from '@/hooks/useYouTubeComments';
import { formatCompact, formatTimeAgo, initialsFor } from '@/utils/format';

const Avatar = ({ src, name, size = 36 }) =>
  src ? (
    <img
      src={src}
      alt=""
      loading="lazy"
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-surface3 text-[11px] font-bold text-ink"
    >
      {initialsFor(name)}
    </div>
  );

const Reply = ({ reply }) => {
  const snippet = reply.snippet;
  return (
    <div className="flex gap-3">
      <Avatar src={snippet.authorProfileImageUrl} name={snippet.authorDisplayName} size={28} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ink">
            {snippet.authorDisplayName}
          </span>
          <span className="font-mono text-[10px] text-muted">
            {formatTimeAgo(snippet.publishedAt)}
          </span>
        </div>
        <div
          className="text-[13px] leading-relaxed text-ink2"
          dangerouslySetInnerHTML={{ __html: snippet.textDisplay }}
        />
      </div>
    </div>
  );
};

/**
 * Presentational half. WatchPage owns the useYouTubeComments call so the same
 * threads also feed Key moments and the Discussion digest without a second
 * fetch; the default export below is the self-contained wrapper.
 */
export const CommentsPanel = ({ comments }) => {
  const {
    allComments,
    displayedComments,
    loading,
    error,
    sortBy,
    setSortBy,
    newComment,
    setNewComment,
    showCommentBox,
    setShowCommentBox,
    handleAddComment,
    handleLike,
    loadMoreComments,
    hasMoreComments,
  } = comments;

  const [expandedReplies, setExpandedReplies] = useState({});

  if (loading) {
    return (
      <div className="vt-pulse space-y-5">
        <div className="h-4 w-32 rounded bg-surface2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-9 w-9 rounded-full bg-surface2" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/4 rounded bg-surface2" />
              <div className="h-3 w-3/4 rounded bg-surface2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="py-4 text-sm text-muted">
        Comments couldn&rsquo;t be loaded. They may be turned off for this video.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">
          {allComments.length.toLocaleString()}{' '}
          {allComments.length === 1 ? 'Comment' : 'Comments'}
        </h2>

        <div className="flex items-center gap-1.5">
          {[
            { value: 'top', label: 'Top' },
            { value: 'newest', label: 'Newest' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortBy(option.value)}
              aria-pressed={sortBy === option.value}
              className={`rounded-[9px] px-[13px] py-[7px] text-[12.5px] font-semibold transition-colors duration-200 ${
                sortBy === option.value
                  ? 'bg-surface3 text-ink'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        <Avatar name="You" />
        <div className="flex-1">
          <textarea
            placeholder="Add a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setShowCommentBox(true)}
            rows={showCommentBox ? 3 : 1}
            aria-label="Add a comment"
            className="w-full resize-none border-0 border-b border-line bg-transparent p-2 text-[14px] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
          {showCommentBox && (
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCommentBox(false);
                  setNewComment('');
                }}
                className="rounded-full px-4 py-2 text-[13px] font-semibold text-muted hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {displayedComments.map((thread) => {
          const comment = thread.snippet.topLevelComment.snippet;
          const replies = thread.replies?.comments || [];
          const isOpen = expandedReplies[thread.id];
          const isLiked = comment.viewerRating === 'like';

          return (
            <div key={thread.id}>
              <div className="flex gap-3">
                <Avatar
                  src={comment.authorProfileImageUrl}
                  name={comment.authorDisplayName}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-ink">
                      {comment.authorDisplayName}
                    </span>
                    <span className="font-mono text-[10.5px] text-muted">
                      {formatTimeAgo(comment.publishedAt)}
                    </span>
                  </div>

                  <div
                    className="mb-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink2"
                    dangerouslySetInnerHTML={{ __html: comment.textDisplay }}
                  />

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleLike(thread.id)}
                      aria-pressed={isLiked}
                      aria-label="Like comment"
                      className="flex items-center gap-1.5 rounded-full bg-surface2 px-2.5 py-1 text-muted transition-colors hover:bg-surface3"
                    >
                      <FiHeart
                        size={12}
                        className={isLiked ? 'text-accent-text' : ''}
                        fill={isLiked ? 'currentColor' : 'none'}
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[10.5px]">
                        {formatCompact(comment.likeCount || 0)}
                      </span>
                    </button>

                    {replies.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReplies((prev) => ({
                            ...prev,
                            [thread.id]: !prev[thread.id],
                          }))
                        }
                        aria-expanded={Boolean(isOpen)}
                        className="text-[12px] font-semibold text-accent-text hover:underline"
                      >
                        {isOpen ? 'Hide' : 'View'} {replies.length}{' '}
                        {replies.length === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isOpen && replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4 border-l border-line pl-4">
                  {replies.map((reply) => (
                    <Reply key={reply.id} reply={reply} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMoreComments && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadMoreComments}
            className="rounded-full border border-line px-5 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent-text"
          >
            Show more comments
          </button>
        </div>
      )}
    </div>
  );
};

const CommentsSection = ({ videoId }) => (
  <CommentsPanel comments={useYouTubeComments(videoId)} />
);

export default CommentsSection;

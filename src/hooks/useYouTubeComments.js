import { useCallback, useEffect, useMemo, useState } from 'react';

const PER_PAGE = 5;

const topLevel = (thread) => thread?.snippet?.topLevelComment?.snippet || {};

export default function useYouTubeComments(videoId, commentsPerPage = PER_PAGE) {
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('top');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [visible, setVisible] = useState(commentsPerPage);

  useEffect(() => {
    if (!videoId) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setVisible(commentsPerPage);

    fetch(`/api/comments?videoId=${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setAllComments(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error fetching comments:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [videoId, commentsPerPage]);

  // Previously sortBy was stored but never applied, so the dropdown changed
  // its own label and nothing else.
  const sorted = useMemo(() => {
    const copy = [...allComments];
    if (sortBy === 'newest') {
      return copy.sort(
        (a, b) => new Date(topLevel(b).publishedAt || 0) - new Date(topLevel(a).publishedAt || 0)
      );
    }
    return copy.sort((a, b) => (topLevel(b).likeCount || 0) - (topLevel(a).likeCount || 0));
  }, [allComments, sortBy]);

  const displayedComments = useMemo(() => sorted.slice(0, visible), [sorted, visible]);

  const loadMoreComments = useCallback(
    () => setVisible((v) => v + commentsPerPage),
    [commentsPerPage]
  );

  // Local-only: posting to YouTube needs OAuth, which this app doesn't have.
  const handleAddComment = useCallback(() => {
    const text = newComment.trim();
    if (!text) return;

    setAllComments((prev) => [
      {
        id: `local_${Date.now()}`,
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: 'You',
              authorProfileImageUrl: null,
              textDisplay: text,
              publishedAt: new Date().toISOString(),
              likeCount: 0,
              viewerRating: 'none',
            },
          },
          totalReplyCount: 0,
        },
      },
      ...prev,
    ]);
    setNewComment('');
    setShowCommentBox(false);
    setVisible((v) => v + 1);
  }, [newComment]);

  const handleLike = useCallback((commentId) => {
    setAllComments((prev) =>
      prev.map((thread) => {
        if (thread.id !== commentId) return thread;
        const snippet = topLevel(thread);
        const isLiked = snippet.viewerRating === 'like';
        return {
          ...thread,
          snippet: {
            ...thread.snippet,
            topLevelComment: {
              ...thread.snippet.topLevelComment,
              snippet: {
                ...snippet,
                viewerRating: isLiked ? 'none' : 'like',
                likeCount: Math.max(0, (snippet.likeCount || 0) + (isLiked ? -1 : 1)),
              },
            },
          },
        };
      })
    );
  }, []);

  return {
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
    hasMoreComments: displayedComments.length < sorted.length,
  };
}

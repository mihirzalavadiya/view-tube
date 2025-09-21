import { useEffect, useState } from 'react';

export default function useYouTubeComments(videoId, commentsPerPage = 5) {
  const [allComments, setAllComments] = useState([]);
  const [displayedComments, setDisplayedComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState('top'); // 'top' | 'newest'
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!videoId) return;

    setLoading(true);
    fetch(`/api/comments?videoId=${videoId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.items) {
          setAllComments(data.items);
          setDisplayedComments(data.items.slice(0, commentsPerPage));
          setCurrentPage(1);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching comments:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [videoId, commentsPerPage]);

  // Load more
  const loadMoreComments = () => {
    const nextPage = currentPage + 1;
    const startIndex = currentPage * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const moreComments = allComments.slice(startIndex, endIndex);

    setDisplayedComments((prev) => [...prev, ...moreComments]);
    setCurrentPage(nextPage);
  };

  // Add new comment (local only)
  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentThread = {
        id: `temp_${Date.now()}`,
        snippet: {
          topLevelComment: {
            snippet: {
              authorDisplayName: 'You',
              authorProfileImageUrl: null,
              textDisplay: newComment,
              textOriginal: newComment,
              publishedAt: new Date().toISOString(),
              likeCount: 0,
              viewerRating: 'none',
              canRate: true,
            },
          },
          canReply: true,
          totalReplyCount: 0,
          isPublic: true,
        },
      };
      setDisplayedComments([newCommentThread, ...displayedComments]);
      setAllComments([newCommentThread, ...allComments]);
      setNewComment('');
      setShowCommentBox(false);
    }
  };

  // Like/Unlike
  const handleLike = (commentId, isReply = false) => {
    const updateLikes = (comments) =>
      comments.map((commentThread) => {
        if (!isReply && commentThread.id === commentId) {
          const top = commentThread.snippet.topLevelComment.snippet;
          const currentLikeCount = top.likeCount || 0;
          const isLiked = top.viewerRating === 'like';

          return {
            ...commentThread,
            snippet: {
              ...commentThread.snippet,
              topLevelComment: {
                ...commentThread.snippet.topLevelComment,
                snippet: {
                  ...top,
                  viewerRating: isLiked ? 'none' : 'like',
                  likeCount: isLiked
                    ? currentLikeCount - 1
                    : currentLikeCount + 1,
                },
              },
            },
          };
        }
        return commentThread;
      });

    setDisplayedComments(updateLikes);
    setAllComments(updateLikes);
  };

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
    hasMoreComments: displayedComments.length < allComments.length,
  };
}

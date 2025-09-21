import useYouTubeComments from '@/hooks/useYouTubeComments';
import React, { useState, useEffect } from 'react';

const CommentsSection = ({ videoId }) => {
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
  } = useYouTubeComments(videoId);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  if (loading) {
    return (
      <div className="text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-3 mb-6">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          {allComments.length.toLocaleString()} Comments
        </h3>

        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
            ></path>
          </svg>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-gray-600 text-white placeholder-gray-400 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="top" className="bg-gray-800">
              Top comments
            </option>
            <option value="newest" className="bg-gray-800">
              Newest first
            </option>
          </select>
        </div>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <div className="flex space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
            <span className="font-semibold">Y</span>
          </div>
          <div className="flex-1">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setShowCommentBox(true)}
              className="w-full bg-transparent border-gray-600 text-white placeholder-gray-400 border-b-2 border-t-0 border-l-0 border-r-0 p-2 resize-none focus:outline-none focus:border-blue-500"
              rows={showCommentBox ? 3 : 1}
            />
            {showCommentBox && (
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setShowCommentBox(false);
                    setNewComment('');
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-sm rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {displayedComments.map((commentThread) => {
          const comment = commentThread.snippet.topLevelComment.snippet;
          const totalReplies = commentThread.snippet.totalReplyCount || 0;

          return (
            <div key={commentThread.id}>
              {/* Main Comment */}
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {comment.authorProfileImageUrl ? (
                    <img
                      src={comment.authorProfileImageUrl}
                      alt={comment.authorDisplayName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
                      <span className="font-semibold">
                        {comment.authorDisplayName.charAt(1).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.authorDisplayName}
                    </span>
                    <span className="text-xs text-gray-300">
                      {formatTimeAgo(comment.publishedAt)}
                    </span>
                  </div>

                  <div
                    className="text-sm leading-relaxed mb-2 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: comment.textDisplay }}
                  />

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLike(commentThread.id)}
                      className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 hover:bg-opacity-80 px-2 py-1 rounded transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 ${
                          comment.viewerRating === 'like'
                            ? 'text-blue-500 fill-current'
                            : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                      <span className="text-xs">
                        {formatCount(comment.likeCount || 0)}
                      </span>
                    </button>

                    <button className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 hover:bg-opacity-80 px-2 py-1 rounded transition-colors">
                      <svg
                        className="w-4 h-4 rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.60L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                    </button>

                    {comment.canRate && (
                      <button className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
                        Reply
                      </button>
                    )}

                    {totalReplies > 0 && (
                      <button className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                        View {totalReplies}{' '}
                        {totalReplies === 1 ? 'reply' : 'replies'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Replies Section - if replies exist */}
              {commentThread.replies && commentThread.replies.comments && (
                <div className="ml-12 mt-4 pl-4 border-l-2 border-gray-700 space-y-4">
                  {commentThread.replies.comments.map((reply) => {
                    const replySnippet = reply.snippet;
                    return (
                      <div
                        key={reply.id}
                        className="p-3 rounded-lg bg-gray-700"
                      >
                        <div className="flex space-x-3">
                          <div className="flex-shrink-0">
                            {replySnippet.authorProfileImageUrl ? (
                              <img
                                src={replySnippet.authorProfileImageUrl}
                                alt={replySnippet.authorDisplayName}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center">
                                <span className="text-xs font-semibold">
                                  {replySnippet.authorDisplayName
                                    .charAt(1)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">
                                {replySnippet.authorDisplayName}
                              </span>
                              <span className="text-xs text-gray-300">
                                {formatTimeAgo(replySnippet.publishedAt)}
                              </span>
                            </div>

                            <div
                              className="text-sm leading-relaxed mb-2"
                              dangerouslySetInnerHTML={{
                                __html: replySnippet.textDisplay,
                              }}
                            />

                            <div className="flex items-center space-x-4">
                              <button className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 hover:bg-opacity-80 px-2 py-1 rounded transition-colors">
                                <svg
                                  className={`w-3 h-3 ${
                                    replySnippet.viewerRating === 'like'
                                      ? 'text-blue-500 fill-current'
                                      : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.60L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                  ></path>
                                </svg>
                                <span className="text-xs">
                                  {formatCount(replySnippet.likeCount || 0)}
                                </span>
                              </button>

                              <button className="text-xs font-medium text-gray-300 hover:text-white transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Comments */}
      {hasMoreComments && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMoreComments}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full hover:bg-opacity-80 transition-colors"
          >
            Show more comments ({allComments.length - displayedComments.length}{' '}
            remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;

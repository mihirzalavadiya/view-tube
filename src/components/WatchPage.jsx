import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import CommentsSection from './CommentsSection';
import useYouTubeVideo from '@/hooks/useYouTubeVideo';

const WatchPage = () => {
  const router = useRouter();
  const { v } = router.query;

  const { videoData, loading, error } = useYouTubeVideo(v);
  const [showDescription, setShowDescription] = useState(false);

  // Format view count
  const formatViewCount = (count) => {
    if (!count) return '0';
    const num = parseInt(count);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format date
  const formatDate = (dateString) => {
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

  // Format duration
  const formatDuration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let formatted = '';
    if (hours) formatted += hours + ':';
    formatted += (minutes || '0').padStart(2, '0') + ':';
    formatted += (seconds || '0').padStart(2, '0');

    return formatted;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!videoData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Video not found</p>
      </div>
    );
  }

  const { snippet, statistics, contentDetails } = videoData;

  return (
    <div className="min-h-screen mt-14 sm:mt-18">
      {/* Video Player Container */}
      <div className="w-full">
        <div className="relative w-full aspect-video">
          <iframe
            className="w-full h-full rounded-md"
            src={`https://www.youtube.com/embed/${v}?autoplay=1&mute=0&cc_load_policy=1&cc_lang_pref=en`}
            title={snippet.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Video Info Container */}
      <div className="px-4 py-4 md:px-6 lg:px-8 max-w-[1280px] mx-auto">
        {/* Title */}
        <h1 className="text-lg md:text-xl font-semibold leading-tight mb-3">
          {snippet.title}
        </h1>

        {/* Channel Info and Stats */}
        <div className="flex flex-col space-y-4 mb-4">
          {/* Channel Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {snippet.channelTitle.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium">{snippet.channelTitle}</h3>
                <p className="text-gray-400 text-sm">1.2M subscribers</p>
              </div>
            </div>
            <button className="bg-white shadow-lg text-black px-4 py-2 rounded-full font-medium hover:bg-red hover:text-white transition-colors">
              Subscribe
            </button>
          </div>

          {/* Like/Dislike and Share Buttons */}
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            <div className="flex items-center bg-gray-800 rounded-full">
              <button className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-700 rounded-l-full transition-colors">
                <svg
                  className="w-5 h-5 text-white"
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
                <span className="text-white text-sm">
                  {formatViewCount(statistics.likeCount)}
                </span>
              </button>
              <div className="w-px h-6 bg-gray-600"></div>
              <button className="px-4 py-2 hover:bg-gray-700 rounded-r-full transition-colors">
                <svg
                  className="w-5 h-5 text-white rotate-180"
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
              </button>
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 3.944A9 9 0 019 21a9 9 0 01-5.432-14.028A9.001 9.001 0 0112.001 3c2.618 0 4.983 1.12 6.716 2.972m-9.032 4.026A3 3 0 0115 12c0 .482-.114.938-.316 1.342"
                ></path>
              </svg>
              <span className="text-white text-sm">Share</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              <span className="text-white text-sm">Save</span>
            </button>

            <button className="flex items-center px-3 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path d="M10 4a2 2 0 100-4 2 2 0 000 4z"></path>
                <path d="M10 20a2 2 0 100-4 2 2 0 000 4z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Description Box */}
        <div className="bg-gray-800 rounded-xl p-3 md:p-4">
          <div className="flex items-center space-x-3 text-sm text-gray-300 mb-2">
            <span className="font-medium">
              {formatViewCount(statistics.viewCount)} views
            </span>
            <span>•</span>
            <span>{formatDate(snippet.publishedAt)}</span>
            <span>•</span>
            <span>{formatDuration(contentDetails.duration)}</span>
          </div>

          <div
            className={`text-white text-sm ${
              !showDescription ? 'line-clamp-2' : ''
            }`}
          >
            <p className="whitespace-pre-wrap">{snippet.description}</p>
          </div>

          {snippet.description && snippet.description.length > 100 && (
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="text-gray-300 font-medium text-sm mt-2 hover:text-white transition-colors"
            >
              {showDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl mt-3 p-3 md:p-4">
          <CommentsSection videoId={v} isDarkMode={false} />
        </div>
      </div>
    </div>
  );
};

export default WatchPage;

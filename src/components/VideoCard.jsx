import React from 'react';
import { useSelector } from 'react-redux';

const VideoCard = ({ video }) => {
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Helper function to format view count
  const formatViews = (views) => {
    if (!views) return '0 views';
    const num = parseInt(views);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K views`;
    }
    return `${num} views`;
  };

  // Helper function to format duration
  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    const minutes = parseInt(match[1]) || 0;
    const seconds = parseInt(match[2]) || 0;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to format published time
  const formatPublishedTime = (publishedAt) => {
    if (!publishedAt) return '';
    const now = new Date();
    const published = new Date(publishedAt);
    const diffTime = Math.abs(now - published);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const handleVideoClick = () => {
    console.log('Video clicked:', video?.id);
    // Add navigation logic
  };

  return (
    <div
      className={`group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 
      ${
        darkMode
          ? 'bg-gray-900 text-gray-100 shadow-gray-700'
          : 'bg-white text-gray-800'
      }`}
      onClick={handleVideoClick}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
        <img
          src={
            video?.snippet?.thumbnails?.medium?.url ||
            video?.snippet?.thumbnails?.high?.url ||
            video?.snippet?.thumbnails?.default?.url
          }
          alt={video?.snippet?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Duration Badge */}
        {video?.contentDetails?.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg">
            {formatDuration(video.contentDetails.duration)}
          </div>
        )}

        {/* Live Badge */}
        {/* {video?.snippet?.liveBroadcastContent === 'live' && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            🔴 LIVE
          </div>
        )} */}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Title */}
        <h3
          className={`font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-red transition-colors 
          ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}
        >
          {video?.snippet?.title}
        </h3>

        {/* Channel */}
        <p
          className={`text-sm font-medium mb-2 transition-colors 
          ${
            darkMode
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {video?.snippet?.channelTitle}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center text-xs space-x-2 
            ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <span className="font-medium">
              {formatViews(video?.statistics?.viewCount)}
            </span>
            {video?.snippet?.publishedAt && (
              <>
                <span>•</span>
                <span>{formatPublishedTime(video.snippet.publishedAt)}</span>
              </>
            )}
          </div>

          {/* Like Count */}
          {video?.statistics?.likeCount && (
            <div
              className={`flex items-center space-x-1 text-xs 
              ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>
                {formatViews(video.statistics.likeCount).replace(' views', '')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Higher order component to add LIVE badge
export const LiveVideoCard = ({ video }) => {
  return (
    <div className="relative">
      <VideoCard video={video} />
      <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
        LIVE
      </div>
    </div>
  );
};

export default VideoCard;

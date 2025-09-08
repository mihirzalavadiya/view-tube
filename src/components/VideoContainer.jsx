import React, { useEffect, useState } from 'react';
import VideoCard, { LiveVideoCard } from './VideoCard';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { addVideos, resetCleared } from '@/redux/slice/videoListSlice';
import useVideos from '@/hooks/useVideos';

const VideoContainer = () => {
  const { cleared } = useSelector((state) => state.videoList);
  const { videos, searchResults, loading, error, refetch } = useVideos(cleared);
  // const dispatch = useDispatch();
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const { videos, searchResults, cleared } = useSelector(
  //   (state) => state.videoList
  // );

  // useEffect(() => {
  //   getVideos();
  // }, []);

  // useEffect(() => {
  //   if (cleared) {
  //     getVideos();
  //   }
  // }, [cleared]);

  // const getVideos = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch('/api/viewtube');

  //     if (!res.ok) {
  //       throw new Error(`HTTP error! status: ${res.status}`);
  //     }

  //     const data = await res.json();
  //     dispatch(addVideos(data.items || []));
  //     setError(null);
  //   } catch (error) {
  //     console.error('Error fetching videos:', error);
  //     setError(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {/* Loading skeletons */}
        {Array.from({ length: 20 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-300 aspect-video rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          {/* Error Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            <span className="font-medium">Error:</span> {error}
          </p>

          <button
            onClick={refetch}
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Enhanced Empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
        <div className="text-center max-w-lg mx-auto">
          {/* Empty State Illustration */}
          <div className="relative mb-8">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rotate-180 rounded-lg shadow-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21,3H3A1,1 0 0,0 2,4V20A1,1 0 0,0 3,21H21A1,1 0 0,0 22,20V4A1,1 0 0,0 21,3M21,20H3V4H21M10,12L15.5,9V15" />
                </svg>
              </div>
              {/* Floating decorative elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-3 -left-2 w-3 h-3 bg-purple-200 rounded-full opacity-60"></div>
              <div className="absolute top-1/2 -right-4 w-2 h-2 bg-pink-200 rounded-full opacity-60"></div>
            </div>
          </div>

          {/* Content */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            No Videos Found
          </h2>
          <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
            We couldn't find any videos to show you right now. This might be
            temporary - try refreshing the page or check back later.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <button
              onClick={refetch}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-3 0V9a1 1 0 011-1h3a1 1 0 011 1v2"
                />
              </svg>
              Go Home
            </button>
          </div>

          {/* Additional Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              Still having trouble? Try clearing your browser cache or check
              your internet connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main render with videos
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      {(searchResults?.length > 0 ? searchResults : videos)?.map(
        (video, index) => (
          <Link
            href={`/watch?v=${video.id?.videoId || video.id}`}
            key={video.id?.videoId || video.id || index}
          >
            {video?.snippet?.liveBroadcastContent === 'live' ? (
              <LiveVideoCard
                video={video}
                key={video.id?.videoId || video.id}
              />
            ) : (
              <VideoCard video={video} key={video.id?.videoId || video.id} />
            )}
          </Link>
        )
      )}
    </div>
  );
};

export default VideoContainer;

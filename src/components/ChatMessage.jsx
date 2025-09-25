import React from 'react';

const ChatMessage = ({ messageData }) => {
  // Extract data from YouTube Live Chat API structure
  //   console.log('messageData:', messageData);

  const {
    avatar,
    username,
    message,
    timestamp,
    isOwner,
    isModerator,
    isSponsor,
    isVerified,
  } = messageData;

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Process emojis in message (YouTube uses :emoji-name: format)
  const processMessage = (text) => {
    // Convert YouTube emoji format to regular emojis or remove them
    return text?.replace(/:([^:]+):/g, ''); // Remove emoji codes for now
  };

  return (
    <div className="flex items-start gap-2 p-2 hover:bg-gray-700/50 transition-colors group">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt={username} className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {username?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-1">
          {/* Username with badges */}
          <span
            className={`text-sm font-medium ${
              isOwner
                ? 'text-red-400'
                : isModerator
                ? 'text-green-400'
                : isSponsor
                ? 'text-yellow-400'
                : 'text-blue-400'
            }`}
          >
            {username}
          </span>

          {/* Owner Badge */}
          {isOwner && (
            <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
              OWNER
            </span>
          )}

          {/* Moderator Badge */}
          {isModerator && (
            <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
              MOD
            </span>
          )}

          {/* Sponsor Badge */}
          {isSponsor && (
            <span className="bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
              SPONSOR
            </span>
          )}

          {/* Verified Badge */}
          {isVerified && (
            <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-bold">
              ✓
            </span>
          )}

          {/* Timestamp */}
          <span className="text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Message Text */}
        <p className="text-sm text-white leading-relaxed break-words">
          {processMessage(message)}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;

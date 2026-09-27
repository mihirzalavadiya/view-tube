import React from 'react';
import { initialsFor } from '@/utils/format';

const BADGES = [
  { key: 'isOwner', label: 'Owner' },
  { key: 'isModerator', label: 'Mod' },
  { key: 'isSponsor', label: 'Member' },
  { key: 'isVerified', label: 'Verified' },
];

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ChatMessage = ({ messageData }) => {
  const { avatar, username, message, timestamp } = messageData;
  const badges = BADGES.filter((b) => messageData[b.key]);

  return (
    <div className="group flex items-start gap-2.5 rounded-lg p-2 transition-colors hover:bg-surface2">
      {avatar ? (
        <img src={avatar} alt="" className="h-6 w-6 shrink-0 rounded-full" />
      ) : (
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface3 text-[9px] font-bold text-ink">
          {initialsFor(username)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[12.5px] font-semibold text-ink">{username}</span>
          {badges.map((badge) => (
            <span
              key={badge.key}
              className="rounded bg-accent-soft px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.1em] text-ink"
            >
              {badge.label}
            </span>
          ))}
          <span className="ml-auto font-mono text-[9.5px] text-muted opacity-0 transition-opacity group-hover:opacity-100">
            {formatTime(timestamp)}
          </span>
        </div>
        <p className="m-0 break-words text-[13px] leading-relaxed text-ink2">
          {message}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;

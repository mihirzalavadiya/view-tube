import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCompact, gradientFor } from '@/utils/format';

/** "Tonight · 21:00", "Tomorrow · 09:30", "Sat · 18:30" */
const formatWhen = (room) => {
  if (room.isLive) return 'Live now';
  if (!room.scheduledStartTime) return 'Scheduled';

  const start = new Date(room.scheduledStartTime);
  if (Number.isNaN(start.getTime())) return 'Scheduled';

  const time = start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round(
    (startOfDay(start) - startOfDay(new Date())) / 86400000
  );

  if (days <= 0) return `Tonight · ${time}`;
  if (days === 1) return `Tomorrow · ${time}`;
  if (days < 7) return `${start.toLocaleDateString([], { weekday: 'short' })} · ${time}`;
  return `${start.toLocaleDateString([], { day: 'numeric', month: 'short' })} · ${time}`;
};

const formatPeople = (room) => {
  if (room.isLive && room.concurrentViewers) {
    return `${formatCompact(room.concurrentViewers)} watching`;
  }
  return room.isLive ? 'Live' : 'Premiere';
};

const RoomsSection = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data?.items)) setRooms(data.items);
      })
      .catch(() => {
        // Nothing scheduled or the lookup failed — the section hides itself.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (rooms.length === 0) return null;

  return (
    <section className="mt-[50px]">
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-5 border-b border-line pb-3.5">
        <div>
          <div className="mb-[7px] font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent-text">
            Watch together
          </div>
          <h2 className="font-display text-[29px] font-bold tracking-[-0.03em] text-ink">
            Rooms starting soon
          </h2>
        </div>
        {/* The design's "Start a room" pill needs a backend this app doesn't
            have, so it isn't rendered. */}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[18px]">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/watch?v=${room.id}`}
            className="vt-lift grid grid-cols-[96px_minmax(0,1fr)] gap-3.5 rounded-[18px] border border-line bg-surface p-3 hover:text-ink"
          >
            <div
              className="aspect-square overflow-hidden rounded-[13px]"
              style={room.thumbnail ? undefined : { background: gradientFor(room.id) }}
            >
              {room.thumbnail && (
                <img
                  src={room.thumbnail}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-center gap-[5px]">
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent-text">
                {formatWhen(room)}
              </div>
              <div className="line-clamp-2 text-[14.5px] font-semibold leading-[1.25] text-ink">
                {room.title}
              </div>
              <div className="truncate text-xs text-muted">
                {room.host} · {formatPeople(room)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RoomsSection;

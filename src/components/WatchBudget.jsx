import React from 'react';

/**
 * Top-bar daily watch budget. The ring is a conic-gradient filled to the
 * fraction of today's budget already watched.
 */
const WatchBudget = ({ ratio, remainingMin, limitMin, spent }) => {
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);

  return (
    <div
      title="Daily watch budget"
      aria-label={`Watch budget: ${remainingMin} minutes left of ${limitMin}`}
      className="flex shrink-0 items-center gap-[9px] whitespace-nowrap rounded-full bg-surface2 py-[7px] pl-[9px] pr-[13px]"
    >
      <span
        aria-hidden="true"
        className="grid h-[22px] w-[22px] place-items-center rounded-full"
        style={{
          background: `conic-gradient(var(--accent) 0 ${pct}%, var(--line-strong) ${pct}% 100%)`,
        }}
      >
        <span className="h-[13px] w-[13px] rounded-full bg-surface2" />
      </span>
      <span className="hidden font-mono text-[11px] text-ink2 sm:inline">
        {spent ? `Budget used · ${limitMin}m` : `${remainingMin}m left of ${limitMin}m`}
      </span>
    </div>
  );
};

export default WatchBudget;

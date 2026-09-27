import React from 'react';
import { DEFAULT_LIMIT_MIN } from '@/hooks/useWatchBudget';

const MIX_ROWS = [
  { key: 'subs', label: 'Channels you follow' },
  { key: 'disc', label: 'New to you' },
  { key: 'learn', label: 'Courses & long-form' },
];

const RULES = [
  { key: 'noShorts', label: 'No Shorts in my feed' },
  { key: 'hideWatched', label: 'Hide videos I finished' },
  { key: 'algoOff', label: 'Algorithm off — newest first' },
];

const Toggle = ({ on }) => (
  <span
    aria-hidden="true"
    className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors duration-200 ${
      on ? 'bg-accent' : 'bg-surface3'
    }`}
  >
    <span
      className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-surface shadow-[0_1px_4px_rgba(0,0,0,.35)] transition-[left] duration-200"
      style={{ left: on ? 18 : 2 }}
    />
  </span>
);

/**
 * The design's feed dial. The weights are applied literally in rankFeed — the
 * panel's promise ("no hidden weighting") only holds if the sliders really
 * drive the order, so nothing else re-sorts the feed when the dial is on.
 */
const FeedDial = ({ mix, rules, onMixChange, onRuleToggle, budgetLimitMin }) => (
  <section className="mb-11 grid gap-[22px] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
    <div className="rounded-[22px] border border-line bg-surface px-[26px] py-6">
      <div className="mb-[7px] font-mono text-[10.5px] uppercase tracking-[0.16em] text-accent-text">
        You own the ranking
      </div>
      <h2 className="mb-1 font-display text-[23px] font-bold tracking-[-0.025em] text-ink">
        Tune your feed
      </h2>
      <p className="mb-5 max-w-[52ch] text-[13.5px] text-muted">
        Set the mix yourself. No hidden weighting — the dial you set is the feed
        you get, and it is saved per device.
      </p>

      <div className="flex flex-col gap-4">
        {MIX_ROWS.map((row) => (
          <label
            key={row.key}
            className="grid cursor-pointer grid-cols-[minmax(0,1fr)_52px] items-center gap-2.5"
          >
            <span className="min-w-0">
              <span className="mb-[7px] block text-[13.5px] font-semibold text-ink">
                {row.label}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={mix[row.key]}
                onChange={(e) => onMixChange(row.key, e.target.value)}
                className="h-1 w-full cursor-pointer accent-[#C6F24E]"
              />
            </span>
            <span className="text-right font-mono text-sm text-ink">
              {mix[row.key]}%
            </span>
          </label>
        ))}
      </div>
    </div>

    <div className="flex flex-col rounded-[22px] border border-line bg-surface px-[26px] py-6">
      <div className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted">
        Feed rules
      </div>

      <div className="flex flex-col gap-3.5">
        {RULES.map((rule) => (
          <button
            key={rule.key}
            type="button"
            onClick={() => onRuleToggle(rule.key)}
            aria-pressed={rules[rule.key]}
            className="flex items-center justify-between gap-3.5 text-left text-[13.5px] font-semibold text-ink"
          >
            <span>{rule.label}</span>
            <Toggle on={rules[rule.key]} />
          </button>
        ))}
      </div>

      <p className="mt-auto pt-[18px] text-[12.5px] leading-[1.5] text-muted">
        Watch budget:{' '}
        <strong className="font-semibold text-ink">
          {budgetLimitMin ?? DEFAULT_LIMIT_MIN} min/day
        </strong>{' '}
        — after that the feed goes quiet instead of autoplaying.
      </p>
    </div>
  </section>
);

export default FeedDial;

import React from 'react';
import ButtonContainer from './ButtonContainer';
import { FEED_CHIPS } from '@/utils/categories';

// Controlled by BodyContainer so the selection actually drives the feed query
// instead of only moving the highlight.
const ButtonList = ({ active, onChange }) => (
  <div
    role="group"
    aria-label="Filter feed by category"
    className="no-scrollbar flex gap-2 overflow-x-auto pb-[22px]"
  >
    {FEED_CHIPS.map((chip) => (
      <ButtonContainer
        key={chip.label}
        title={chip.label}
        isActive={active === chip.label}
        onClick={() => onChange(chip.label)}
      />
    ))}
  </div>
);

export default ButtonList;

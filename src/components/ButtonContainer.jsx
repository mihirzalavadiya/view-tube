import React from 'react';

const ButtonContainer = ({ title, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={`shrink-0 whitespace-nowrap rounded-full border px-[15px] py-2 text-[13px] font-semibold transition-colors duration-200 ${
      isActive
        ? 'border-accent bg-accent text-accent-ink'
        : 'border-transparent bg-surface2 text-ink2 hover:bg-surface3'
    }`}
  >
    {title}
  </button>
);

export default ButtonContainer;

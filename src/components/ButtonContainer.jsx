import React from 'react';

const ButtonContainer = ({ title, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
    px-3 py-1 rounded-lg font-medium text-sm whitespace-nowrap
    transition-all duration-200 hover:shadow-md
    ${
      isActive
        ? 'bg-red text-active-text'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  `}
    >
      {title}
    </button>
  );
};

export default ButtonContainer;

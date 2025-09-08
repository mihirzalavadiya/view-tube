import React, { useState } from 'react';
import ButtonContainer from './ButtonContainer';

const ButtonList = () => {
  const [activeButton, setActiveButton] = useState(0);

  const buttonData = [
    'All',
    'Music',
    'Gaming',
    'Movies',
    'News',
    'Sports',
    'Technology',
    'Comedy',
    'Education',
    'Travel',
    'Food',
    'Fashion',
    'Fitness',
    'Science',
    'Art',
    'Business',
    'Health',
    'History',
    'Documentary',
  ];

  return (
    <div className="flex w-full overflow-x-auto space-x-3 p-3 scrollbar-hide">
      {buttonData.map((title, index) => (
        <ButtonContainer
          key={index}
          title={title}
          isActive={activeButton === index}
          onClick={() => setActiveButton(index)}
        />
      ))}
    </div>
  );
};

export default ButtonList;

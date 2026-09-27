import React, { useState } from 'react';
import { initialsFor } from '@/utils/format';

/**
 * Real channel logo, falling back to the design's initials-on-surface3 tile
 * when there is no avatar (or the image fails to load).
 *
 * `radius` follows the design: circle in creator strips, 9–13px elsewhere.
 */
const ChannelAvatar = ({
  src,
  name,
  size = 36,
  radius = 'rounded-[11px]',
  className = '',
}) => {
  const [broken, setBroken] = useState(false);
  const box = { width: size, height: size };

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        style={box}
        onError={() => setBroken(true)}
        className={`shrink-0 object-cover ${radius} ${className}`}
      />
    );
  }

  // Initials scale with the tile so 28px and 44px both read well.
  return (
    <div
      style={box}
      className={`grid shrink-0 place-items-center bg-surface3 font-bold text-ink ${radius} ${className}`}
    >
      <span style={{ fontSize: Math.max(9, Math.round(size * 0.34)) }}>
        {initialsFor(name)}
      </span>
    </div>
  );
};

export default ChannelAvatar;

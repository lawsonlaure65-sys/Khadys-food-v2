import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
  withSquircle?: boolean;
  withBorder?: boolean;
}

export const KhadyOriginalLogo: React.FC<LogoProps> = ({
  className = '',
  size = 54,
  withSquircle = true,
  withBorder = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        withSquircle ? 'bg-white rounded-[26%] shadow-md p-1.5' : ''
      } ${withBorder ? 'border-2 border-[#5C382C]/30' : ''} ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Dark Chocolate Circle with Fork & Spoon */}
        <circle cx="132" cy="78" r="42" fill="#3D2018" />

        {/* White Fork inside the brown circle */}
        <g fill="#FFFFFF">
          {/* Fork handle */}
          <rect x="114" y="80" width="3" height="24" rx="1.5" />
          {/* Fork base */}
          <path d="M109 72 C109 79 122 79 122 72 L122 66 L119 66 L119 72 L117 72 L117 66 L114 66 L114 72 L112 72 L112 66 L109 66 Z" />
        </g>

        {/* White Spoon inside the brown circle */}
        <g fill="#FFFFFF">
          {/* Spoon handle */}
          <rect x="144" y="78" width="3.2" height="26" rx="1.6" />
          {/* Spoon bowl */}
          <ellipse cx="145.6" cy="69" rx="7.2" ry="11" />
        </g>

        {/* Cursive "Khady's" text */}
        <text
          x="32"
          y="125"
          fill="#3D2018"
          style={{
            fontFamily: "'Playfair Display', 'Brush Script MT', 'Dancing Script', cursive, serif",
            fontWeight: 800,
            fontSize: '52px',
            fontStyle: 'italic',
            letterSpacing: '-1.5px',
          }}
        >
          Khady's
        </text>

        {/* "F o o d" text underneath */}
        <text
          x="94"
          y="152"
          fill="#4A2A20"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700,
            fontSize: '17px',
            letterSpacing: '5px',
          }}
        >
          FOOD
        </text>
      </svg>
    </div>
  );
};

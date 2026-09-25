import React from 'react';
import { KhadyOriginalLogo } from './KhadyOriginalLogo';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  withText?: boolean;
}

export const KhadyLogo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  withText = true,
}) => {
  const pixelSizes = {
    sm: 36,
    md: 46,
    lg: 60,
    xl: 84,
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base font-bold',
    lg: 'text-xl font-extrabold',
    xl: 'text-2xl font-black',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Authentic Original Logo */}
      <div className="relative flex-shrink-0">
        <KhadyOriginalLogo
          size={pixelSizes[size]}
          withSquircle={true}
          withBorder={false}
          className="shadow-md"
        />
        {/* Active Online Indicator dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#121110]" />
      </div>

      {/* Typography if requested */}
      {withText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black text-amber-500 uppercase tracking-widest">
              👋 SALAM 👋
            </span>
          </div>
          <span
            className={`font-display italic font-black tracking-wide text-amber-400 ${titleSizes[size]}`}
          >
            KHADY'S FOOD & EVENT
          </span>
          {showSubtitle && (
            <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
              L'Excellence à Niamey • 7j/7
            </span>
          )}
        </div>
      )}
    </div>
  );
};

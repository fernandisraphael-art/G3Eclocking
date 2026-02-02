
import React from 'react';

const MRSLogoSVG = ({ className = "" }) => (
  <svg viewBox="0 0 300 120" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Three overlapping yellow triangles/arrows */}
    <g transform="translate(0, 0)">
      <path d="M0 10 L80 10 L110 55 L80 100 L0 100 L30 55 Z" fill="#FFCD00" />
      <text x="45" y="70" fill="#003057" fontSize="48" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">M</text>
    </g>
    <g transform="translate(75, 0)">
      <path d="M0 10 L80 10 L110 55 L80 100 L0 100 L30 55 Z" fill="#FFCD00" />
      <text x="45" y="70" fill="#003057" fontSize="48" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">R</text>
    </g>
    <g transform="translate(150, 0)">
      <path d="M0 10 L80 10 L110 55 L80 100 L0 100 L30 55 Z" fill="#FFCD00" />
      <text x="45" y="70" fill="#003057" fontSize="48" fontWeight="900" fontFamily="Inter, sans-serif" textAnchor="middle">S</text>
    </g>
    <text x="135" y="115" fill="#FFCD00" fontSize="16" fontWeight="800" fontFamily="Inter, sans-serif" letterSpacing="1">Logística S.A.</text>
  </svg>
);

export const LogoFull: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex flex-col items-center ${className}`}>
    <MRSLogoSVG className="w-64 h-auto" />
  </div>
);

export const LogoCompact: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="flex flex-col">
      <span className="text-[#FFCD00] font-black text-xl leading-none tracking-tighter uppercase">G3Eclocking</span>
      <span className="text-white text-[8px] font-black tracking-[0.2em] uppercase opacity-80 leading-none mt-1">MRS Logística</span>
    </div>
  </div>
);

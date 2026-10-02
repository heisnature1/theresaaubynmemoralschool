import React from 'react';

interface SchoolCrestProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SchoolCrest({ className = '', size = 'md' }: SchoolCrestProps) {
  const dimensions = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Outer Golden Laurel / Shield Ring */}
        <circle cx="60" cy="60" r="56" fill="#09392A" stroke="#D9AF37" strokeWidth="4" />
        <circle cx="60" cy="60" r="50" stroke="#E4C45E" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Heraldic Shield */}
        <path
          d="M32 28H88V62C88 82 60 96 60 96C60 96 32 82 32 62V28Z"
          fill="#115940"
          stroke="#D9AF37"
          strokeWidth="3"
        />

        {/* Shield Quarter Division in Gold */}
        <path d="M60 28V95" stroke="#D9AF37" strokeWidth="2" />
        <path d="M32 58H88" stroke="#D9AF37" strokeWidth="2" />

        {/* Top-Left: Cross of St Theresa */}
        <path d="M46 35V51M38 43H54" stroke="#F6EECB" strokeWidth="3" strokeLinecap="round" />

        {/* Top-Right: Star of Excellence */}
        <polygon
          points="74,35 76.2,40.5 82,41 77.5,44.8 78.8,50.5 74,47.3 69.2,50.5 70.5,44.8 66,41 71.8,40.5"
          fill="#E4C45E"
        />

        {/* Bottom Arch: Open Book of Knowledge */}
        <path
          d="M45 67C49 65 55 65 60 68C65 65 71 65 75 67V79C71 77 65 77 60 80C55 77 49 77 45 79V67Z"
          fill="#FAF8F3"
          stroke="#D9AF37"
          strokeWidth="1.8"
        />
        <path d="M60 68V80" stroke="#09392A" strokeWidth="1.5" />

        {/* Crown / Sunburst at Top */}
        <circle cx="60" cy="18" r="4" fill="#D9AF37" />
        <path d="M48 20L54 24M72 20L66 24" stroke="#D9AF37" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

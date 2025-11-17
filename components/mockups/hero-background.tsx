export default function HeroBackground() {
  return (
    <svg
      viewBox="0 0 1200 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Background gradient shapes */}
      <defs>
        <radialGradient id="heroGlow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F25C05" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F25C05" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heroGlow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1D9BA3" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#1D9BA3" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glowing orbs */}
      <circle cx="200" cy="200" r="300" fill="url(#heroGlow1)" opacity="0.5" />
      <circle cx="1000" cy="600" r="400" fill="url(#heroGlow2)" opacity="0.5" />

      {/* Person silhouette at desk */}
      <g transform="translate(750, 300)">
        {/* Desk */}
        <rect x="0" y="200" width="400" height="20" rx="4" fill="#cdd6f4" opacity="0.6" />
        <rect x="20" y="220" width="8" height="100" fill="#cdd6f4" opacity="0.6" />
        <rect x="372" y="220" width="8" height="100" fill="#cdd6f4" opacity="0.6" />

        {/* Monitor */}
        <rect x="120" y="80" width="200" height="130" rx="4" fill="#313244" opacity="0.8" />
        <rect x="130" y="90" width="180" height="100" rx="2" fill="#1e1e2e" opacity="0.9" />

        {/* Monitor screen content - chat interface */}
        <rect x="140" y="100" width="160" height="30" rx="4" fill="#89b4fa" opacity="0.4" />
        <rect x="145" y="105" width="80" height="4" fill="#cdd6f4" opacity="0.6" />
        <rect x="145" y="112" width="120" height="4" fill="#cdd6f4" opacity="0.4" />
        <rect x="145" y="119" width="100" height="4" fill="#cdd6f4" opacity="0.4" />

        <rect x="140" y="140" width="160" height="30" rx="4" fill="#94e2d5" opacity="0.3" />
        <rect x="145" y="145" width="70" height="4" fill="#cdd6f4" opacity="0.6" />
        <rect x="145" y="152" width="110" height="4" fill="#cdd6f4" opacity="0.4" />
        <rect x="145" y="159" width="90" height="4" fill="#cdd6f4" opacity="0.4" />

        {/* Monitor stand */}
        <rect x="200" y="210" width="40" height="8" rx="2" fill="#313244" opacity="0.8" />
        <rect x="210" y="215" width="20" height="50" fill="#313244" opacity="0.8" />

        {/* Person silhouette */}
        {/* Head */}
        <circle cx="220" cy="150" r="30" fill="#cdd6f4" opacity="0.5" />

        {/* Shoulders/torso */}
        <ellipse cx="220" cy="220" rx="50" ry="60" fill="#cdd6f4" opacity="0.5" />

        {/* Left arm - typing position */}
        <rect x="150" y="200" width="50" height="15" rx="8" fill="#cdd6f4" opacity="0.5"
              transform="rotate(-20 150 207)" />

        {/* Right arm - typing position */}
        <rect x="240" y="200" width="50" height="15" rx="8" fill="#cdd6f4" opacity="0.5"
              transform="rotate(20 290 207)" />

        {/* Keyboard */}
        <rect x="140" y="220" width="160" height="40" rx="4" fill="#313244" opacity="0.6" />
        <g opacity="0.4">
          {/* Key rows */}
          <rect x="150" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="162" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="174" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="186" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="198" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="210" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="222" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="234" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="246" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="258" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="270" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
          <rect x="282" y="228" width="8" height="6" rx="1" fill="#cdd6f4" />
        </g>

        {/* Mouse */}
        <ellipse cx="320" cy="235" rx="12" ry="18" fill="#313244" opacity="0.6" />
      </g>

      {/* Floating UI elements - data visualizations */}
      <g opacity="0.3">
        {/* Chart 1 - Bar chart */}
        <rect x="100" y="500" width="150" height="120" rx="8" fill="#313244" opacity="0.4" />
        <rect x="115" y="580" width="15" height="25" fill="#89b4fa" />
        <rect x="140" y="560" width="15" height="45" fill="#94e2d5" />
        <rect x="165" y="540" width="15" height="65" fill="#a6e3a1" />
        <rect x="190" y="550" width="15" height="55" fill="#fab387" />
        <line x1="110" y1="605" x2="225" y2="605" stroke="#cdd6f4" strokeWidth="1" opacity="0.3" />

        {/* Chart 2 - Pie chart */}
        <circle cx="1050" cy="150" r="60" fill="#313244" opacity="0.4" />
        <path d="M 1050 150 L 1050 90 A 60 60 0 0 1 1095 180 Z" fill="#89b4fa" />
        <path d="M 1050 150 L 1095 180 A 60 60 0 0 1 1020 195 Z" fill="#94e2d5" />
        <path d="M 1050 150 L 1020 195 A 60 60 0 0 1 1050 90 Z" fill="#a6e3a1" />

        {/* Document/Report icon */}
        <rect x="150" y="100" width="100" height="140" rx="8" fill="#313244" opacity="0.3" />
        <line x1="170" y1="130" x2="220" y2="130" stroke="#cdd6f4" strokeWidth="2" opacity="0.3" />
        <line x1="170" y1="150" x2="230" y2="150" stroke="#cdd6f4" strokeWidth="2" opacity="0.3" />
        <line x1="170" y1="170" x2="225" y2="170" stroke="#cdd6f4" strokeWidth="2" opacity="0.3" />
        <line x1="170" y1="190" x2="215" y2="190" stroke="#cdd6f4" strokeWidth="2" opacity="0.3" />
      </g>

      {/* Network nodes */}
      <g opacity="0.2">
        <circle cx="400" cy="600" r="8" fill="#f25c05" />
        <circle cx="500" cy="650" r="8" fill="#1d9ba3" />
        <circle cx="450" cy="700" r="8" fill="#f25c05" />
        <line x1="400" y1="600" x2="500" y2="650" stroke="#cdd6f4" strokeWidth="1" />
        <line x1="500" y1="650" x2="450" y2="700" stroke="#cdd6f4" strokeWidth="1" />
        <line x1="450" y1="700" x2="400" y2="600" stroke="#cdd6f4" strokeWidth="1" />
      </g>
    </svg>
  )
}

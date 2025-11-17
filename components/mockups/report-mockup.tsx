export default function ReportMockup() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
    >
      {/* Browser Window Frame */}
      <rect width="800" height="600" rx="12" fill="#1e1e2e" />

      {/* Browser Chrome */}
      <rect width="800" height="40" rx="12" fill="#313244" />
      <circle cx="20" cy="20" r="6" fill="#f38ba8" />
      <circle cx="40" cy="20" r="6" fill="#fab387" />
      <circle cx="60" cy="20" r="6" fill="#a6e3a1" />

      {/* URL Bar */}
      <rect x="90" y="10" width="600" height="20" rx="4" fill="#1e1e2e" />
      <text x="100" y="25" fontSize="12" fill="#6c7086" fontFamily="monospace">
        flowforge.ai/reports/transformation-readiness
      </text>

      {/* Header */}
      <rect y="40" width="800" height="80" fill="#181825" />
      <text x="30" y="75" fontSize="22" fontWeight="bold" fill="#cdd6f4">
        Digital Transformation Readiness Report
      </text>
      <text x="30" y="100" fontSize="13" fill="#94e2d5">
        Generated from 12 stakeholder interviews • March 2024
      </text>

      {/* Main Content */}
      <rect y="120" width="800" height="480" fill="#1e1e2e" />

      {/* Overall Score Card */}
      <rect x="30" y="140" width="740" height="100" rx="8" fill="#313244" />
      <text x="50" y="170" fontSize="16" fontWeight="bold" fill="#cdd6f4">
        Overall Readiness Score
      </text>
      <text x="50" y="215" fontSize="48" fontWeight="bold" fill="url(#gradient)">
        67%
      </text>
      <text x="180" y="195" fontSize="14" fill="#bac2de">
        Medium-High Readiness
      </text>
      <text x="180" y="215" fontSize="12" fill="#6c7086">
        Strong foundation with opportunities
      </text>
      <text x="180" y="230" fontSize="12" fill="#6c7086">
        for strategic improvement
      </text>

      {/* Radar Chart */}
      <g transform="translate(550, 190)">
        {/* Radar background circles */}
        <circle cx="0" cy="0" r="80" fill="none" stroke="#45475a" strokeWidth="1" opacity="0.3" />
        <circle cx="0" cy="0" r="60" fill="none" stroke="#45475a" strokeWidth="1" opacity="0.3" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="#45475a" strokeWidth="1" opacity="0.3" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="#45475a" strokeWidth="1" opacity="0.3" />

        {/* Radar axes */}
        <line x1="0" y1="0" x2="0" y2="-80" stroke="#45475a" strokeWidth="1" />
        <line x1="0" y1="0" x2="69" y2="-40" stroke="#45475a" strokeWidth="1" />
        <line x1="0" y1="0" x2="69" y2="40" stroke="#45475a" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="80" stroke="#45475a" strokeWidth="1" />
        <line x1="0" y1="0" x2="-69" y2="40" stroke="#45475a" strokeWidth="1" />
        <line x1="0" y1="0" x2="-69" y2="-40" stroke="#45475a" strokeWidth="1" />

        {/* Data polygon */}
        <polygon
          points="0,-56 48,-28 48,28 0,48 -42,24 -42,-32"
          fill="#89b4fa"
          opacity="0.3"
          stroke="#89b4fa"
          strokeWidth="2"
        />

        {/* Data points */}
        <circle cx="0" cy="-56" r="4" fill="#89b4fa" />
        <circle cx="48" cy="-28" r="4" fill="#89b4fa" />
        <circle cx="48" cy="28" r="4" fill="#89b4fa" />
        <circle cx="0" cy="48" r="4" fill="#89b4fa" />
        <circle cx="-42" cy="24" r="4" fill="#89b4fa" />
        <circle cx="-42" cy="-32" r="4" fill="#89b4fa" />
      </g>

      {/* Dimension Scores */}
      <rect x="30" y="260" width="360" height="320" rx="8" fill="#313244" />
      <text x="50" y="290" fontSize="15" fontWeight="bold" fill="#cdd6f4">
        Readiness by Dimension
      </text>

      {/* Technology */}
      <text x="50" y="325" fontSize="13" fill="#bac2de">
        Technology
      </text>
      <rect x="50" y="335" width="300" height="10" rx="5" fill="#45475a" />
      <rect x="50" y="335" width="210" height="10" rx="5" fill="#89b4fa" />
      <text x="360" y="344" fontSize="12" fontWeight="bold" fill="#89b4fa">
        70%
      </text>

      {/* Process */}
      <text x="50" y="375" fontSize="13" fill="#bac2de">
        Process
      </text>
      <rect x="50" y="385" width="300" height="10" rx="5" fill="#45475a" />
      <rect x="50" y="385" width="180" height="10" rx="5" fill="#94e2d5" />
      <text x="360" y="394" fontSize="12" fontWeight="bold" fill="#94e2d5">
        60%
      </text>

      {/* Organization */}
      <text x="50" y="425" fontSize="13" fill="#bac2de">
        Organization
      </text>
      <rect x="50" y="435" width="300" height="10" rx="5" fill="#45475a" />
      <rect x="50" y="435" width="195" height="10" rx="5" fill="#a6e3a1" />
      <text x="360" y="444" fontSize="12" fontWeight="bold" fill="#a6e3a1">
        65%
      </text>

      {/* Strategy */}
      <text x="50" y="475" fontSize="13" fill="#bac2de">
        Strategy
      </text>
      <rect x="50" y="485" width="300" height="10" rx="5" fill="#45475a" />
      <rect x="50" y="485" width="225" height="10" rx="5" fill="#f9e2af" />
      <text x="360" y="494" fontSize="12" fontWeight="bold" fill="#f9e2af">
        75%
      </text>

      {/* Culture */}
      <text x="50" y="525" fontSize="13" fill="#bac2de">
        Culture
      </text>
      <rect x="50" y="535" width="300" height="10" rx="5" fill="#45475a" />
      <rect x="50" y="535" width="165" height="10" rx="5" fill="#fab387" />
      <text x="360" y="544" fontSize="12" fontWeight="bold" fill="#fab387">
        55%
      </text>

      {/* Key Insights */}
      <rect x="410" y="260" width="360" height="320" rx="8" fill="#313244" />
      <text x="430" y="290" fontSize="15" fontWeight="bold" fill="#cdd6f4">
        Key Insights
      </text>

      <circle cx="440" cy="320" r="3" fill="#a6e3a1" />
      <text x="455" y="325" fontSize="12" fill="#bac2de">
        Strong leadership alignment on
      </text>
      <text x="455" y="340" fontSize="12" fill="#bac2de">
        digital strategy vision
      </text>

      <circle cx="440" cy="365" r="3" fill="#fab387" />
      <text x="455" y="370" fontSize="12" fill="#bac2de">
        Cultural readiness gaps identified
      </text>
      <text x="455" y="385" fontSize="12" fill="#bac2de">
        in production teams
      </text>

      <circle cx="440" cy="410" r="3" fill="#89b4fa" />
      <text x="455" y="415" fontSize="12" fill="#bac2de">
        Existing technology stack provides
      </text>
      <text x="455" y="430" fontSize="12" fill="#bac2de">
        solid foundation for growth
      </text>

      <circle cx="440" cy="455" r="3" fill="#94e2d5" />
      <text x="455" y="460" fontSize="12" fill="#bac2de">
        Process standardization needed
      </text>
      <text x="455" y="475" fontSize="12" fill="#bac2de">
        before advanced automation
      </text>

      <rect x="430" y="510" width="320" height="50" rx="6" fill="#181825" />
      <text x="445" y="530" fontSize="11" fill="#6c7086">
        Recommended Next Steps
      </text>
      <text x="445" y="548" fontSize="11" fontWeight="bold" fill="#f25c05">
        View Full Report →
      </text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

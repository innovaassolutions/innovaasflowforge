export default function ReportMockup() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
    >
      {/* Browser Window Frame - Pearl Vibrant light theme */}
      <rect width="800" height="600" rx="12" fill="#FFFEFB" />

      {/* Browser Chrome */}
      <rect width="800" height="40" rx="12" fill="#F5F5F4" />
      <circle cx="20" cy="20" r="6" fill="#ef4444" />
      <circle cx="40" cy="20" r="6" fill="#F25C05" />
      <circle cx="60" cy="20" r="6" fill="#22c55e" />

      {/* URL Bar */}
      <rect x="90" y="10" width="600" height="20" rx="4" fill="#FFFFFF" />
      <text x="100" y="25" fontSize="12" fill="#78716C" fontFamily="monospace">
        flowforge.ai/reports/transformation-readiness
      </text>

      {/* Header */}
      <rect y="40" width="800" height="80" fill="#F5F5F4" />
      <text x="30" y="75" fontSize="22" fontWeight="bold" fill="#171614">
        Digital Transformation Readiness Report
      </text>
      <text x="30" y="100" fontSize="13" fill="#1D9BA3" fontWeight="500">
        Generated from 12 stakeholder interviews - March 2024
      </text>

      {/* Main Content */}
      <rect y="120" width="800" height="480" fill="#FFFEFB" />

      {/* Overall Score Card */}
      <rect x="30" y="140" width="740" height="100" rx="8" fill="#FFFFFF" />
      <rect x="30" y="140" width="740" height="100" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="170" fontSize="16" fontWeight="bold" fill="#171614">
        Overall Readiness Score
      </text>
      <text x="50" y="215" fontSize="48" fontWeight="bold" fill="url(#gradient)">
        67%
      </text>
      <text x="180" y="195" fontSize="14" fill="#171614" fontWeight="500">
        Medium-High Readiness
      </text>
      <text x="180" y="215" fontSize="12" fill="#78716C">
        Strong foundation with opportunities
      </text>
      <text x="180" y="230" fontSize="12" fill="#78716C">
        for strategic improvement
      </text>

      {/* Radar Chart */}
      <g transform="translate(550, 190)">
        {/* Radar background circles */}
        <circle cx="0" cy="0" r="80" fill="none" stroke="#E7E5E4" strokeWidth="1" />
        <circle cx="0" cy="0" r="60" fill="none" stroke="#E7E5E4" strokeWidth="1" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="#E7E5E4" strokeWidth="1" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="#E7E5E4" strokeWidth="1" />

        {/* Radar axes */}
        <line x1="0" y1="0" x2="0" y2="-80" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="69" y2="-40" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="69" y2="40" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="0" y2="80" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="-69" y2="40" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="-69" y2="-40" stroke="#E7E5E4" strokeWidth="1" />

        {/* Data polygon */}
        <polygon
          points="0,-56 48,-28 48,28 0,48 -42,24 -42,-32"
          fill="#F25C05"
          opacity="0.2"
          stroke="#F25C05"
          strokeWidth="2"
        />

        {/* Data points */}
        <circle cx="0" cy="-56" r="4" fill="#F25C05" />
        <circle cx="48" cy="-28" r="4" fill="#F25C05" />
        <circle cx="48" cy="28" r="4" fill="#F25C05" />
        <circle cx="0" cy="48" r="4" fill="#F25C05" />
        <circle cx="-42" cy="24" r="4" fill="#F25C05" />
        <circle cx="-42" cy="-32" r="4" fill="#F25C05" />
      </g>

      {/* Dimension Scores */}
      <rect x="30" y="260" width="360" height="320" rx="8" fill="#FFFFFF" />
      <rect x="30" y="260" width="360" height="320" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="290" fontSize="15" fontWeight="bold" fill="#171614">
        Readiness by Dimension
      </text>

      {/* Technology */}
      <text x="50" y="325" fontSize="13" fill="#171614">
        Technology
      </text>
      <rect x="50" y="335" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="335" width="210" height="10" rx="5" fill="#F25C05" />
      <text x="360" y="344" fontSize="12" fontWeight="bold" fill="#F25C05">
        70%
      </text>

      {/* Process */}
      <text x="50" y="375" fontSize="13" fill="#171614">
        Process
      </text>
      <rect x="50" y="385" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="385" width="180" height="10" rx="5" fill="#1D9BA3" />
      <text x="360" y="394" fontSize="12" fontWeight="bold" fill="#1D9BA3">
        60%
      </text>

      {/* Organization */}
      <text x="50" y="425" fontSize="13" fill="#171614">
        Organization
      </text>
      <rect x="50" y="435" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="435" width="195" height="10" rx="5" fill="#22c55e" />
      <text x="360" y="444" fontSize="12" fontWeight="bold" fill="#22c55e">
        65%
      </text>

      {/* Strategy */}
      <text x="50" y="475" fontSize="13" fill="#171614">
        Strategy
      </text>
      <rect x="50" y="485" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="485" width="225" height="10" rx="5" fill="#eab308" />
      <text x="360" y="494" fontSize="12" fontWeight="bold" fill="#eab308">
        75%
      </text>

      {/* Culture */}
      <text x="50" y="525" fontSize="13" fill="#171614">
        Culture
      </text>
      <rect x="50" y="535" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="535" width="165" height="10" rx="5" fill="#f97316" />
      <text x="360" y="544" fontSize="12" fontWeight="bold" fill="#f97316">
        55%
      </text>

      {/* Key Insights */}
      <rect x="410" y="260" width="360" height="320" rx="8" fill="#FFFFFF" />
      <rect x="410" y="260" width="360" height="320" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="430" y="290" fontSize="15" fontWeight="bold" fill="#171614">
        Key Insights
      </text>

      <circle cx="440" cy="320" r="3" fill="#22c55e" />
      <text x="455" y="325" fontSize="12" fill="#171614">
        Strong leadership alignment on
      </text>
      <text x="455" y="340" fontSize="12" fill="#78716C">
        digital strategy vision
      </text>

      <circle cx="440" cy="365" r="3" fill="#f97316" />
      <text x="455" y="370" fontSize="12" fill="#171614">
        Cultural readiness gaps identified
      </text>
      <text x="455" y="385" fontSize="12" fill="#78716C">
        in production teams
      </text>

      <circle cx="440" cy="410" r="3" fill="#F25C05" />
      <text x="455" y="415" fontSize="12" fill="#171614">
        Existing technology stack provides
      </text>
      <text x="455" y="430" fontSize="12" fill="#78716C">
        solid foundation for growth
      </text>

      <circle cx="440" cy="455" r="3" fill="#1D9BA3" />
      <text x="455" y="460" fontSize="12" fill="#171614">
        Process standardization needed
      </text>
      <text x="455" y="475" fontSize="12" fill="#78716C">
        before advanced automation
      </text>

      <rect x="430" y="510" width="320" height="50" rx="6" fill="#F5F5F4" />
      <text x="445" y="530" fontSize="11" fill="#78716C">
        Recommended Next Steps
      </text>
      <text x="445" y="548" fontSize="11" fontWeight="bold" fill="#F25C05">
        View Full Report
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

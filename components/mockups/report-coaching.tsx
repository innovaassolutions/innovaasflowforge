export default function ReportCoaching() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
    >
      {/* Browser Window Frame */}
      <rect width="800" height="600" rx="12" fill="#FFFEFB" />

      {/* Browser Chrome */}
      <rect width="800" height="40" rx="12" fill="#FAF8F3" />
      <circle cx="20" cy="20" r="6" fill="#ef4444" />
      <circle cx="40" cy="20" r="6" fill="#F25C05" />
      <circle cx="60" cy="20" r="6" fill="#22c55e" />

      {/* URL Bar */}
      <rect x="90" y="10" width="600" height="20" rx="4" fill="#FFFFFF" />
      <text x="100" y="25" fontSize="12" fill="#71706B" fontFamily="monospace">
        flowforge.innovaas.co/reports/archetype-discovery
      </text>

      {/* Header */}
      <rect y="40" width="800" height="80" fill="#FAF8F3" />
      <text x="30" y="75" fontSize="22" fontWeight="bold" fill="#171614">
        Leadership Profile Report
      </text>
      <text x="30" y="100" fontSize="13" fill="#1D9BA3" fontWeight="500">
        Archetype Discovery Session · Sarah Chen · Spring Cohort 2026
      </text>

      {/* Main Content */}
      <rect y="120" width="800" height="480" fill="#FFFEFB" />

      {/* Archetype Result Card */}
      <rect x="30" y="140" width="740" height="110" rx="8" fill="#FFFFFF" />
      <rect x="30" y="140" width="740" height="110" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="170" fontSize="13" fill="#71706B">
        Your Leadership Archetype
      </text>
      <text x="50" y="205" fontSize="36" fontWeight="bold" fill="url(#reportGradCoaching)">
        The Catalyst
      </text>
      <text x="50" y="235" fontSize="13" fill="#71706B">
        A visionary leader who ignites change and inspires collective momentum
      </text>

      {/* Archetype Icon - abstract symbol */}
      <g transform="translate(650, 195)">
        <circle cx="0" cy="0" r="40" fill="#FAF8F3" stroke="#F25C05" strokeWidth="2" />
        <path d="M-15,-15 L0,-25 L15,-15 L15,5 L0,20 L-15,5 Z" fill="#F25C05" opacity="0.3" stroke="#F25C05" strokeWidth="1.5" />
        <circle cx="0" cy="-2" r="8" fill="none" stroke="#F25C05" strokeWidth="2" />
        <line x1="0" y1="-10" x2="0" y2="6" stroke="#F25C05" strokeWidth="2" />
      </g>

      {/* Dimension Scores */}
      <rect x="30" y="270" width="360" height="310" rx="8" fill="#FFFFFF" />
      <rect x="30" y="270" width="360" height="310" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="300" fontSize="15" fontWeight="bold" fill="#171614">
        Dimension Scores
      </text>

      {/* Vision */}
      <text x="50" y="335" fontSize="13" fill="#171614">Vision</text>
      <rect x="50" y="345" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="345" width="270" height="10" rx="5" fill="#F25C05" />
      <text x="360" y="354" fontSize="12" fontWeight="bold" fill="#F25C05">90%</text>

      {/* Action */}
      <text x="50" y="385" fontSize="13" fill="#171614">Action</text>
      <rect x="50" y="395" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="395" width="225" height="10" rx="5" fill="#1D9BA3" />
      <text x="360" y="404" fontSize="12" fontWeight="bold" fill="#1D9BA3">75%</text>

      {/* Empathy */}
      <text x="50" y="435" fontSize="13" fill="#171614">Empathy</text>
      <rect x="50" y="445" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="445" width="255" height="10" rx="5" fill="#22c55e" />
      <text x="360" y="454" fontSize="12" fontWeight="bold" fill="#22c55e">85%</text>

      {/* Reflection */}
      <text x="50" y="485" fontSize="13" fill="#171614">Reflection</text>
      <rect x="50" y="495" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="495" width="195" height="10" rx="5" fill="#eab308" />
      <text x="360" y="504" fontSize="12" fontWeight="bold" fill="#eab308">65%</text>

      {/* Growth Edge */}
      <rect x="50" y="530" width="320" height="35" rx="6" fill="#FAF8F3" />
      <text x="65" y="548" fontSize="11" fill="#71706B">Growth Edge:</text>
      <text x="145" y="548" fontSize="11" fontWeight="bold" fill="#F25C05">Slowing down to deepen reflection</text>

      {/* Key Insights */}
      <rect x="410" y="270" width="360" height="310" rx="8" fill="#FFFFFF" />
      <rect x="410" y="270" width="360" height="310" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="430" y="300" fontSize="15" fontWeight="bold" fill="#171614">
        Pattern Insights
      </text>

      <circle cx="440" cy="330" r="3" fill="#22c55e" />
      <text x="455" y="335" fontSize="12" fill="#171614">Natural ability to inspire teams</text>
      <text x="455" y="350" fontSize="12" fill="#71706B">toward bold, shared visions</text>

      <circle cx="440" cy="375" r="3" fill="#F25C05" />
      <text x="455" y="380" fontSize="12" fill="#171614">Tension pattern: urgency vs. patience</text>
      <text x="455" y="395" fontSize="12" fill="#71706B">when driving organizational change</text>

      <circle cx="440" cy="420" r="3" fill="#1D9BA3" />
      <text x="455" y="425" fontSize="12" fill="#171614">High empathy scores indicate strong</text>
      <text x="455" y="440" fontSize="12" fill="#71706B">relational intelligence and trust-building</text>

      <circle cx="440" cy="465" r="3" fill="#eab308" />
      <text x="455" y="470" fontSize="12" fill="#171614">Reflection practice could unlock</text>
      <text x="455" y="485" fontSize="12" fill="#71706B">deeper strategic decision-making</text>

      <rect x="430" y="510" width="320" height="50" rx="6" fill="#FAF8F3" />
      <text x="445" y="530" fontSize="11" fill="#71706B">Your Development Journey</text>
      <text x="445" y="548" fontSize="11" fontWeight="bold" fill="#F25C05">View Full Profile →</text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="reportGradCoaching" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

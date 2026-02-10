export default function ReportEducation() {
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
        flowforge.innovaas.co/reports/institutional-feedback
      </text>

      {/* Header */}
      <rect y="40" width="800" height="80" fill="#FAF8F3" />
      <text x="30" y="75" fontSize="22" fontWeight="bold" fill="#171614">
        Parent &amp; Faculty Insights Report
      </text>
      <text x="30" y="100" fontSize="13" fill="#1D9BA3" fontWeight="500">
        Generated from 214 parent responses &amp; 32 faculty interviews · January 2026
      </text>

      {/* Main Content */}
      <rect y="120" width="800" height="480" fill="#FFFEFB" />

      {/* Overall Score Card */}
      <rect x="30" y="140" width="740" height="100" rx="8" fill="#FFFFFF" />
      <rect x="30" y="140" width="740" height="100" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="170" fontSize="16" fontWeight="bold" fill="#171614">
        Overall Satisfaction Score
      </text>
      <text x="50" y="215" fontSize="48" fontWeight="bold" fill="url(#reportGradEducation)">
        81%
      </text>
      <text x="180" y="195" fontSize="14" fill="#171614" fontWeight="500">
        High Satisfaction
      </text>
      <text x="180" y="215" fontSize="12" fill="#71706B">
        Strong academic reputation with
      </text>
      <text x="180" y="230" fontSize="12" fill="#71706B">
        opportunities in communication
      </text>

      {/* Radar Chart */}
      <g transform="translate(550, 190)">
        <circle cx="0" cy="0" r="80" fill="none" stroke="#E7E5E4" strokeWidth="1" />
        <circle cx="0" cy="0" r="60" fill="none" stroke="#E7E5E4" strokeWidth="1" />
        <circle cx="0" cy="0" r="40" fill="none" stroke="#E7E5E4" strokeWidth="1" />
        <circle cx="0" cy="0" r="20" fill="none" stroke="#E7E5E4" strokeWidth="1" />

        {/* 5 axes */}
        <line x1="0" y1="0" x2="0" y2="-80" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="76" y2="-25" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="47" y2="65" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="-47" y2="65" stroke="#E7E5E4" strokeWidth="1" />
        <line x1="0" y1="0" x2="-76" y2="-25" stroke="#E7E5E4" strokeWidth="1" />

        {/* Data polygon */}
        <polygon
          points="0,-52 65,-21 41,57 -29,49 -57,-19"
          fill="#1D9BA3"
          opacity="0.2"
          stroke="#1D9BA3"
          strokeWidth="2"
        />
        <circle cx="0" cy="-52" r="4" fill="#1D9BA3" />
        <circle cx="65" cy="-21" r="4" fill="#1D9BA3" />
        <circle cx="41" cy="57" r="4" fill="#1D9BA3" />
        <circle cx="-29" cy="49" r="4" fill="#1D9BA3" />
        <circle cx="-57" cy="-19" r="4" fill="#1D9BA3" />

        {/* Labels */}
        <text x="0" y="-88" fontSize="9" fill="#171614" textAnchor="middle">Communication</text>
        <text x="88" y="-20" fontSize="9" fill="#171614" textAnchor="start">Academic Quality</text>
        <text x="52" y="78" fontSize="9" fill="#171614" textAnchor="start">Student Support</text>
        <text x="-52" y="78" fontSize="9" fill="#171614" textAnchor="end">Facilities</text>
        <text x="-92" y="-20" fontSize="9" fill="#171614" textAnchor="end">Parent Engagement</text>
      </g>

      {/* Dimension Scores */}
      <rect x="30" y="260" width="360" height="320" rx="8" fill="#FFFFFF" />
      <rect x="30" y="260" width="360" height="320" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="290" fontSize="15" fontWeight="bold" fill="#171614">
        Satisfaction by Dimension
      </text>

      {/* Communication */}
      <text x="50" y="325" fontSize="13" fill="#171614">Communication</text>
      <rect x="50" y="335" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="335" width="195" height="10" rx="5" fill="#f97316" />
      <text x="360" y="344" fontSize="12" fontWeight="bold" fill="#f97316">65%</text>

      {/* Academic Quality */}
      <text x="50" y="375" fontSize="13" fill="#171614">Academic Quality</text>
      <rect x="50" y="385" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="385" width="270" height="10" rx="5" fill="#22c55e" />
      <text x="360" y="394" fontSize="12" fontWeight="bold" fill="#22c55e">90%</text>

      {/* Student Support */}
      <text x="50" y="425" fontSize="13" fill="#171614">Student Support</text>
      <rect x="50" y="435" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="435" width="255" height="10" rx="5" fill="#1D9BA3" />
      <text x="360" y="444" fontSize="12" fontWeight="bold" fill="#1D9BA3">85%</text>

      {/* Facilities */}
      <text x="50" y="475" fontSize="13" fill="#171614">Facilities</text>
      <rect x="50" y="485" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="485" width="225" height="10" rx="5" fill="#eab308" />
      <text x="360" y="494" fontSize="12" fontWeight="bold" fill="#eab308">75%</text>

      {/* Parent Engagement */}
      <text x="50" y="525" fontSize="13" fill="#171614">Parent Engagement</text>
      <rect x="50" y="535" width="300" height="10" rx="5" fill="#E7E5E4" />
      <rect x="50" y="535" width="240" height="10" rx="5" fill="#F25C05" />
      <text x="360" y="544" fontSize="12" fontWeight="bold" fill="#F25C05">80%</text>

      {/* Key Insights */}
      <rect x="410" y="260" width="360" height="320" rx="8" fill="#FFFFFF" />
      <rect x="410" y="260" width="360" height="320" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="430" y="290" fontSize="15" fontWeight="bold" fill="#171614">
        Parent Highlights
      </text>

      <circle cx="440" cy="320" r="3" fill="#22c55e" />
      <text x="455" y="325" fontSize="12" fill="#171614">&quot;Teachers are exceptional — our</text>
      <text x="455" y="340" fontSize="12" fill="#71706B">child thrives in this environment&quot;</text>

      <circle cx="440" cy="365" r="3" fill="#f97316" />
      <text x="455" y="370" fontSize="12" fill="#171614">Communication gaps between</text>
      <text x="455" y="385" fontSize="12" fill="#71706B">school and parents flagged by 42%</text>

      <circle cx="440" cy="410" r="3" fill="#1D9BA3" />
      <text x="455" y="415" fontSize="12" fill="#171614">Faculty recommend more PD time</text>
      <text x="455" y="430" fontSize="12" fill="#71706B">for collaborative curriculum design</text>

      <circle cx="440" cy="455" r="3" fill="#F25C05" />
      <text x="455" y="460" fontSize="12" fill="#171614">Student counseling services rated</text>
      <text x="455" y="475" fontSize="12" fill="#71706B">highly by both parents and staff</text>

      <rect x="430" y="510" width="320" height="50" rx="6" fill="#FAF8F3" />
      <text x="445" y="530" fontSize="11" fill="#71706B">Faculty Development Recommendations</text>
      <text x="445" y="548" fontSize="11" fontWeight="bold" fill="#F25C05">View Full Report →</text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="reportGradEducation" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

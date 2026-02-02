export default function DashboardEducation() {
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
        flowforge.ai/dashboard
      </text>

      {/* Sidebar */}
      <rect y="40" width="180" height="560" fill="#FAF8F3" />
      <text x="24" y="76" fontSize="15" fontWeight="bold" fill="#F25C05">
        FlowForge
      </text>

      <rect x="14" y="100" width="152" height="32" rx="6" fill="#FFFFFF" />
      <rect x="14" y="100" width="152" height="32" rx="6" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="28" y="121" fontSize="12" fill="#171614" fontWeight="500">Dashboard</text>

      <text x="28" y="158" fontSize="12" fill="#71706B">Campaigns</text>
      <text x="28" y="186" fontSize="12" fill="#71706B">Reports</text>
      <text x="28" y="214" fontSize="12" fill="#71706B">Analytics</text>

      {/* Main Content */}
      <rect x="180" y="40" width="620" height="560" fill="#FFFEFB" />

      {/* Header */}
      <text x="204" y="78" fontSize="20" fontWeight="bold" fill="#171614">
        School Health Overview
      </text>
      <text x="204" y="96" fontSize="12" fill="#71706B">
        January 2026 · Greenfield International School
      </text>

      {/* Row 1: Big score cards */}
      {/* Parent Satisfaction NPS */}
      <rect x="204" y="112" width="190" height="120" rx="8" fill="#FFFFFF" />
      <rect x="204" y="112" width="190" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="134" fontSize="11" fill="#71706B">Parent Satisfaction</text>

      {/* NPS gauge arc */}
      <g transform="translate(299, 190)">
        <path d="M-50,0 A50,50 0 0,1 50,0" fill="none" stroke="#E7E5E4" strokeWidth="8" strokeLinecap="round" />
        <path d="M-50,0 A50,50 0 0,1 38,-32" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
        <text x="0" y="-8" fontSize="28" fontWeight="bold" fill="#22c55e" textAnchor="middle">78</text>
        <text x="0" y="8" fontSize="10" fill="#71706B" textAnchor="middle">NPS</text>
      </g>

      {/* Faculty Alignment */}
      <rect x="404" y="112" width="190" height="120" rx="8" fill="#FFFFFF" />
      <rect x="404" y="112" width="190" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="420" y="134" fontSize="11" fill="#71706B">Faculty-Admin Alignment</text>

      <g transform="translate(499, 190)">
        <path d="M-50,0 A50,50 0 0,1 50,0" fill="none" stroke="#E7E5E4" strokeWidth="8" strokeLinecap="round" />
        <path d="M-50,0 A50,50 0 0,1 20,-46" fill="none" stroke="#1D9BA3" strokeWidth="8" strokeLinecap="round" />
        <text x="0" y="-8" fontSize="28" fontWeight="bold" fill="#1D9BA3" textAnchor="middle">72%</text>
        <text x="0" y="8" fontSize="10" fill="#71706B" textAnchor="middle">aligned</text>
      </g>

      {/* Communication Effectiveness */}
      <rect x="604" y="112" width="185" height="120" rx="8" fill="#FFFFFF" />
      <rect x="604" y="112" width="185" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="620" y="134" fontSize="11" fill="#71706B">Communication Rating</text>

      <g transform="translate(696, 190)">
        <path d="M-50,0 A50,50 0 0,1 50,0" fill="none" stroke="#E7E5E4" strokeWidth="8" strokeLinecap="round" />
        <path d="M-50,0 A50,50 0 0,1 -10,-49" fill="none" stroke="#f97316" strokeWidth="8" strokeLinecap="round" />
        <text x="0" y="-8" fontSize="28" fontWeight="bold" fill="#f97316" textAnchor="middle">61%</text>
        <text x="0" y="8" fontSize="10" fill="#71706B" textAnchor="middle">effective</text>
      </g>

      {/* Row 2: Student Retention + Department Health */}
      {/* Student Retention Risk */}
      <rect x="204" y="246" width="280" height="150" rx="8" fill="#FFFFFF" />
      <rect x="204" y="246" width="280" height="150" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="270" fontSize="13" fontWeight="bold" fill="#171614">Student Retention Risk</text>

      {/* Risk indicators */}
      <rect x="220" y="286" width="248" height="28" rx="4" fill="#FAF8F3" />
      <circle cx="236" cy="300" r="6" fill="#22c55e" />
      <text x="250" y="304" fontSize="11" fill="#171614">Years 1–3</text>
      <text x="430" y="304" fontSize="12" fontWeight="bold" fill="#22c55e" textAnchor="end">Low risk</text>

      <rect x="220" y="320" width="248" height="28" rx="4" fill="transparent" />
      <circle cx="236" cy="334" r="6" fill="#eab308" />
      <text x="250" y="338" fontSize="11" fill="#171614">Years 4–6</text>
      <text x="430" y="338" fontSize="12" fontWeight="bold" fill="#eab308" textAnchor="end">Moderate</text>

      <rect x="220" y="354" width="248" height="28" rx="4" fill="transparent" />
      <circle cx="236" cy="368" r="6" fill="#f97316" />
      <text x="250" y="372" fontSize="11" fill="#171614">Years 7–9</text>
      <text x="430" y="372" fontSize="12" fontWeight="bold" fill="#f97316" textAnchor="end">Elevated</text>

      {/* Department Health Scores */}
      <rect x="496" y="246" width="293" height="150" rx="8" fill="#FFFFFF" />
      <rect x="496" y="246" width="293" height="150" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="270" fontSize="13" fontWeight="bold" fill="#171614">Department Health</text>

      {/* Horizontal mini bar chart */}
      <text x="512" y="296" fontSize="11" fill="#171614">Science</text>
      <rect x="580" y="286" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="580" y="286" width="126" height="10" rx="5" fill="#22c55e" />
      <text x="730" y="296" fontSize="10" fontWeight="bold" fill="#22c55e">90</text>

      <text x="512" y="318" fontSize="11" fill="#171614">Humanities</text>
      <rect x="580" y="308" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="580" y="308" width="112" height="10" rx="5" fill="#1D9BA3" />
      <text x="730" y="318" fontSize="10" fontWeight="bold" fill="#1D9BA3">80</text>

      <text x="512" y="340" fontSize="11" fill="#171614">Maths</text>
      <rect x="580" y="330" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="580" y="330" width="105" height="10" rx="5" fill="#eab308" />
      <text x="730" y="340" fontSize="10" fontWeight="bold" fill="#eab308">75</text>

      <text x="512" y="362" fontSize="11" fill="#171614">Languages</text>
      <rect x="580" y="352" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="580" y="352" width="119" height="10" rx="5" fill="#22c55e" />
      <text x="730" y="362" fontSize="10" fontWeight="bold" fill="#22c55e">85</text>

      <text x="512" y="384" fontSize="11" fill="#171614">PE &amp; Arts</text>
      <rect x="580" y="374" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="580" y="374" width="91" height="10" rx="5" fill="#f97316" />
      <text x="730" y="384" fontSize="10" fontWeight="bold" fill="#f97316">65</text>

      {/* Row 3: Trending Concerns */}
      <rect x="204" y="410" width="585" height="180" rx="8" fill="#FFFFFF" />
      <rect x="204" y="410" width="585" height="180" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="434" fontSize="13" fontWeight="bold" fill="#171614">Trending Concerns</text>
      <text x="700" y="434" fontSize="11" fill="#71706B" textAnchor="end">Last 30 days</text>

      {/* Concern items with trend indicators */}
      <rect x="220" y="450" width="553" height="36" rx="6" fill="#FAF8F3" />
      <rect x="228" y="458" width="4" height="20" rx="2" fill="#ef4444" />
      <text x="244" y="466" fontSize="12" fill="#171614" fontWeight="500">School-home communication frequency</text>
      <text x="244" y="480" fontSize="10" fill="#71706B">Mentioned by 42% of parents</text>
      <text x="740" y="472" fontSize="11" fontWeight="bold" fill="#ef4444" textAnchor="end">↑ Rising</text>

      <rect x="220" y="494" width="553" height="36" rx="6" fill="transparent" />
      <rect x="228" y="502" width="4" height="20" rx="2" fill="#f97316" />
      <text x="244" y="510" fontSize="12" fill="#171614" fontWeight="500">Homework load in Years 7–9</text>
      <text x="244" y="524" fontSize="10" fill="#71706B">Flagged by 28% of parents &amp; 3 faculty members</text>
      <text x="740" y="516" fontSize="11" fontWeight="bold" fill="#f97316" textAnchor="end">→ Stable</text>

      <rect x="220" y="538" width="553" height="36" rx="6" fill="transparent" />
      <rect x="228" y="546" width="4" height="20" rx="2" fill="#22c55e" />
      <text x="244" y="554" fontSize="12" fill="#171614" fontWeight="500">Cafeteria food quality</text>
      <text x="244" y="568" fontSize="10" fill="#71706B">Previously #1 concern — now resolved after vendor change</text>
      <text x="740" y="560" fontSize="11" fontWeight="bold" fill="#22c55e" textAnchor="end">↓ Resolved</text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="dashGradEducation" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function DashboardCoaching() {
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
        flowforge.innovaas.co/dashboard
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
        Practice Overview
      </text>
      <text x="204" y="96" fontSize="12" fill="#71706B">
        January 2026 · Spring Cohort Active
      </text>

      {/* Row 1: KPI score cards */}
      <rect x="204" y="112" width="140" height="80" rx="8" fill="#FFFFFF" />
      <rect x="204" y="112" width="140" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="132" fontSize="10" fill="#71706B">Active Clients</text>
      <text x="220" y="162" fontSize="30" fontWeight="bold" fill="#F25C05">18</text>
      <text x="220" y="180" fontSize="10" fill="#22c55e">↑ 3 new this month</text>

      <rect x="354" y="112" width="140" height="80" rx="8" fill="#FFFFFF" />
      <rect x="354" y="112" width="140" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="370" y="132" fontSize="10" fill="#71706B">Sessions Done</text>
      <text x="370" y="162" fontSize="30" fontWeight="bold" fill="#1D9BA3">47</text>
      <text x="370" y="180" fontSize="10" fill="#71706B">of 72 planned</text>

      <rect x="504" y="112" width="140" height="80" rx="8" fill="#FFFFFF" />
      <rect x="504" y="112" width="140" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="520" y="132" fontSize="10" fill="#71706B">Archetypes Mapped</text>
      <text x="520" y="162" fontSize="30" fontWeight="bold" fill="#22c55e">12</text>
      <text x="520" y="180" fontSize="10" fill="#71706B">profiles generated</text>

      <rect x="654" y="112" width="135" height="80" rx="8" fill="#FFFFFF" />
      <rect x="654" y="112" width="135" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="670" y="132" fontSize="10" fill="#71706B">Client Satisfaction</text>
      <text x="670" y="162" fontSize="30" fontWeight="bold" fill="#F25C05">4.8</text>
      <text x="706" y="162" fontSize="14" fill="#71706B">/5</text>
      <text x="670" y="180" fontSize="10" fill="#22c55e">↑ from 4.5</text>

      {/* Row 2: Archetype Distribution + Growth Edge Trends */}
      {/* Archetype Distribution */}
      <rect x="204" y="206" width="280" height="185" rx="8" fill="#FFFFFF" />
      <rect x="204" y="206" width="280" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="230" fontSize="13" fontWeight="bold" fill="#171614">Archetype Distribution</text>
      <text x="420" y="230" fontSize="10" fill="#71706B" textAnchor="end">12 clients</text>

      {/* Donut chart - simplified */}
      <g transform="translate(280, 320)">
        <circle cx="0" cy="0" r="48" fill="none" stroke="#E7E5E4" strokeWidth="16" />
        {/* Catalyst segment ~33% */}
        <circle cx="0" cy="0" r="48" fill="none" stroke="#F25C05" strokeWidth="16"
          strokeDasharray="100 201" strokeDashoffset="0" transform="rotate(-90)" />
        {/* Strategist segment ~25% */}
        <circle cx="0" cy="0" r="48" fill="none" stroke="#1D9BA3" strokeWidth="16"
          strokeDasharray="75 226" strokeDashoffset="-100" transform="rotate(-90)" />
        {/* Nurturer segment ~25% */}
        <circle cx="0" cy="0" r="48" fill="none" stroke="#22c55e" strokeWidth="16"
          strokeDasharray="75 226" strokeDashoffset="-175" transform="rotate(-90)" />
        {/* Maverick segment ~17% */}
        <circle cx="0" cy="0" r="48" fill="none" stroke="#eab308" strokeWidth="16"
          strokeDasharray="51 250" strokeDashoffset="-250" transform="rotate(-90)" />
      </g>

      {/* Legend */}
      <circle cx="370" y="282" r="4" fill="#F25C05" />
      <text x="380" y="286" fontSize="10" fill="#171614">Catalyst (4)</text>
      <circle cx="370" y="300" r="4" fill="#1D9BA3" />
      <text x="380" y="304" fontSize="10" fill="#171614">Strategist (3)</text>
      <circle cx="370" y="318" r="4" fill="#22c55e" />
      <text x="380" y="322" fontSize="10" fill="#171614">Nurturer (3)</text>
      <circle cx="370" y="336" r="4" fill="#eab308" />
      <text x="380" y="340" fontSize="10" fill="#171614">Maverick (2)</text>

      {/* Growth Edge Trends */}
      <rect x="496" y="206" width="293" height="185" rx="8" fill="#FFFFFF" />
      <rect x="496" y="206" width="293" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="230" fontSize="13" fontWeight="bold" fill="#171614">Growth Edge Trends</text>
      <text x="512" y="246" fontSize="10" fill="#71706B">Most common across cohort</text>

      <rect x="512" y="260" width="261" height="28" rx="4" fill="#FAF8F3" />
      <text x="524" y="278" fontSize="11" fill="#171614">Reflection &amp; slowing down</text>
      <rect x="700" y="268" width="60" height="14" rx="7" fill="#F25C05" opacity="0.15" />
      <text x="730" y="279" fontSize="9" fontWeight="bold" fill="#F25C05" textAnchor="middle">42%</text>

      <rect x="512" y="294" width="261" height="28" rx="4" fill="transparent" />
      <text x="524" y="312" fontSize="11" fill="#171614">Delegation &amp; trust</text>
      <rect x="700" y="302" width="60" height="14" rx="7" fill="#1D9BA3" opacity="0.15" />
      <text x="730" y="313" fontSize="9" fontWeight="bold" fill="#1D9BA3" textAnchor="middle">33%</text>

      <rect x="512" y="328" width="261" height="28" rx="4" fill="transparent" />
      <text x="524" y="346" fontSize="11" fill="#171614">Assertive communication</text>
      <rect x="700" y="336" width="60" height="14" rx="7" fill="#eab308" opacity="0.15" />
      <text x="730" y="347" fontSize="9" fontWeight="bold" fill="#eab308" textAnchor="middle">25%</text>

      <rect x="512" y="362" width="261" height="22" rx="4" fill="transparent" />
      <text x="524" y="378" fontSize="11" fill="#171614">Strategic patience</text>
      <rect x="700" y="368" width="60" height="14" rx="7" fill="#22c55e" opacity="0.15" />
      <text x="730" y="379" fontSize="9" fontWeight="bold" fill="#22c55e" textAnchor="middle">17%</text>

      {/* Row 3: Client Progress + Upcoming */}
      {/* Client Progress */}
      <rect x="204" y="405" width="390" height="185" rx="8" fill="#FFFFFF" />
      <rect x="204" y="405" width="390" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="429" fontSize="13" fontWeight="bold" fill="#171614">Client Progress</text>

      {/* Client rows */}
      <text x="220" y="454" fontSize="11" fill="#171614">Sarah Chen</text>
      <rect x="320" y="445" width="200" height="8" rx="4" fill="#E7E5E4" />
      <rect x="320" y="445" width="200" height="8" rx="4" fill="#22c55e" />
      <text x="530" y="454" fontSize="10" fontWeight="bold" fill="#22c55e">Done</text>

      <text x="220" y="476" fontSize="11" fill="#171614">Marcus Rivera</text>
      <rect x="320" y="467" width="200" height="8" rx="4" fill="#E7E5E4" />
      <rect x="320" y="467" width="150" height="8" rx="4" fill="#1D9BA3" />
      <text x="530" y="476" fontSize="10" fontWeight="bold" fill="#1D9BA3">75%</text>

      <text x="220" y="498" fontSize="11" fill="#171614">Aisha Patel</text>
      <rect x="320" y="489" width="200" height="8" rx="4" fill="#E7E5E4" />
      <rect x="320" y="489" width="100" height="8" rx="4" fill="#F25C05" />
      <text x="530" y="498" fontSize="10" fontWeight="bold" fill="#F25C05">50%</text>

      <text x="220" y="520" fontSize="11" fill="#171614">James Okoye</text>
      <rect x="320" y="511" width="200" height="8" rx="4" fill="#E7E5E4" />
      <rect x="320" y="511" width="50" height="8" rx="4" fill="#eab308" />
      <text x="530" y="520" fontSize="10" fontWeight="bold" fill="#eab308">25%</text>

      <text x="220" y="542" fontSize="11" fill="#171614">Lisa Nakamura</text>
      <rect x="320" y="533" width="200" height="8" rx="4" fill="#E7E5E4" />
      <rect x="320" y="533" width="20" height="8" rx="4" fill="#71706B" />
      <text x="530" y="542" fontSize="10" fontWeight="bold" fill="#71706B">New</text>

      <text x="220" y="576" fontSize="10" fill="#71706B">+ 13 more clients</text>

      {/* Upcoming & Recent */}
      <rect x="604" y="405" width="185" height="185" rx="8" fill="#FFFFFF" />
      <rect x="604" y="405" width="185" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="620" y="429" fontSize="13" fontWeight="bold" fill="#171614">Upcoming</text>

      <rect x="620" y="442" width="153" height="42" rx="4" fill="#FAF8F3" />
      <text x="632" y="458" fontSize="10" fontWeight="500" fill="#171614">Marcus Rivera</text>
      <text x="632" y="474" fontSize="9" fill="#71706B">Tomorrow · 2:00 PM</text>

      <rect x="620" y="492" width="153" height="42" rx="4" fill="#FAF8F3" />
      <text x="632" y="508" fontSize="10" fontWeight="500" fill="#171614">Aisha Patel</text>
      <text x="632" y="524" fontSize="9" fill="#71706B">Wed · 10:00 AM</text>

      <text x="620" y="556" fontSize="11" fontWeight="bold" fill="#F25C05">Recent Completion</text>
      <text x="620" y="572" fontSize="10" fill="#171614">Sarah Chen</text>
      <text x="620" y="584" fontSize="9" fill="#22c55e">Archetype: The Catalyst ✓</text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="dashGradCoaching" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

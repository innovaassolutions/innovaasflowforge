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
        flowforge.ai/dashboard/campaigns
      </text>

      {/* Sidebar */}
      <rect y="40" width="200" height="560" fill="#FAF8F3" />
      <text x="30" y="80" fontSize="16" fontWeight="bold" fill="#F25C05">
        FlowForge
      </text>

      {/* Sidebar Nav Items */}
      <rect x="20" y="110" width="160" height="35" rx="6" fill="#FFFFFF" />
      <rect x="20" y="110" width="160" height="35" rx="6" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="35" y="133" fontSize="13" fill="#171614" fontWeight="500">
        Campaigns
      </text>

      <rect x="20" y="155" width="160" height="35" rx="6" fill="transparent" />
      <text x="35" y="178" fontSize="13" fill="#71706B">
        Reports
      </text>

      <rect x="20" y="200" width="160" height="35" rx="6" fill="transparent" />
      <text x="35" y="223" fontSize="13" fill="#71706B">
        Analytics
      </text>

      {/* Main Content Area */}
      <rect x="200" y="40" width="600" height="560" fill="#FFFEFB" />

      {/* Header */}
      <text x="230" y="85" fontSize="24" fontWeight="bold" fill="#171614">
        Coaching Programs
      </text>
      <rect x="550" y="65" width="220" height="35" rx="17.5" fill="url(#dashGradCoaching)" />
      <text x="595" y="88" fontSize="14" fontWeight="500" fill="#FFFFFF">
        New Campaign
      </text>

      {/* Stats Row */}
      <rect x="230" y="105" width="160" height="50" rx="6" fill="#FFFFFF" />
      <rect x="230" y="105" width="160" height="50" rx="6" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="125" fontSize="11" fill="#71706B">Active Clients</text>
      <text x="250" y="145" fontSize="20" fontWeight="bold" fill="#F25C05">18</text>

      <rect x="405" y="105" width="160" height="50" rx="6" fill="#FFFFFF" />
      <rect x="405" y="105" width="160" height="50" rx="6" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="425" y="125" fontSize="11" fill="#71706B">Sessions Completed</text>
      <text x="425" y="145" fontSize="20" fontWeight="bold" fill="#1D9BA3">47</text>

      <rect x="580" y="105" width="160" height="50" rx="6" fill="#FFFFFF" />
      <rect x="580" y="105" width="160" height="50" rx="6" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="600" y="125" fontSize="11" fill="#71706B">Archetypes Mapped</text>
      <text x="600" y="145" fontSize="20" fontWeight="bold" fill="#22c55e">12</text>

      {/* Card 1 */}
      <rect x="230" y="175" width="520" height="120" rx="8" fill="#FFFFFF" />
      <rect x="230" y="175" width="520" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="205" fontSize="16" fontWeight="bold" fill="#171614">
        Leadership Archetype Discovery - Spring Cohort
      </text>
      <text x="250" y="230" fontSize="13" fill="#1D9BA3" fontWeight="500">
        Active
      </text>
      <text x="300" y="230" fontSize="13" fill="#71706B">
        10 clients · cohort program
      </text>
      <rect x="250" y="245" width="400" height="8" rx="4" fill="#E7E5E4" />
      <rect x="250" y="245" width="280" height="8" rx="4" fill="#22c55e" />
      <text x="250" y="275" fontSize="12" fill="#71706B">
        7 of 10 discovery sessions completed
      </text>
      <rect x="670" y="200" width="60" height="25" rx="4" fill="#F25C05" opacity="0.1" />
      <rect x="670" y="200" width="60" height="25" rx="4" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="684" y="218" fontSize="11" fill="#F25C05" fontWeight="500">
        View
      </text>

      {/* Card 2 */}
      <rect x="230" y="315" width="520" height="120" rx="8" fill="#FFFFFF" />
      <rect x="230" y="315" width="520" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="345" fontSize="16" fontWeight="bold" fill="#171614">
        Career Transition Program - Q1 2026
      </text>
      <text x="250" y="370" fontSize="13" fill="#F25C05" fontWeight="500">
        In Progress
      </text>
      <text x="330" y="370" fontSize="13" fill="#71706B">
        8 clients · individual coaching
      </text>
      <rect x="250" y="385" width="400" height="8" rx="4" fill="#E7E5E4" />
      <rect x="250" y="385" width="150" height="8" rx="4" fill="#F25C05" />
      <text x="250" y="415" fontSize="12" fill="#71706B">
        3 of 8 sessions completed
      </text>
      <rect x="670" y="340" width="60" height="25" rx="4" fill="#F25C05" opacity="0.1" />
      <rect x="670" y="340" width="60" height="25" rx="4" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="684" y="358" fontSize="11" fill="#F25C05" fontWeight="500">
        View
      </text>

      {/* Card 3 */}
      <rect x="230" y="455" width="520" height="120" rx="8" fill="#FFFFFF" />
      <rect x="230" y="455" width="520" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="485" fontSize="16" fontWeight="bold" fill="#171614">
        Executive Presence Workshop - Autumn 2025
      </text>
      <text x="250" y="510" fontSize="13" fill="#22c55e" fontWeight="500">
        Completed
      </text>
      <text x="325" y="510" fontSize="13" fill="#71706B">
        12 clients · group program
      </text>
      <rect x="250" y="525" width="400" height="8" rx="4" fill="#22c55e" />
      <text x="250" y="555" fontSize="12" fill="#71706B">
        12 of 12 sessions completed
      </text>
      <rect x="650" y="480" width="80" height="25" rx="4" fill="#22c55e" opacity="0.1" />
      <rect x="650" y="480" width="80" height="25" rx="4" fill="none" stroke="#22c55e" strokeWidth="1" />
      <text x="667" y="498" fontSize="11" fill="#22c55e" fontWeight="500">
        Report
      </text>

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

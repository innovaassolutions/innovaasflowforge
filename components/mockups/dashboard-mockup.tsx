export default function DashboardMockup() {
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
        flowforge.ai/dashboard/campaigns
      </text>

      {/* Sidebar */}
      <rect y="40" width="200" height="560" fill="#F5F5F4" />
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
      <text x="35" y="178" fontSize="13" fill="#78716C">
        Reports
      </text>

      <rect x="20" y="200" width="160" height="35" rx="6" fill="transparent" />
      <text x="35" y="223" fontSize="13" fill="#78716C">
        Analytics
      </text>

      {/* Main Content Area */}
      <rect x="200" y="40" width="600" height="560" fill="#FFFEFB" />

      {/* Header */}
      <text x="230" y="85" fontSize="24" fontWeight="bold" fill="#171614">
        Assessment Campaigns
      </text>
      <rect x="550" y="65" width="220" height="35" rx="17.5" fill="url(#gradient)" />
      <text x="595" y="88" fontSize="14" fontWeight="500" fill="#FFFFFF">
        New Campaign
      </text>

      {/* Campaign Cards */}
      {/* Card 1 */}
      <rect x="230" y="130" width="520" height="120" rx="8" fill="#FFFFFF" />
      <rect x="230" y="130" width="520" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="160" fontSize="16" fontWeight="bold" fill="#171614">
        Manufacturing Digital Readiness 2024
      </text>
      <text x="250" y="185" fontSize="13" fill="#1D9BA3" fontWeight="500">
        Active
      </text>
      <text x="300" y="185" fontSize="13" fill="#78716C">
        12 stakeholders
      </text>
      <rect x="250" y="200" width="400" height="8" rx="4" fill="#E7E5E4" />
      <rect x="250" y="200" width="280" height="8" rx="4" fill="#22c55e" />
      <text x="250" y="230" fontSize="12" fill="#78716C">
        8 of 12 interviews completed
      </text>
      <rect x="670" y="155" width="60" height="25" rx="4" fill="#F25C05" opacity="0.1" />
      <rect x="670" y="155" width="60" height="25" rx="4" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="684" y="173" fontSize="11" fill="#F25C05" fontWeight="500">
        View
      </text>

      {/* Card 2 */}
      <rect x="230" y="270" width="520" height="120" rx="8" fill="#FFFFFF" />
      <rect x="230" y="270" width="520" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="300" fontSize="16" fontWeight="bold" fill="#171614">
        Healthcare Process Optimization
      </text>
      <text x="250" y="325" fontSize="13" fill="#F25C05" fontWeight="500">
        Planning
      </text>
      <text x="310" y="325" fontSize="13" fill="#78716C">
        8 stakeholders
      </text>
      <rect x="250" y="340" width="400" height="8" rx="4" fill="#E7E5E4" />
      <rect x="250" y="340" width="100" height="8" rx="4" fill="#F25C05" />
      <text x="250" y="370" fontSize="12" fill="#78716C">
        2 of 8 interviews completed
      </text>
      <rect x="670" y="295" width="60" height="25" rx="4" fill="#F25C05" opacity="0.1" />
      <rect x="670" y="295" width="60" height="25" rx="4" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="684" y="313" fontSize="11" fill="#F25C05" fontWeight="500">
        View
      </text>

      {/* Card 3 */}
      <rect x="230" y="410" width="520" height="120" rx="8" fill="#FFFFFF" />
      <rect x="230" y="410" width="520" height="120" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="250" y="440" fontSize="16" fontWeight="bold" fill="#171614">
        Lean Six Sigma Workshop Series
      </text>
      <text x="250" y="465" fontSize="13" fill="#22c55e" fontWeight="500">
        Completed
      </text>
      <text x="325" y="465" fontSize="13" fill="#78716C">
        15 stakeholders
      </text>
      <rect x="250" y="480" width="400" height="8" rx="4" fill="#22c55e" />
      <text x="250" y="510" fontSize="12" fill="#78716C">
        15 of 15 interviews completed
      </text>
      <rect x="650" y="435" width="80" height="25" rx="4" fill="#22c55e" opacity="0.1" />
      <rect x="650" y="435" width="80" height="25" rx="4" fill="none" stroke="#22c55e" strokeWidth="1" />
      <text x="667" y="453" fontSize="11" fill="#22c55e" fontWeight="500">
        Report
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

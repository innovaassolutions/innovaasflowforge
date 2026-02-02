// Coaching Industry Hero Mockup - Shows archetype discovery and client progress insights
export default function IndustryHeroCoaching() {
  return (
    <svg
      viewBox="0 0 900 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <defs>
        {/* Industry gradient - warm rose */}
        <linearGradient id="coach-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#F25C05" />
        </linearGradient>
        <filter id="coach-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background panels */}
      <rect x="40" y="30" width="380" height="440" rx="16" fill="#FFFEFB" filter="drop-shadow(0 4px 20px rgba(0,0,0,0.08))" />
      <rect x="480" y="30" width="380" height="440" rx="16" fill="#FFFEFB" filter="drop-shadow(0 4px 20px rgba(0,0,0,0.08))" />

      {/* LEFT PANEL - Archetype Discovery Results */}
      <rect x="40" y="30" width="380" height="50" rx="16" fill="#FAF8F3" />
      <rect x="40" y="64" width="380" height="1" fill="#E7E5E4" />
      <circle cx="65" cy="55" r="8" fill="#E11D48" />
      <text x="82" y="60" fontSize="14" fontWeight="600" fill="#171614">Leadership Archetype Profile</text>

      {/* Heart/compass icon */}
      <rect x="60" y="100" width="60" height="60" rx="12" fill="#E11D48" fillOpacity="0.1" />
      <path d="M90 115 C85 110, 75 110, 75 120 C75 130, 90 140, 90 140 C90 140, 105 130, 105 120 C105 110, 95 110, 90 115 Z" fill="none" stroke="#E11D48" strokeWidth="2.5" />

      {/* Client info */}
      <text x="140" y="125" fontSize="16" fontWeight="600" fill="#171614">Sarah Chen</text>
      <text x="140" y="145" fontSize="12" fill="#71706B">Leadership Discovery • Session Complete</text>

      {/* Primary Archetype */}
      <rect x="60" y="175" width="340" height="90" rx="12" fill="#E11D48" fillOpacity="0.05" />
      <text x="80" y="200" fontSize="11" fontWeight="600" fill="#71706B">PRIMARY ARCHETYPE</text>

      <text x="80" y="228" fontSize="22" fontWeight="700" fill="#E11D48">The Catalyst</text>
      <text x="80" y="248" fontSize="11" fill="#71706B">Drives change through vision and energy • Action-oriented</text>

      {/* Archetype strength bars */}
      <g transform="translate(60, 280)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#71706B">ARCHETYPE DIMENSIONS</text>

        {/* Vision */}
        <rect x="0" y="15" width="340" height="22" rx="4" fill="#FAF8F3" />
        <rect x="0" y="15" width="306" height="22" rx="4" fill="#E11D48" fillOpacity="0.15">
          <animate attributeName="width" from="0" to="306" dur="1s" fill="freeze" />
        </rect>
        <text x="8" y="30" fontSize="10" fill="#171614">Vision & Purpose</text>
        <text x="314" y="30" fontSize="10" fontWeight="600" fill="#E11D48">90%</text>

        {/* Action */}
        <rect x="0" y="43" width="340" height="22" rx="4" fill="#FAF8F3" />
        <rect x="0" y="43" width="272" height="22" rx="4" fill="#F25C05" fillOpacity="0.15">
          <animate attributeName="width" from="0" to="272" dur="1s" fill="freeze" begin="0.1s" />
        </rect>
        <text x="8" y="58" fontSize="10" fill="#171614">Action Orientation</text>
        <text x="314" y="58" fontSize="10" fontWeight="600" fill="#F25C05">80%</text>

        {/* Empathy */}
        <rect x="0" y="71" width="340" height="22" rx="4" fill="#FAF8F3" />
        <rect x="0" y="71" width="204" height="22" rx="4" fill="#1D9BA3" fillOpacity="0.15">
          <animate attributeName="width" from="0" to="204" dur="1s" fill="freeze" begin="0.2s" />
        </rect>
        <text x="8" y="86" fontSize="10" fill="#171614">Empathic Connection</text>
        <text x="314" y="86" fontSize="10" fontWeight="600" fill="#1D9BA3">60%</text>

        {/* Reflection */}
        <rect x="0" y="99" width="340" height="22" rx="4" fill="#FAF8F3" />
        <rect x="0" y="99" width="170" height="22" rx="4" fill="#8B5CF6" fillOpacity="0.15">
          <animate attributeName="width" from="0" to="170" dur="1s" fill="freeze" begin="0.3s" />
        </rect>
        <text x="8" y="114" fontSize="10" fill="#171614">Reflective Practice</text>
        <text x="314" y="114" fontSize="10" fontWeight="600" fill="#8B5CF6">50%</text>
      </g>

      {/* Growth edge */}
      <rect x="60" y="410" width="340" height="50" rx="8" fill="#FFFEFB" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="85" cy="435" r="12" fill="#F59E0B" />
      <text x="82" y="439" fontSize="12" fill="white" textAnchor="middle">✦</text>
      <text x="105" y="428" fontSize="11" fontWeight="600" fill="#171614">Growth Edge Identified</text>
      <text x="105" y="445" fontSize="10" fill="#71706B">Slowing down to listen before acting — your superpower gap</text>

      {/* RIGHT PANEL - Session Insights */}
      <rect x="480" y="30" width="380" height="50" rx="16" fill="#171614" />
      <text x="510" y="60" fontSize="14" fontWeight="600" fill="#FFFEFB">Session Intelligence</text>
      <circle cx="830" cy="55" r="6" fill="#22C55E">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Client cohort overview */}
      <g transform="translate(510, 95)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#71706B">COHORT OVERVIEW — 24 CLIENTS</text>

        {/* Archetype distribution */}
        <rect x="0" y="20" width="80" height="65" rx="8" fill="#E11D48" fillOpacity="0.1" stroke="#E11D48" strokeWidth="1" />
        <text x="40" y="50" fontSize="20" fontWeight="700" fill="#E11D48" textAnchor="middle">8</text>
        <text x="40" y="70" fontSize="9" fill="#71706B" textAnchor="middle">Catalysts</text>

        <rect x="90" y="20" width="80" height="65" rx="8" fill="#1D9BA3" fillOpacity="0.1" stroke="#1D9BA3" strokeWidth="1" />
        <text x="130" y="50" fontSize="20" fontWeight="700" fill="#1D9BA3" textAnchor="middle">6</text>
        <text x="130" y="70" fontSize="9" fill="#71706B" textAnchor="middle">Connectors</text>

        <rect x="180" y="20" width="80" height="65" rx="8" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="1" />
        <text x="220" y="50" fontSize="20" fontWeight="700" fill="#8B5CF6" textAnchor="middle">6</text>
        <text x="220" y="70" fontSize="9" fill="#71706B" textAnchor="middle">Architects</text>

        <rect x="270" y="20" width="80" height="65" rx="8" fill="#F59E0B" fillOpacity="0.1" stroke="#F59E0B" strokeWidth="1" />
        <text x="310" y="50" fontSize="20" fontWeight="700" fill="#F59E0B" textAnchor="middle">4</text>
        <text x="310" y="70" fontSize="9" fill="#71706B" textAnchor="middle">Guardians</text>
      </g>

      {/* Session completion */}
      <g transform="translate(510, 200)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#71706B">SESSION PROGRESS</text>

        <rect x="0" y="15" width="320" height="8" rx="4" fill="#E7E5E4" />
        <rect x="0" y="15" width="256" height="8" rx="4" fill="url(#coach-gradient)">
          <animate attributeName="width" from="0" to="256" dur="1.2s" fill="freeze" />
        </rect>
        <text x="330" y="22" fontSize="11" fontWeight="600" fill="#E11D48">80%</text>
        <text x="0" y="38" fontSize="10" fill="#71706B">20 of 24 discovery sessions complete</text>
      </g>

      {/* Emerging themes */}
      <text x="510" y="270" fontSize="11" fontWeight="600" fill="#171614">Emerging Themes Across Cohort</text>

      <g transform="translate(510, 285)">
        <rect x="0" y="0" width="320" height="38" rx="6" fill="#E11D48" fillOpacity="0.1" />
        <circle cx="18" cy="19" r="10" fill="#E11D48" />
        <text x="18" y="23" fontSize="9" fill="white" textAnchor="middle">1</text>
        <text x="38" y="16" fontSize="10" fontWeight="500" fill="#171614">Empathy gap under pressure</text>
        <text x="38" y="30" fontSize="9" fill="#71706B">14 of 20 clients show action-over-listening pattern</text>
      </g>

      <g transform="translate(510, 330)">
        <rect x="0" y="0" width="320" height="38" rx="6" fill="#1D9BA3" fillOpacity="0.1" />
        <circle cx="18" cy="19" r="10" fill="#1D9BA3" />
        <text x="18" y="23" fontSize="9" fill="white" textAnchor="middle">2</text>
        <text x="38" y="16" fontSize="10" fontWeight="500" fill="#171614">Purpose clarity drives engagement</text>
        <text x="38" y="30" fontSize="9" fill="#71706B">Strong correlation: vision score ↔ team satisfaction</text>
      </g>

      <g transform="translate(510, 375)">
        <rect x="0" y="0" width="320" height="38" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
        <circle cx="18" cy="19" r="10" fill="#8B5CF6" />
        <text x="18" y="23" fontSize="9" fill="white" textAnchor="middle">3</text>
        <text x="38" y="16" fontSize="10" fontWeight="500" fill="#171614">Delegation resistance in Catalysts</text>
        <text x="38" y="30" fontSize="9" fill="#71706B">High-vision leaders struggle to let go of execution</text>
      </g>

      {/* Methodology badge */}
      <rect x="510" y="430" width="320" height="35" rx="6" fill="#FAF8F3" />
      <text x="530" y="452" fontSize="11" fill="#71706B">Methodology:</text>
      <text x="603" y="452" fontSize="11" fontWeight="600" fill="#E11D48">Leading with Meaning™ Framework</text>
    </svg>
  )
}

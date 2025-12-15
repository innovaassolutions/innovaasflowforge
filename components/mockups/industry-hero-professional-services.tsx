// Professional Services Industry Hero Mockup - Shows firm-wide insights and client intelligence
export default function IndustryHeroProfessionalServices() {
  return (
    <svg
      viewBox="0 0 900 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <defs>
        {/* Industry gradient - corporate purple */}
        <linearGradient id="ps-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <filter id="ps-glow" x="-50%" y="-50%" width="200%" height="200%">
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

      {/* LEFT PANEL - Partner Alignment */}
      <rect x="40" y="30" width="380" height="50" rx="16" fill="#FAF8F3" />
      <rect x="40" y="64" width="380" height="1" fill="#E7E5E4" />
      <circle cx="65" cy="55" r="8" fill="#8B5CF6" />
      <text x="82" y="60" fontSize="14" fontWeight="600" fill="#171614">Strategic Alignment Assessment</text>

      {/* Briefcase icon */}
      <rect x="60" y="100" width="60" height="60" rx="12" fill="#8B5CF6" fillOpacity="0.1" />
      <rect x="75" y="115" width="30" height="25" rx="4" stroke="#8B5CF6" strokeWidth="2.5" fill="none" />
      <rect x="85" y="108" width="10" height="10" rx="2" stroke="#8B5CF6" strokeWidth="2" fill="none" />

      {/* Firm info */}
      <text x="140" y="125" fontSize="16" fontWeight="600" fill="#171614">Morrison & Associates</text>
      <text x="140" y="145" fontSize="12" fill="#71706B">Partner Alignment • 45 Professionals</text>

      {/* Alignment score */}
      <rect x="60" y="175" width="340" height="85" rx="12" fill="#8B5CF6" fillOpacity="0.05" />
      <text x="80" y="200" fontSize="11" fontWeight="600" fill="#71706B">PARTNER STRATEGIC ALIGNMENT</text>

      {/* Alignment visualization */}
      <g transform="translate(80, 215)">
        {/* Partner dots - aligned */}
        <circle cx="20" cy="20" r="12" fill="#8B5CF6" fillOpacity="0.8">
          <animate attributeName="cx" values="20;25;20" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="25" r="10" fill="#8B5CF6" fillOpacity="0.6">
          <animate attributeName="cx" values="50;45;50" dur="4s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="75" cy="15" r="11" fill="#8B5CF6" fillOpacity="0.7">
          <animate attributeName="cx" values="75;80;75" dur="4s" repeatCount="indefinite" begin="1s" />
        </circle>
        <circle cx="100" cy="28" r="9" fill="#8B5CF6" fillOpacity="0.5">
          <animate attributeName="cx" values="100;95;100" dur="4s" repeatCount="indefinite" begin="1.5s" />
        </circle>

        {/* Score */}
        <text x="180" y="15" fontSize="32" fontWeight="700" fill="#8B5CF6">78%</text>
        <text x="180" y="35" fontSize="10" fill="#71706B">Alignment Score</text>
        <text x="260" y="25" fontSize="12" fill="#22C55E">+12% vs last year</text>
      </g>

      {/* Strategic priorities */}
      <text x="60" y="285" fontSize="11" fontWeight="600" fill="#71706B">PARTNER PRIORITY CONSENSUS</text>

      <g transform="translate(60, 300)">
        {/* Priority 1 */}
        <rect x="0" y="0" width="340" height="32" rx="6" fill="#FFFEFB" stroke="#E7E5E4" strokeWidth="1" />
        <rect x="0" y="0" width="306" height="32" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
        <text x="12" y="20" fontSize="11" fill="#171614">Digital service delivery expansion</text>
        <text x="310" y="20" fontSize="11" fontWeight="600" fill="#8B5CF6">90%</text>

        {/* Priority 2 */}
        <rect x="0" y="40" width="340" height="32" rx="6" fill="#FFFEFB" stroke="#E7E5E4" strokeWidth="1" />
        <rect x="0" y="40" width="272" height="32" rx="6" fill="#A855F7" fillOpacity="0.1" />
        <text x="12" y="60" fontSize="11" fill="#171614">Mid-market client acquisition</text>
        <text x="310" y="60" fontSize="11" fontWeight="600" fill="#A855F7">80%</text>

        {/* Priority 3 */}
        <rect x="0" y="80" width="340" height="32" rx="6" fill="#FFFEFB" stroke="#E7E5E4" strokeWidth="1" />
        <rect x="0" y="80" width="221" height="32" rx="6" fill="#C084FC" fillOpacity="0.1" />
        <text x="12" y="100" fontSize="11" fill="#171614">Talent development programs</text>
        <text x="310" y="100" fontSize="11" fontWeight="600" fill="#C084FC">65%</text>
      </g>

      {/* Divergence alert */}
      <rect x="60" y="425" width="340" height="40" rx="8" fill="#F59E0B" fillOpacity="0.1" stroke="#F59E0B" strokeOpacity="0.5" />
      <circle cx="85" cy="445" r="12" fill="#F59E0B" />
      <text x="83" y="449" fontSize="12" fill="white" textAnchor="middle">!</text>
      <text x="105" y="440" fontSize="11" fontWeight="500" fill="#171614">Strategic Divergence Detected</text>
      <text x="105" y="455" fontSize="10" fill="#71706B">Partners split 55/45 on M&A strategy</text>

      {/* RIGHT PANEL - Practice Analysis */}
      <rect x="480" y="30" width="380" height="50" rx="16" fill="#171614" />
      <text x="510" y="60" fontSize="14" fontWeight="600" fill="#FFFEFB">Practice Area Intelligence</text>
      <circle cx="830" cy="55" r="6" fill="#22C55E">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Practice performance */}
      <g transform="translate(510, 95)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#71706B">PRACTICE AREA HEALTH</text>

        {/* Advisory */}
        <rect x="0" y="20" width="150" height="70" rx="8" fill="#22C55E" fillOpacity="0.1" stroke="#22C55E" strokeWidth="1" />
        <text x="12" y="45" fontSize="11" fontWeight="600" fill="#171614">Advisory</text>
        <text x="12" y="62" fontSize="20" fontWeight="700" fill="#22C55E">$4.2M</text>
        <text x="12" y="78" fontSize="9" fill="#71706B">Pipeline +28%</text>

        {/* Tax */}
        <rect x="160" y="20" width="150" height="70" rx="8" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="1" />
        <text x="172" y="45" fontSize="11" fontWeight="600" fill="#171614">Tax</text>
        <text x="172" y="62" fontSize="20" fontWeight="700" fill="#8B5CF6">$2.8M</text>
        <text x="172" y="78" fontSize="9" fill="#71706B">Pipeline +12%</text>
      </g>

      {/* Client insights */}
      <text x="510" y="200" fontSize="11" fontWeight="600" fill="#71706B">CLIENT RELATIONSHIP INSIGHTS</text>

      <g transform="translate(510, 215)">
        {/* At-risk client */}
        <rect x="0" y="0" width="320" height="45" rx="6" fill="#EF4444" fillOpacity="0.05" stroke="#EF4444" strokeWidth="1" />
        <circle cx="20" cy="22" r="12" fill="#EF4444" />
        <text x="18" y="26" fontSize="10" fill="white" textAnchor="middle">!</text>
        <text x="42" y="18" fontSize="10" fontWeight="600" fill="#171614">TechCorp Industries - At Risk</text>
        <text x="42" y="33" fontSize="9" fill="#71706B">Multiple partners flagged service concerns</text>

        {/* Expansion opportunity */}
        <rect x="0" y="55" width="320" height="45" rx="6" fill="#22C55E" fillOpacity="0.05" stroke="#22C55E" strokeWidth="1" />
        <circle cx="20" cy="77" r="12" fill="#22C55E" />
        <text x="20" y="81" fontSize="10" fill="white" textAnchor="middle">+</text>
        <text x="42" y="73" fontSize="10" fontWeight="600" fill="#171614">Global Retail Co - Expansion</text>
        <text x="42" y="88" fontSize="9" fill="#71706B">Advisory team identified M&A needs</text>
      </g>

      {/* Knowledge gaps */}
      <text x="510" y="330" fontSize="11" fontWeight="600" fill="#171614">Knowledge Capture Opportunities</text>

      <g transform="translate(510, 345)">
        <rect x="0" y="0" width="320" height="50" rx="8" fill="#FAF8F3" />
        <text x="12" y="22" fontSize="10" fill="#171614">Retiring partners hold critical client knowledge</text>

        <g transform="translate(12, 32)">
          <circle cx="8" cy="8" r="8" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1" />
          <text x="8" y="12" fontSize="8" fill="#8B5CF6" textAnchor="middle">JM</text>

          <circle cx="28" cy="8" r="8" fill="#A855F7" fillOpacity="0.2" stroke="#A855F7" strokeWidth="1" />
          <text x="28" y="12" fontSize="8" fill="#A855F7" textAnchor="middle">RS</text>

          <circle cx="48" cy="8" r="8" fill="#C084FC" fillOpacity="0.2" stroke="#C084FC" strokeWidth="1" />
          <text x="48" y="12" fontSize="8" fill="#C084FC" textAnchor="middle">KL</text>

          <text x="65" y="12" fontSize="9" fill="#71706B">3 partners retiring in 18 months</text>
        </g>
      </g>

      {/* Action summary */}
      <rect x="510" y="410" width="320" height="50" rx="8" fill="url(#ps-gradient)" fillOpacity="0.1" />
      <text x="530" y="432" fontSize="11" fontWeight="600" fill="#171614">Priority Actions Generated</text>
      <text x="530" y="448" fontSize="10" fill="#71706B">8 strategic recommendations • 3 urgent client actions</text>
    </svg>
  )
}

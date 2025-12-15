// Manufacturing Industry Hero Mockup - Shows factory floor transformation insights
export default function IndustryHeroManufacturing() {
  return (
    <svg
      viewBox="0 0 900 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <defs>
        {/* Industry gradient - industrial orange */}
        <linearGradient id="mfg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F25C05" />
          <stop offset="100%" stopColor="#1D9BA3" />
        </linearGradient>
        <linearGradient id="mfg-accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F25C05" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F25C05" stopOpacity="0" />
        </linearGradient>
        {/* Glow effects */}
        <filter id="mfg-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background panels */}
      <rect x="40" y="30" width="380" height="440" rx="16" fill="#FFFEFB" filter="drop-shadow(0 4px 20px rgba(0,0,0,0.08))" />
      <rect x="480" y="30" width="380" height="440" rx="16" fill="#FFFEFB" filter="drop-shadow(0 4px 20px rgba(0,0,0,0.08))" />

      {/* LEFT PANEL - Assessment Dashboard */}
      <rect x="40" y="30" width="380" height="50" rx="16" fill="#FAF8F3" />
      <rect x="40" y="64" width="380" height="1" fill="#E7E5E4" />
      <circle cx="65" cy="55" r="8" fill="#F25C05" />
      <text x="82" y="60" fontSize="14" fontWeight="600" fill="#171614">Digital Maturity Assessment</text>

      {/* Factory icon */}
      <rect x="60" y="100" width="60" height="60" rx="12" fill="#F25C05" fillOpacity="0.1" />
      <path d="M75 140 L75 120 L90 110 L90 140 L105 140 L105 115 L120 105 L120 140" stroke="#F25C05" strokeWidth="2.5" fill="none" strokeLinejoin="round" />

      {/* Assessment title */}
      <text x="140" y="125" fontSize="16" fontWeight="600" fill="#171614">Acme Manufacturing</text>
      <text x="140" y="145" fontSize="12" fill="#71706B">Industry 4.0 Readiness • 12 Stakeholders</text>

      {/* Progress ring */}
      <circle cx="90" cy="220" r="45" stroke="#E7E5E4" strokeWidth="8" fill="none" />
      <circle cx="90" cy="220" r="45" stroke="url(#mfg-gradient)" strokeWidth="8" fill="none" strokeDasharray="212" strokeDashoffset="53" strokeLinecap="round" transform="rotate(-90 90 220)">
        <animate attributeName="stroke-dashoffset" from="212" to="53" dur="1.5s" fill="freeze" />
      </circle>
      <text x="90" y="215" fontSize="24" fontWeight="700" fill="#171614" textAnchor="middle">75%</text>
      <text x="90" y="235" fontSize="10" fill="#71706B" textAnchor="middle">Overall Score</text>

      {/* Dimension scores */}
      <g transform="translate(160, 180)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#71706B">DIMENSIONS</text>

        {/* Technology */}
        <rect x="0" y="15" width="220" height="24" rx="4" fill="#FAF8F3" />
        <rect x="0" y="15" width="176" height="24" rx="4" fill="#F25C05" fillOpacity="0.15" />
        <text x="8" y="31" fontSize="11" fill="#171614">Technology</text>
        <text x="200" y="31" fontSize="11" fontWeight="600" fill="#F25C05">80%</text>

        {/* Process */}
        <rect x="0" y="45" width="220" height="24" rx="4" fill="#FAF8F3" />
        <rect x="0" y="45" width="154" height="24" rx="4" fill="#1D9BA3" fillOpacity="0.15" />
        <text x="8" y="61" fontSize="11" fill="#171614">Process</text>
        <text x="200" y="61" fontSize="11" fontWeight="600" fill="#1D9BA3">70%</text>

        {/* People */}
        <rect x="0" y="75" width="220" height="24" rx="4" fill="#FAF8F3" />
        <rect x="0" y="75" width="165" height="24" rx="4" fill="#8B5CF6" fillOpacity="0.15" />
        <text x="8" y="91" fontSize="11" fill="#171614">People</text>
        <text x="200" y="91" fontSize="11" fontWeight="600" fill="#8B5CF6">75%</text>
      </g>

      {/* Key insight callout */}
      <rect x="60" y="320" width="340" height="70" rx="8" fill="#F25C05" fillOpacity="0.05" stroke="#F25C05" strokeOpacity="0.3" />
      <circle cx="85" cy="355" r="12" fill="#F25C05" />
      <path d="M80 355 L85 360 L92 350" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="105" y="345" fontSize="12" fontWeight="600" fill="#171614">Key Insight Detected</text>
      <text x="105" y="365" fontSize="11" fill="#71706B">Quality control automation is your highest-impact</text>
      <text x="105" y="380" fontSize="11" fill="#71706B">opportunity with 3.2x ROI potential</text>

      {/* Timeline indicator */}
      <rect x="60" y="410" width="340" height="40" rx="8" fill="#FAF8F3" />
      <text x="80" y="435" fontSize="11" fill="#71706B">Assessment completed in</text>
      <text x="220" y="435" fontSize="14" fontWeight="700" fill="#F25C05">3 days</text>
      <text x="262" y="435" fontSize="11" fill="#71706B">vs 3 weeks traditional</text>

      {/* RIGHT PANEL - Interview Synthesis */}
      <rect x="480" y="30" width="380" height="50" rx="16" fill="#171614" />
      <text x="510" y="60" fontSize="14" fontWeight="600" fill="#FFFEFB">AI Synthesis Engine</text>
      <circle cx="830" cy="55" r="6" fill="#22C55E">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Processing visualization */}
      <g transform="translate(510, 100)">
        {/* Stakeholder bubbles flowing in */}
        <circle cx="30" cy="30" r="20" fill="#F25C05" fillOpacity="0.2" stroke="#F25C05" strokeWidth="1.5">
          <animate attributeName="r" values="18;22;18" dur="3s" repeatCount="indefinite" />
        </circle>
        <text x="30" y="34" fontSize="9" fill="#F25C05" textAnchor="middle">OPS</text>

        <circle cx="80" cy="50" r="20" fill="#1D9BA3" fillOpacity="0.2" stroke="#1D9BA3" strokeWidth="1.5">
          <animate attributeName="r" values="18;22;18" dur="3s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        <text x="80" y="54" fontSize="9" fill="#1D9BA3" textAnchor="middle">IT</text>

        <circle cx="130" cy="30" r="20" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="1.5">
          <animate attributeName="r" values="18;22;18" dur="3s" begin="1s" repeatCount="indefinite" />
        </circle>
        <text x="130" y="34" fontSize="9" fill="#8B5CF6" textAnchor="middle">QA</text>

        <circle cx="175" cy="55" r="20" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1.5">
          <animate attributeName="r" values="18;22;18" dur="3s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <text x="175" y="59" fontSize="9" fill="#F59E0B" textAnchor="middle">MGMT</text>

        {/* Arrow flow */}
        <path d="M210 40 L250 40" stroke="#E7E5E4" strokeWidth="2" strokeDasharray="4 2" />
        <polygon points="250,35 260,40 250,45" fill="#E7E5E4" />
      </g>

      {/* AI processing box */}
      <rect x="780" y="110" width="60" height="60" rx="8" fill="url(#mfg-gradient)" filter="url(#mfg-glow)" />
      <path d="M800 130 L810 140 L820 130 M800 150 L810 140 L820 150" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* Cross-reference analysis */}
      <rect x="510" y="190" width="320" height="100" rx="8" fill="#FAF8F3" />
      <text x="530" y="215" fontSize="11" fontWeight="600" fill="#171614">Cross-Stakeholder Analysis</text>

      {/* Contradiction highlight */}
      <rect x="525" y="230" width="290" height="45" rx="6" fill="#FFFEFB" stroke="#F25C05" strokeWidth="1" />
      <circle cx="545" cy="252" r="10" fill="#F25C05" fillOpacity="0.1" />
      <text x="545" y="256" fontSize="12" fill="#F25C05" textAnchor="middle">!</text>
      <text x="565" y="248" fontSize="10" fontWeight="500" fill="#171614">Contradiction Detected</text>
      <text x="565" y="262" fontSize="9" fill="#71706B">OPS reports 30% automation vs IT reports 45%</text>

      {/* Generated insights */}
      <text x="510" y="320" fontSize="11" fontWeight="600" fill="#171614">Strategic Recommendations</text>

      <g transform="translate(510, 335)">
        <rect x="0" y="0" width="320" height="32" rx="6" fill="#22C55E" fillOpacity="0.1" />
        <circle cx="16" cy="16" r="6" fill="#22C55E" />
        <text x="30" y="20" fontSize="10" fill="#171614">Prioritize QC automation - 18 month ROI</text>
      </g>

      <g transform="translate(510, 375)">
        <rect x="0" y="0" width="320" height="32" rx="6" fill="#1D9BA3" fillOpacity="0.1" />
        <circle cx="16" cy="16" r="6" fill="#1D9BA3" />
        <text x="30" y="20" fontSize="10" fill="#171614">Bridge OT/IT gap with unified data platform</text>
      </g>

      <g transform="translate(510, 415)">
        <rect x="0" y="0" width="320" height="32" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
        <circle cx="16" cy="16" r="6" fill="#8B5CF6" />
        <text x="30" y="20" fontSize="10" fill="#171614">Upskill 40% of workforce for digital tools</text>
      </g>
    </svg>
  )
}

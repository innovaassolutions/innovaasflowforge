// Pharma/Life Sciences Industry Hero Mockup - Shows compliance and quality insights
export default function IndustryHeroPharma() {
  return (
    <svg
      viewBox="0 0 900 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <defs>
        {/* Industry gradient - medical teal */}
        <linearGradient id="pharma-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
        <filter id="pharma-glow" x="-50%" y="-50%" width="200%" height="200%">
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

      {/* LEFT PANEL - Compliance Dashboard */}
      <rect x="40" y="30" width="380" height="50" rx="16" fill="#F5F5F4" />
      <rect x="40" y="64" width="380" height="1" fill="#E7E5E4" />
      <circle cx="65" cy="55" r="8" fill="#14B8A6" />
      <text x="82" y="60" fontSize="14" fontWeight="600" fill="#171614">Compliance Readiness Assessment</text>

      {/* Pharma icon */}
      <rect x="60" y="100" width="60" height="60" rx="12" fill="#14B8A6" fillOpacity="0.1" />
      <path d="M75 140 L75 115 Q90 105 105 115 L105 140 M75 125 L105 125" stroke="#14B8A6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="90" cy="118" r="4" fill="#14B8A6" />

      {/* Company info */}
      <text x="140" y="125" fontSize="16" fontWeight="600" fill="#171614">BioPharm Sciences Inc.</text>
      <text x="140" y="145" fontSize="12" fill="#78716C">FDA 21 CFR Part 11 • 28 Stakeholders</text>

      {/* Compliance gauge */}
      <rect x="60" y="180" width="340" height="90" rx="12" fill="#F5F5F4" />
      <text x="80" y="205" fontSize="11" fontWeight="600" fill="#78716C">GxP COMPLIANCE SCORE</text>

      {/* Compliance bar */}
      <rect x="80" y="220" width="300" height="12" rx="6" fill="#E7E5E4" />
      <rect x="80" y="220" width="255" height="12" rx="6" fill="url(#pharma-gradient)">
        <animate attributeName="width" from="0" to="255" dur="1.2s" fill="freeze" />
      </rect>
      <text x="340" y="255" fontSize="20" fontWeight="700" fill="#14B8A6" textAnchor="end">85%</text>
      <text x="80" y="255" fontSize="10" fill="#78716C">15% gaps identified across 6 departments</text>

      {/* Compliance checklist */}
      <g transform="translate(60, 290)">
        <text x="0" y="0" fontSize="11" fontWeight="600" fill="#78716C">COMPLIANCE AREAS</text>

        {/* Data Integrity */}
        <rect x="0" y="15" width="160" height="36" rx="6" fill="#22C55E" fillOpacity="0.1" />
        <circle cx="20" cy="33" r="10" fill="#22C55E" />
        <path d="M15 33 L18 36 L25 29" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="38" y="30" fontSize="10" fontWeight="500" fill="#171614">Data Integrity</text>
        <text x="38" y="42" fontSize="9" fill="#78716C">ALCOA+ compliant</text>

        {/* Document Control */}
        <rect x="170" y="15" width="160" height="36" rx="6" fill="#22C55E" fillOpacity="0.1" />
        <circle cx="190" cy="33" r="10" fill="#22C55E" />
        <path d="M185 33 L188 36 L195 29" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <text x="208" y="30" fontSize="10" fontWeight="500" fill="#171614">Document Control</text>
        <text x="208" y="42" fontSize="9" fill="#78716C">Version controlled</text>

        {/* Audit Trail */}
        <rect x="0" y="60" width="160" height="36" rx="6" fill="#F59E0B" fillOpacity="0.1" />
        <circle cx="20" cy="78" r="10" fill="#F59E0B" />
        <text x="18" y="82" fontSize="10" fill="white" textAnchor="middle">!</text>
        <text x="38" y="75" fontSize="10" fontWeight="500" fill="#171614">Audit Trail</text>
        <text x="38" y="87" fontSize="9" fill="#78716C">3 gaps found</text>

        {/* Training Records */}
        <rect x="170" y="60" width="160" height="36" rx="6" fill="#EF4444" fillOpacity="0.1" />
        <circle cx="190" cy="78" r="10" fill="#EF4444" />
        <text x="188" y="82" fontSize="10" fill="white" textAnchor="middle">5</text>
        <text x="208" y="75" fontSize="10" fontWeight="500" fill="#171614">Training Records</text>
        <text x="208" y="87" fontSize="9" fill="#78716C">Critical findings</text>
      </g>

      {/* Audit readiness */}
      <rect x="60" y="410" width="340" height="45" rx="8" fill="#14B8A6" fillOpacity="0.05" stroke="#14B8A6" strokeOpacity="0.3" />
      <text x="80" y="438" fontSize="11" fill="#171614">Next FDA Audit in 90 days •</text>
      <text x="220" y="438" fontSize="11" fontWeight="600" fill="#14B8A6">Remediation plan generated</text>

      {/* RIGHT PANEL - Department Analysis */}
      <rect x="480" y="30" width="380" height="50" rx="16" fill="#171614" />
      <text x="510" y="60" fontSize="14" fontWeight="600" fill="#FFFEFB">Cross-Department Analysis</text>
      <circle cx="830" cy="55" r="6" fill="#22C55E">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Department bubbles */}
      <g transform="translate(510, 100)">
        <circle cx="50" cy="35" r="28" fill="#14B8A6" fillOpacity="0.15" stroke="#14B8A6" strokeWidth="1.5" />
        <text x="50" y="32" fontSize="9" fill="#14B8A6" textAnchor="middle" fontWeight="600">QA</text>
        <text x="50" y="44" fontSize="8" fill="#78716C" textAnchor="middle">8 interviews</text>

        <circle cx="120" cy="50" r="24" fill="#0EA5E9" fillOpacity="0.15" stroke="#0EA5E9" strokeWidth="1.5" />
        <text x="120" y="47" fontSize="9" fill="#0EA5E9" textAnchor="middle" fontWeight="600">R&D</text>
        <text x="120" y="57" fontSize="8" fill="#78716C" textAnchor="middle">6 interviews</text>

        <circle cx="185" cy="35" r="26" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
        <text x="185" y="32" fontSize="9" fill="#8B5CF6" textAnchor="middle" fontWeight="600">MFG</text>
        <text x="185" y="44" fontSize="8" fill="#78716C" textAnchor="middle">10 interviews</text>

        <circle cx="255" cy="50" r="22" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="255" y="47" fontSize="9" fill="#F59E0B" textAnchor="middle" fontWeight="600">REG</text>
        <text x="255" y="57" fontSize="8" fill="#78716C" textAnchor="middle">4 interviews</text>
      </g>

      {/* Regulatory findings */}
      <rect x="510" y="185" width="320" height="120" rx="8" fill="#F5F5F4" />
      <text x="530" y="210" fontSize="11" fontWeight="600" fill="#171614">Critical Regulatory Findings</text>

      {/* Finding 1 */}
      <rect x="525" y="225" width="290" height="32" rx="6" fill="#FFFEFB" stroke="#EF4444" strokeWidth="1" />
      <circle cx="545" cy="241" r="10" fill="#EF4444" />
      <text x="545" y="245" fontSize="10" fill="white" textAnchor="middle">1</text>
      <text x="565" y="238" fontSize="10" fontWeight="500" fill="#171614">Training gaps in 21 CFR Part 11</text>
      <text x="565" y="250" fontSize="9" fill="#78716C">QA department - immediate remediation</text>

      {/* Finding 2 */}
      <rect x="525" y="263" width="290" height="32" rx="6" fill="#FFFEFB" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="545" cy="279" r="10" fill="#F59E0B" />
      <text x="545" y="283" fontSize="10" fill="white" textAnchor="middle">2</text>
      <text x="565" y="276" fontSize="10" fontWeight="500" fill="#171614">Electronic signature policy incomplete</text>
      <text x="565" y="288" fontSize="9" fill="#78716C">Lab systems - 30 day remediation</text>

      {/* Remediation timeline */}
      <text x="510" y="330" fontSize="11" fontWeight="600" fill="#171614">Remediation Timeline</text>

      <g transform="translate(510, 345)">
        {/* Timeline bar */}
        <rect x="0" y="20" width="320" height="4" rx="2" fill="#E7E5E4" />
        <rect x="0" y="20" width="200" height="4" rx="2" fill="url(#pharma-gradient)" />

        {/* Milestones */}
        <circle cx="0" cy="22" r="8" fill="#14B8A6" />
        <text x="0" y="50" fontSize="9" fill="#171614" textAnchor="middle">Week 1</text>
        <text x="0" y="60" fontSize="8" fill="#78716C" textAnchor="middle">Training</text>

        <circle cx="100" cy="22" r="8" fill="#14B8A6" />
        <text x="100" y="50" fontSize="9" fill="#171614" textAnchor="middle">Week 4</text>
        <text x="100" y="60" fontSize="8" fill="#78716C" textAnchor="middle">Audit Trail</text>

        <circle cx="200" cy="22" r="8" fill="#14B8A6" fillOpacity="0.3" stroke="#14B8A6" strokeWidth="2" />
        <text x="200" y="50" fontSize="9" fill="#171614" textAnchor="middle">Week 8</text>
        <text x="200" y="60" fontSize="8" fill="#78716C" textAnchor="middle">Validation</text>

        <circle cx="320" cy="22" r="8" fill="#E7E5E4" />
        <text x="320" y="50" fontSize="9" fill="#171614" textAnchor="middle">Week 12</text>
        <text x="320" y="60" fontSize="8" fill="#78716C" textAnchor="middle">Audit Ready</text>
      </g>

      {/* Documentation badge */}
      <rect x="510" y="420" width="320" height="40" rx="8" fill="#14B8A6" fillOpacity="0.1" />
      <text x="530" y="445" fontSize="11" fill="#171614">Complete audit trail •</text>
      <text x="648" y="445" fontSize="11" fontWeight="600" fill="#14B8A6">21 CFR Part 11 Compliant</text>
    </svg>
  )
}

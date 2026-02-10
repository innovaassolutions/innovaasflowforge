export default function DashboardLeadershipContinuity() {
  return (
    <svg
      viewBox="0 0 800 780"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
    >
      {/* Browser Window Frame */}
      <rect width="800" height="780" rx="12" fill="#FFFEFB" />

      {/* Browser Chrome */}
      <rect width="800" height="40" rx="12" fill="#FAF8F3" />
      <circle cx="20" cy="20" r="6" fill="#ef4444" />
      <circle cx="40" cy="20" r="6" fill="#F25C05" />
      <circle cx="60" cy="20" r="6" fill="#22c55e" />

      {/* URL Bar */}
      <rect x="90" y="10" width="600" height="20" rx="4" fill="#FFFFFF" />
      <text x="100" y="25" fontSize="12" fill="#71706B" fontFamily="monospace">
        flowforge.innovaas.co/school-health
      </text>

      {/* Sidebar */}
      <rect y="40" width="180" height="740" fill="#FAF8F3" />
      <text x="24" y="76" fontSize="15" fontWeight="bold" fill="#F25C05">
        FlowForge
      </text>

      <rect x="14" y="104" width="152" height="32" rx="6" fill="#FFFFFF" />
      <rect x="14" y="104" width="152" height="32" rx="6" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="28" y="125" fontSize="12" fill="#171614" fontWeight="500">Health Overview</text>

      <text x="28" y="160" fontSize="12" fill="#71706B">Campaigns</text>
      <text x="28" y="188" fontSize="12" fill="#71706B">Reports</text>
      <text x="28" y="216" fontSize="12" fill="#71706B">Settings</text>

      {/* Main Content */}
      <rect x="180" y="40" width="620" height="740" fill="#FFFEFB" />

      {/* Header */}
      <text x="204" y="78" fontSize="20" fontWeight="bold" fill="#171614">
        School Health Overview
      </text>
      <text x="204" y="96" fontSize="12" fill="#71706B">
        Term 3, 2026 · Greenfield International School
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 1: Percentage Gauge Tiles — 2x2 Grid */}
      {/* ──────────────────────────────────────────── */}

      {/* Gauge tile 1: Parent Confidence — 84% Healthy */}
      <rect x="204" y="108" width="282" height="115" rx="8" fill="#FFFFFF" />
      <rect x="204" y="108" width="282" height="115" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="345" y="130" fontSize="13" fill="#71706B" textAnchor="middle">Parent Confidence</text>
      <circle cx="345" cy="170" r="32" fill="none" stroke="#F2EFE7" strokeWidth="8" />
      <circle cx="345" cy="170" r="32" fill="none" stroke="#22c55e" strokeWidth="8"
        strokeDasharray="168.89 201.06" strokeLinecap="round"
        transform="rotate(-90, 345, 170)" />
      <text x="345" y="177" fontSize="18" fontWeight="bold" fill="#22c55e" textAnchor="middle">84%</text>
      <text x="345" y="210" fontSize="11" fontWeight="bold" fill="#22c55e" textAnchor="middle">Healthy</text>

      {/* Gauge tile 2: Staff Load — 56% Monitor */}
      <rect x="498" y="108" width="282" height="115" rx="8" fill="#FFFFFF" />
      <rect x="498" y="108" width="282" height="115" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="639" y="130" fontSize="13" fill="#71706B" textAnchor="middle">Staff Load</text>
      <circle cx="639" cy="170" r="32" fill="none" stroke="#F2EFE7" strokeWidth="8" />
      <circle cx="639" cy="170" r="32" fill="none" stroke="#eab308" strokeWidth="8"
        strokeDasharray="112.59 201.06" strokeLinecap="round"
        transform="rotate(-90, 639, 170)" />
      <text x="639" y="177" fontSize="18" fontWeight="bold" fill="#eab308" textAnchor="middle">56%</text>
      <text x="639" y="210" fontSize="11" fontWeight="bold" fill="#eab308" textAnchor="middle">Monitor</text>

      {/* Gauge tile 3: Student Climate — 34% At Risk */}
      <rect x="204" y="235" width="282" height="115" rx="8" fill="#FFFFFF" />
      <rect x="204" y="235" width="282" height="115" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="345" y="257" fontSize="13" fill="#71706B" textAnchor="middle">Student Climate</text>
      <circle cx="345" cy="297" r="32" fill="none" stroke="#F2EFE7" strokeWidth="8" />
      <circle cx="345" cy="297" r="32" fill="none" stroke="#ef4444" strokeWidth="8"
        strokeDasharray="68.36 201.06" strokeLinecap="round"
        transform="rotate(-90, 345, 297)" />
      <text x="345" y="304" fontSize="18" fontWeight="bold" fill="#ef4444" textAnchor="middle">34%</text>
      <text x="345" y="337" fontSize="11" fontWeight="bold" fill="#ef4444" textAnchor="middle">At Risk</text>

      {/* Gauge tile 4: Leadership Alignment — 72% Healthy */}
      <rect x="498" y="235" width="282" height="115" rx="8" fill="#FFFFFF" />
      <rect x="498" y="235" width="282" height="115" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="639" y="257" fontSize="13" fill="#71706B" textAnchor="middle">Leadership Alignment</text>
      <circle cx="639" cy="297" r="32" fill="none" stroke="#F2EFE7" strokeWidth="8" />
      <circle cx="639" cy="297" r="32" fill="none" stroke="#22c55e" strokeWidth="8"
        strokeDasharray="144.76 201.06" strokeLinecap="round"
        transform="rotate(-90, 639, 297)" />
      <text x="639" y="304" fontSize="18" fontWeight="bold" fill="#22c55e" textAnchor="middle">72%</text>
      <text x="639" y="337" fontSize="11" fontWeight="bold" fill="#22c55e" textAnchor="middle">Healthy</text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 2: Cross-Stakeholder Pressure Map — Middle Left */}
      {/* ──────────────────────────────────────────── */}
      <rect x="204" y="364" width="280" height="196" rx="8" fill="#FFFFFF" />
      <rect x="204" y="364" width="280" height="196" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="384" fontSize="13" fontWeight="bold" fill="#171614">Pressure Convergence</text>
      <text x="220" y="398" fontSize="10" fill="#71706B">Theme: Communication Load</text>

      {/* Parents row */}
      <rect x="220" y="410" width="248" height="32" rx="4" fill="#FAF8F3" />
      <circle cx="234" cy="426" r="4" fill="#F25C05" />
      <text x="244" y="422" fontSize="10" fontWeight="500" fill="#171614">Parents</text>
      <text x="244" y="434" fontSize="9" fill="#71706B" fontStyle="italic">&quot;Too many emails, unclear expectations&quot;</text>

      {/* Students row */}
      <rect x="220" y="448" width="248" height="32" rx="4" fill="transparent" />
      <circle cx="234" cy="464" r="4" fill="#eab308" />
      <text x="244" y="460" fontSize="10" fontWeight="500" fill="#171614">Students</text>
      <text x="244" y="472" fontSize="9" fill="#71706B" fontStyle="italic">&quot;Rules feel tighter, less room to express&quot;</text>

      {/* Staff row */}
      <rect x="220" y="486" width="248" height="32" rx="4" fill="transparent" />
      <circle cx="234" cy="502" r="4" fill="#1D9BA3" />
      <text x="244" y="498" fontSize="10" fontWeight="500" fill="#171614">Staff</text>
      <text x="244" y="510" fontSize="9" fill="#71706B" fontStyle="italic">&quot;Rising parent queries, more clarification&quot;</text>

      {/* Diagnosis callout */}
      <rect x="220" y="526" width="248" height="26" rx="4" fill="#F0FDFA" stroke="#1D9BA3" strokeWidth="1" />
      <text x="230" y="543" fontSize="9" fill="#1D9BA3" fontWeight="500">
        Expectation-setting drifting out of alignment
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 3: Trend Direction — Middle Right */}
      {/* ──────────────────────────────────────────── */}
      <rect x="496" y="364" width="293" height="196" rx="8" fill="#FFFFFF" />
      <rect x="496" y="364" width="293" height="196" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="384" fontSize="13" fontWeight="bold" fill="#171614">Trend Direction</text>
      <text x="750" y="384" fontSize="9" fill="#71706B" textAnchor="end">Term 1 → Term 2 → Term 3</text>

      {/* Trend 1: Communication Clarity — declining */}
      <rect x="512" y="398" width="261" height="34" rx="4" fill="#FAF8F3" />
      <text x="524" y="414" fontSize="10" fill="#171614">Communication Clarity</text>
      <text x="524" y="426" fontSize="14" fill="#f97316">↓</text>
      <text x="538" y="426" fontSize="9" fill="#f97316">slight decline</text>
      <polyline points="700,422 720,418 740,424 760,428" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trend 2: Staff Cognitive Load — accumulating */}
      <rect x="512" y="438" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="454" fontSize="10" fill="#171614">Staff Cognitive Load</text>
      <text x="524" y="466" fontSize="14" fill="#eab308">↑</text>
      <text x="538" y="466" fontSize="9" fill="#eab308">accumulating</text>
      <polyline points="700,466 720,462 740,458 760,452" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trend 3: Student Autonomy — gradual decline */}
      <rect x="512" y="478" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="494" fontSize="10" fill="#171614">Student Autonomy</text>
      <text x="524" y="506" fontSize="14" fill="#f97316">↓</text>
      <text x="538" y="506" fontSize="9" fill="#f97316">gradual</text>
      <polyline points="700,502 720,500 740,504 760,508" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trend 4: Parent Confidence — stable */}
      <rect x="512" y="518" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="534" fontSize="10" fill="#171614">Parent Confidence</text>
      <text x="524" y="546" fontSize="14" fill="#22c55e">▬</text>
      <text x="538" y="546" fontSize="9" fill="#22c55e">stable</text>
      <polyline points="700,542 720,541 740,542 760,541" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 4: Leadership Action Layer — Bottom Left */}
      {/* ──────────────────────────────────────────── */}
      <rect x="204" y="572" width="280" height="194" rx="8" fill="#FFFFFF" />
      <rect x="204" y="572" width="280" height="194" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="592" fontSize="13" fontWeight="bold" fill="#171614">Areas to Watch</text>
      <text x="220" y="606" fontSize="9" fill="#71706B">Questions leadership may want to hold</text>

      {/* Action item 1 */}
      <rect x="220" y="618" width="248" height="40" rx="4" fill="#FAF8F3" />
      <rect x="228" y="626" width="3" height="24" rx="1.5" fill="#F25C05" />
      <text x="240" y="636" fontSize="10" fill="#171614" fontWeight="500">
        Communication norms across divisions
      </text>
      <text x="240" y="648" fontSize="9" fill="#71706B">
        Clarify before end-of-term to prevent compounding
      </text>

      {/* Action item 2 */}
      <rect x="220" y="666" width="248" height="40" rx="4" fill="transparent" />
      <rect x="228" y="674" width="3" height="24" rx="1.5" fill="#eab308" />
      <text x="240" y="684" fontSize="10" fill="#171614" fontWeight="500">
        Staff load accumulation pattern
      </text>
      <text x="240" y="696" fontSize="9" fill="#71706B">
        Where might continuity mechanisms need reinforcement?
      </text>

      {/* Action item 3 */}
      <rect x="220" y="714" width="248" height="40" rx="4" fill="transparent" />
      <rect x="228" y="722" width="3" height="24" rx="1.5" fill="#1D9BA3" />
      <text x="240" y="732" fontSize="10" fill="#171614" fontWeight="500">
        Student autonomy perception (upper years)
      </text>
      <text x="240" y="744" fontSize="9" fill="#71706B">
        Where might clarification reduce institutional load?
      </text>

      {/* Footer note */}
      <text x="220" y="762" fontSize="8" fill="#71706B" fontStyle="italic">
        Sense-holding, not directives — leadership authority preserved
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 5: Safeguarding Signal — Bottom Right */}
      {/* ──────────────────────────────────────────── */}
      <rect x="496" y="572" width="293" height="116" rx="8" fill="#FFFFFF" />
      <rect x="496" y="572" width="293" height="116" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="592" fontSize="13" fontWeight="bold" fill="#171614">Safeguarding Signal</text>

      {/* All Clear state */}
      <rect x="512" y="604" width="261" height="32" rx="6" fill="#F0FDF4" />
      {/* Pulsing green dot */}
      <circle cx="528" cy="620" r="6" fill="#22c55e" opacity="0.3">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="528" cy="620" r="4" fill="#22c55e" />
      <text x="542" y="624" fontSize="12" fontWeight="bold" fill="#22c55e">All Clear</text>
      <text x="604" y="624" fontSize="10" fill="#71706B">— no escalation signals</text>

      {/* Break-glass principle note */}
      <text x="512" y="654" fontSize="9" fill="#71706B">
        Signal escalation, not surveillance
      </text>
      <text x="512" y="668" fontSize="9" fill="#71706B">
        No individual tracking · No automatic identification
      </text>
      <text x="512" y="682" fontSize="9" fill="#71706B">
        Break-glass triggers held for leadership judgment
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* Bottom-right: Governance note */}
      {/* ──────────────────────────────────────────── */}
      <rect x="496" y="700" width="293" height="66" rx="8" fill="#FAF8F3" />
      <rect x="496" y="700" width="293" height="66" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="720" fontSize="10" fontWeight="bold" fill="#171614">Governance Note</text>
      <text x="512" y="734" fontSize="9" fill="#71706B">
        This view is institutional intelligence —
      </text>
      <text x="512" y="746" fontSize="9" fill="#71706B">
        not a performance scorecard or decision engine.
      </text>
      <text x="512" y="760" fontSize="9" fill="#1D9BA3" fontWeight="500">
        Governance-grade continuity assurance
      </text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="dashGradContinuity" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F25C05" />
          <stop offset="100%" stopColor="#1D9BA3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

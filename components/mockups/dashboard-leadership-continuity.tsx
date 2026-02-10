export default function DashboardLeadershipContinuity() {
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
        flowforge.innovaas.co/school-health
      </text>

      {/* Sidebar */}
      <rect y="40" width="180" height="560" fill="#FAF8F3" />
      <text x="24" y="76" fontSize="15" fontWeight="bold" fill="#F25C05">
        FlowForge
      </text>

      <text x="28" y="108" fontSize="12" fill="#71706B">Dashboard</text>

      <rect x="14" y="120" width="152" height="32" rx="6" fill="#FFFFFF" />
      <rect x="14" y="120" width="152" height="32" rx="6" fill="none" stroke="#F25C05" strokeWidth="1" />
      <text x="28" y="141" fontSize="12" fill="#171614" fontWeight="500">Health Overview</text>

      <text x="28" y="178" fontSize="12" fill="#71706B">Campaigns</text>
      <text x="28" y="206" fontSize="12" fill="#71706B">Reports</text>
      <text x="28" y="234" fontSize="12" fill="#71706B">Settings</text>

      {/* Main Content */}
      <rect x="180" y="40" width="620" height="560" fill="#FFFEFB" />

      {/* Header */}
      <text x="204" y="78" fontSize="20" fontWeight="bold" fill="#171614">
        School Health Overview
      </text>
      <text x="204" y="96" fontSize="12" fill="#71706B">
        Term 3, 2026 · Greenfield International School
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 1: Percentage Gauge Tiles — Top Strip */}
      {/* ──────────────────────────────────────────── */}

      {/* Gauge tile 1: Parent Confidence — 84% Healthy */}
      <rect x="204" y="108" width="140" height="68" rx="8" fill="#FFFFFF" />
      <rect x="204" y="108" width="140" height="68" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="274" y="123" fontSize="10" fill="#71706B" textAnchor="middle">Parent Confidence</text>
      <circle cx="274" cy="146" r="14" fill="none" stroke="#F2EFE7" strokeWidth="5" />
      <circle cx="274" cy="146" r="14" fill="none" stroke="#22c55e" strokeWidth="5"
        strokeDasharray="73.89 87.96" strokeLinecap="round"
        transform="rotate(-90, 274, 146)" />
      <text x="274" y="150" fontSize="10" fontWeight="bold" fill="#22c55e" textAnchor="middle">84%</text>
      <text x="274" y="170" fontSize="9" fontWeight="bold" fill="#22c55e" textAnchor="middle">Healthy</text>

      {/* Gauge tile 2: Staff Load — 56% Monitor */}
      <rect x="354" y="108" width="140" height="68" rx="8" fill="#FFFFFF" />
      <rect x="354" y="108" width="140" height="68" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="424" y="123" fontSize="10" fill="#71706B" textAnchor="middle">Staff Load</text>
      <circle cx="424" cy="146" r="14" fill="none" stroke="#F2EFE7" strokeWidth="5" />
      <circle cx="424" cy="146" r="14" fill="none" stroke="#eab308" strokeWidth="5"
        strokeDasharray="49.26 87.96" strokeLinecap="round"
        transform="rotate(-90, 424, 146)" />
      <text x="424" y="150" fontSize="10" fontWeight="bold" fill="#eab308" textAnchor="middle">56%</text>
      <text x="424" y="170" fontSize="9" fontWeight="bold" fill="#eab308" textAnchor="middle">Monitor</text>

      {/* Gauge tile 3: Student Climate — 34% At Risk */}
      <rect x="504" y="108" width="140" height="68" rx="8" fill="#FFFFFF" />
      <rect x="504" y="108" width="140" height="68" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="574" y="123" fontSize="10" fill="#71706B" textAnchor="middle">Student Climate</text>
      <circle cx="574" cy="146" r="14" fill="none" stroke="#F2EFE7" strokeWidth="5" />
      <circle cx="574" cy="146" r="14" fill="none" stroke="#ef4444" strokeWidth="5"
        strokeDasharray="29.91 87.96" strokeLinecap="round"
        transform="rotate(-90, 574, 146)" />
      <text x="574" y="150" fontSize="10" fontWeight="bold" fill="#ef4444" textAnchor="middle">34%</text>
      <text x="574" y="170" fontSize="9" fontWeight="bold" fill="#ef4444" textAnchor="middle">At Risk</text>

      {/* Gauge tile 4: Leadership Alignment — 72% Healthy */}
      <rect x="654" y="108" width="135" height="68" rx="8" fill="#FFFFFF" />
      <rect x="654" y="108" width="135" height="68" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="722" y="123" fontSize="10" fill="#71706B" textAnchor="middle">Leadership Alignment</text>
      <circle cx="722" cy="146" r="14" fill="none" stroke="#F2EFE7" strokeWidth="5" />
      <circle cx="722" cy="146" r="14" fill="none" stroke="#22c55e" strokeWidth="5"
        strokeDasharray="63.33 87.96" strokeLinecap="round"
        transform="rotate(-90, 722, 146)" />
      <text x="722" y="150" fontSize="10" fontWeight="bold" fill="#22c55e" textAnchor="middle">72%</text>
      <text x="722" y="170" fontSize="9" fontWeight="bold" fill="#22c55e" textAnchor="middle">Healthy</text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 2: Cross-Stakeholder Pressure Map — Middle Left */}
      {/* ──────────────────────────────────────────── */}
      <rect x="204" y="188" width="280" height="196" rx="8" fill="#FFFFFF" />
      <rect x="204" y="188" width="280" height="196" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="208" fontSize="13" fontWeight="bold" fill="#171614">Pressure Convergence</text>
      <text x="220" y="222" fontSize="10" fill="#71706B">Theme: Communication Load</text>

      {/* Parents row */}
      <rect x="220" y="234" width="248" height="32" rx="4" fill="#FAF8F3" />
      <circle cx="234" cy="250" r="4" fill="#F25C05" />
      <text x="244" y="246" fontSize="10" fontWeight="500" fill="#171614">Parents</text>
      <text x="244" y="258" fontSize="9" fill="#71706B" fontStyle="italic">&quot;Too many emails, unclear expectations&quot;</text>

      {/* Students row */}
      <rect x="220" y="272" width="248" height="32" rx="4" fill="transparent" />
      <circle cx="234" cy="288" r="4" fill="#eab308" />
      <text x="244" y="284" fontSize="10" fontWeight="500" fill="#171614">Students</text>
      <text x="244" y="296" fontSize="9" fill="#71706B" fontStyle="italic">&quot;Rules feel tighter, less room to express&quot;</text>

      {/* Staff row */}
      <rect x="220" y="310" width="248" height="32" rx="4" fill="transparent" />
      <circle cx="234" cy="326" r="4" fill="#1D9BA3" />
      <text x="244" y="322" fontSize="10" fontWeight="500" fill="#171614">Staff</text>
      <text x="244" y="334" fontSize="9" fill="#71706B" fontStyle="italic">&quot;Rising parent queries, more clarification&quot;</text>

      {/* Diagnosis callout */}
      <rect x="220" y="350" width="248" height="26" rx="4" fill="#F0FDFA" stroke="#1D9BA3" strokeWidth="1" />
      <text x="230" y="367" fontSize="9" fill="#1D9BA3" fontWeight="500">
        Expectation-setting drifting out of alignment
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 3: Trend Direction — Middle Right */}
      {/* ──────────────────────────────────────────── */}
      <rect x="496" y="188" width="293" height="196" rx="8" fill="#FFFFFF" />
      <rect x="496" y="188" width="293" height="196" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="208" fontSize="13" fontWeight="bold" fill="#171614">Trend Direction</text>
      <text x="750" y="208" fontSize="9" fill="#71706B" textAnchor="end">Term 1 → Term 2 → Term 3</text>

      {/* Trend 1: Communication Clarity — declining */}
      <rect x="512" y="222" width="261" height="34" rx="4" fill="#FAF8F3" />
      <text x="524" y="238" fontSize="10" fill="#171614">Communication Clarity</text>
      <text x="524" y="250" fontSize="14" fill="#f97316">↓</text>
      <text x="538" y="250" fontSize="9" fill="#f97316">slight decline</text>
      <polyline points="700,246 720,242 740,248 760,252" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trend 2: Staff Cognitive Load — accumulating */}
      <rect x="512" y="262" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="278" fontSize="10" fill="#171614">Staff Cognitive Load</text>
      <text x="524" y="290" fontSize="14" fill="#eab308">↑</text>
      <text x="538" y="290" fontSize="9" fill="#eab308">accumulating</text>
      <polyline points="700,290 720,286 740,282 760,276" fill="none" stroke="#eab308" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trend 3: Student Autonomy — gradual decline */}
      <rect x="512" y="302" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="318" fontSize="10" fill="#171614">Student Autonomy</text>
      <text x="524" y="330" fontSize="14" fill="#f97316">↓</text>
      <text x="538" y="330" fontSize="9" fill="#f97316">gradual</text>
      <polyline points="700,326 720,324 740,328 760,332" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />

      {/* Trend 4: Parent Confidence — stable */}
      <rect x="512" y="342" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="358" fontSize="10" fill="#171614">Parent Confidence</text>
      <text x="524" y="370" fontSize="14" fill="#22c55e">▬</text>
      <text x="538" y="370" fontSize="9" fill="#22c55e">stable</text>
      <polyline points="700,366 720,365 740,366 760,365" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" />

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 5: Leadership Action Layer — Bottom Left */}
      {/* ──────────────────────────────────────────── */}
      <rect x="204" y="396" width="280" height="194" rx="8" fill="#FFFFFF" />
      <rect x="204" y="396" width="280" height="194" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="416" fontSize="13" fontWeight="bold" fill="#171614">Areas to Watch</text>
      <text x="220" y="430" fontSize="9" fill="#71706B">Questions leadership may want to hold</text>

      {/* Action item 1 */}
      <rect x="220" y="442" width="248" height="40" rx="4" fill="#FAF8F3" />
      <rect x="228" y="450" width="3" height="24" rx="1.5" fill="#F25C05" />
      <text x="240" y="460" fontSize="10" fill="#171614" fontWeight="500">
        Communication norms across divisions
      </text>
      <text x="240" y="472" fontSize="9" fill="#71706B">
        Clarify before end-of-term to prevent compounding
      </text>

      {/* Action item 2 */}
      <rect x="220" y="490" width="248" height="40" rx="4" fill="transparent" />
      <rect x="228" y="498" width="3" height="24" rx="1.5" fill="#eab308" />
      <text x="240" y="508" fontSize="10" fill="#171614" fontWeight="500">
        Staff load accumulation pattern
      </text>
      <text x="240" y="520" fontSize="9" fill="#71706B">
        Where might continuity mechanisms need reinforcement?
      </text>

      {/* Action item 3 */}
      <rect x="220" y="538" width="248" height="40" rx="4" fill="transparent" />
      <rect x="228" y="546" width="3" height="24" rx="1.5" fill="#1D9BA3" />
      <text x="240" y="556" fontSize="10" fill="#171614" fontWeight="500">
        Student autonomy perception (upper years)
      </text>
      <text x="240" y="568" fontSize="9" fill="#71706B">
        Where might clarification reduce institutional load?
      </text>

      {/* Footer note */}
      <text x="220" y="586" fontSize="8" fill="#71706B" fontStyle="italic">
        Sense-holding, not directives — leadership authority preserved
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* SECTION 4: Safeguarding Signal — Bottom Right */}
      {/* ──────────────────────────────────────────── */}
      <rect x="496" y="396" width="293" height="116" rx="8" fill="#FFFFFF" />
      <rect x="496" y="396" width="293" height="116" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="416" fontSize="13" fontWeight="bold" fill="#171614">Safeguarding Signal</text>

      {/* All Clear state */}
      <rect x="512" y="428" width="261" height="32" rx="6" fill="#F0FDF4" />
      {/* Pulsing green dot */}
      <circle cx="528" cy="444" r="6" fill="#22c55e" opacity="0.3">
        <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="528" cy="444" r="4" fill="#22c55e" />
      <text x="542" y="448" fontSize="12" fontWeight="bold" fill="#22c55e">All Clear</text>
      <text x="604" y="448" fontSize="10" fill="#71706B">— no escalation signals</text>

      {/* Break-glass principle note */}
      <text x="512" y="478" fontSize="9" fill="#71706B">
        Signal escalation, not surveillance
      </text>
      <text x="512" y="492" fontSize="9" fill="#71706B">
        No individual tracking · No automatic identification
      </text>
      <text x="512" y="506" fontSize="9" fill="#71706B">
        Break-glass triggers held for leadership judgment
      </text>

      {/* ──────────────────────────────────────────── */}
      {/* Bottom-right: Governance note */}
      {/* ──────────────────────────────────────────── */}
      <rect x="496" y="524" width="293" height="66" rx="8" fill="#FAF8F3" />
      <rect x="496" y="524" width="293" height="66" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="544" fontSize="10" fontWeight="bold" fill="#171614">Governance Note</text>
      <text x="512" y="558" fontSize="9" fill="#71706B">
        This view is institutional intelligence —
      </text>
      <text x="512" y="570" fontSize="9" fill="#71706B">
        not a performance scorecard or decision engine.
      </text>
      <text x="512" y="584" fontSize="9" fill="#1D9BA3" fontWeight="500">
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

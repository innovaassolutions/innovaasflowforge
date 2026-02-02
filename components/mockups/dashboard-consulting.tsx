export default function DashboardConsulting() {
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
        Practice Overview
      </text>
      <text x="204" y="96" fontSize="12" fill="#71706B">
        January 2026 · 4 Active Engagements
      </text>

      {/* Row 1: KPI score cards */}
      <rect x="204" y="112" width="140" height="80" rx="8" fill="#FFFFFF" />
      <rect x="204" y="112" width="140" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="132" fontSize="10" fill="#71706B">Active Clients</text>
      <text x="220" y="162" fontSize="30" fontWeight="bold" fill="#F25C05">4</text>
      <text x="220" y="180" fontSize="10" fill="#22c55e">↑ 1 new this quarter</text>

      <rect x="354" y="112" width="140" height="80" rx="8" fill="#FFFFFF" />
      <rect x="354" y="112" width="140" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="370" y="132" fontSize="10" fill="#71706B">Stakeholders</text>
      <text x="370" y="162" fontSize="30" fontWeight="bold" fill="#1D9BA3">43</text>
      <text x="370" y="180" fontSize="10" fill="#71706B">across all engagements</text>

      <rect x="504" y="112" width="140" height="80" rx="8" fill="#FFFFFF" />
      <rect x="504" y="112" width="140" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="520" y="132" fontSize="10" fill="#71706B">Avg Readiness</text>
      <text x="520" y="162" fontSize="30" fontWeight="bold" fill="#22c55e">71%</text>
      <text x="520" y="180" fontSize="10" fill="#22c55e">↑ from 64% last quarter</text>

      <rect x="654" y="112" width="135" height="80" rx="8" fill="#FFFFFF" />
      <rect x="654" y="112" width="135" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="670" y="132" fontSize="10" fill="#71706B">Reports Delivered</text>
      <text x="670" y="162" fontSize="30" fontWeight="bold" fill="#F25C05">7</text>
      <text x="670" y="180" fontSize="10" fill="#71706B">this quarter</text>

      {/* Row 2: Client Readiness Scores + Stakeholder Alignment */}
      {/* Client Readiness Scores */}
      <rect x="204" y="206" width="280" height="185" rx="8" fill="#FFFFFF" />
      <rect x="204" y="206" width="280" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="230" fontSize="13" fontWeight="bold" fill="#171614">Client Readiness Scores</text>

      {/* Client score bars */}
      <text x="220" y="258" fontSize="11" fill="#171614">Acme Corp</text>
      <rect x="310" y="248" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="310" y="248" width="112" height="10" rx="5" fill="#22c55e" />
      <text x="460" y="258" fontSize="10" fontWeight="bold" fill="#22c55e">80%</text>

      <text x="220" y="284" fontSize="11" fill="#171614">Smith &amp; Co</text>
      <rect x="310" y="274" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="310" y="274" width="98" height="10" rx="5" fill="#1D9BA3" />
      <text x="460" y="284" fontSize="10" fontWeight="bold" fill="#1D9BA3">70%</text>

      <text x="220" y="310" fontSize="11" fill="#171614">Global Finance</text>
      <rect x="310" y="300" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="310" y="300" width="91" height="10" rx="5" fill="#eab308" />
      <text x="460" y="310" fontSize="10" fontWeight="bold" fill="#eab308">65%</text>

      <text x="220" y="336" fontSize="11" fill="#171614">TechVentures</text>
      <rect x="310" y="326" width="140" height="10" rx="5" fill="#E7E5E4" />
      <rect x="310" y="326" width="77" height="10" rx="5" fill="#f97316" />
      <text x="460" y="336" fontSize="10" fontWeight="bold" fill="#f97316">55%</text>

      {/* Avg line indicator */}
      <line x1="310" y1="360" x2="460" y2="360" stroke="#E7E5E4" strokeWidth="1" strokeDasharray="4 2" />
      <text x="220" y="364" fontSize="10" fill="#71706B">Avg: 71%</text>
      <line x1="409" y1="354" x2="409" y2="368" stroke="#F25C05" strokeWidth="2" />

      {/* Stakeholder Alignment */}
      <rect x="496" y="206" width="293" height="185" rx="8" fill="#FFFFFF" />
      <rect x="496" y="206" width="293" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="512" y="230" fontSize="13" fontWeight="bold" fill="#171614">Stakeholder Alignment</text>
      <text x="512" y="246" fontSize="10" fill="#71706B">Leadership vs. operational views</text>

      {/* Alignment gauge per client */}
      <rect x="512" y="260" width="261" height="34" rx="4" fill="#FAF8F3" />
      <text x="524" y="276" fontSize="11" fill="#171614">Acme Corp</text>
      <text x="524" y="290" fontSize="9" fill="#71706B">Leadership ↔ Ops</text>
      <rect x="650" y="268" width="80" height="8" rx="4" fill="#E7E5E4" />
      <rect x="650" y="268" width="72" height="8" rx="4" fill="#22c55e" />
      <text x="740" y="276" fontSize="10" fontWeight="bold" fill="#22c55e">High</text>

      <rect x="512" y="300" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="316" fontSize="11" fill="#171614">Smith &amp; Co</text>
      <text x="524" y="330" fontSize="9" fill="#71706B">Leadership ↔ Ops</text>
      <rect x="650" y="308" width="80" height="8" rx="4" fill="#E7E5E4" />
      <rect x="650" y="308" width="48" height="8" rx="4" fill="#eab308" />
      <text x="740" y="316" fontSize="10" fontWeight="bold" fill="#eab308">Med</text>

      <rect x="512" y="340" width="261" height="34" rx="4" fill="transparent" />
      <text x="524" y="356" fontSize="11" fill="#171614">Global Finance</text>
      <text x="524" y="370" fontSize="9" fill="#71706B">Leadership ↔ Ops</text>
      <rect x="650" y="348" width="80" height="8" rx="4" fill="#E7E5E4" />
      <rect x="650" y="348" width="28" height="8" rx="4" fill="#ef4444" />
      <text x="740" y="356" fontSize="10" fontWeight="bold" fill="#ef4444">Low</text>

      {/* Row 3: Key Findings + Risk/Opportunity */}
      {/* Key Findings Summary */}
      <rect x="204" y="405" width="390" height="185" rx="8" fill="#FFFFFF" />
      <rect x="204" y="405" width="390" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="220" y="429" fontSize="13" fontWeight="bold" fill="#171614">Key Findings Across Clients</text>

      <rect x="220" y="444" width="358" height="38" rx="4" fill="#FAF8F3" />
      <rect x="228" y="452" width="4" height="22" rx="2" fill="#22c55e" />
      <text x="244" y="462" fontSize="11" fill="#171614" fontWeight="500">Technology infrastructure is strong</text>
      <text x="244" y="476" fontSize="9" fill="#71706B">3 of 4 clients score &gt;70% on technology readiness</text>

      <rect x="220" y="488" width="358" height="38" rx="4" fill="transparent" />
      <rect x="228" y="496" width="4" height="22" rx="2" fill="#f97316" />
      <text x="244" y="506" fontSize="11" fill="#171614" fontWeight="500">Change management is the top gap</text>
      <text x="244" y="520" fontSize="9" fill="#71706B">Avg 48% across all engagements — consistent weakness</text>

      <rect x="220" y="532" width="358" height="38" rx="4" fill="transparent" />
      <rect x="228" y="540" width="4" height="22" rx="2" fill="#1D9BA3" />
      <text x="244" y="550" fontSize="11" fill="#171614" fontWeight="500">Data governance improving quarter-over-quarter</text>
      <text x="244" y="564" fontSize="9" fill="#71706B">Up 12 pts avg since initial assessments</text>

      {/* Risk / Opportunity Indicators */}
      <rect x="604" y="405" width="185" height="185" rx="8" fill="#FFFFFF" />
      <rect x="604" y="405" width="185" height="185" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="620" y="429" fontSize="13" fontWeight="bold" fill="#171614">Signals</text>

      <text x="620" y="452" fontSize="10" fontWeight="bold" fill="#ef4444">⚠ Risks</text>

      <circle cx="628" cy="468" r="3" fill="#ef4444" />
      <text x="638" y="472" fontSize="10" fill="#171614">Global Finance misalignment</text>

      <circle cx="628" cy="488" r="3" fill="#f97316" />
      <text x="638" y="492" fontSize="10" fill="#171614">TechVentures stalled at 55%</text>

      <text x="620" y="518" fontSize="10" fontWeight="bold" fill="#22c55e">✦ Opportunities</text>

      <circle cx="628" cy="534" r="3" fill="#22c55e" />
      <text x="638" y="538" fontSize="10" fill="#171614">Acme ready for Phase 2</text>

      <circle cx="628" cy="554" r="3" fill="#1D9BA3" />
      <text x="638" y="558" fontSize="10" fill="#171614">Smith &amp; Co upsell potential</text>

      <circle cx="628" cy="574" r="3" fill="#22c55e" />
      <text x="638" y="578" fontSize="10" fill="#171614">Q1 pipeline: 2 new leads</text>

      {/* Gradient Definition */}
      <defs>
        <linearGradient id="dashGradConsulting" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

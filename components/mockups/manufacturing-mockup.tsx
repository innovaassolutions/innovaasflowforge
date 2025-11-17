export default function ManufacturingMockup() {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto drop-shadow-2xl"
    >
      {/* Browser Window Frame */}
      <rect width="800" height="600" rx="12" fill="#1e1e2e" />

      {/* Browser Chrome */}
      <rect width="800" height="40" rx="12" fill="#313244" />
      <circle cx="20" cy="20" r="6" fill="#f38ba8" />
      <circle cx="40" cy="20" r="6" fill="#fab387" />
      <circle cx="60" cy="20" r="6" fill="#a6e3a1" />

      {/* URL Bar */}
      <rect x="90" y="10" width="600" height="20" rx="4" fill="#1e1e2e" />
      <text x="100" y="25" fontSize="12" fill="#6c7086" fontFamily="monospace">
        flowforge.ai/session/manufacturing-assessment
      </text>

      {/* Header */}
      <rect y="40" width="800" height="60" fill="#181825" />
      <text x="30" y="75" fontSize="20" fontWeight="bold" fill="#cdd6f4">
        Manufacturing Digital Transformation Assessment
      </text>

      {/* Chat Messages Container */}
      <rect y="100" width="800" height="500" fill="#1e1e2e" />

      {/* AI Message 1 */}
      <rect x="30" y="120" width="500" height="80" rx="8" fill="#313244" />
      <text x="50" y="145" fontSize="14" fontWeight="bold" fill="#fab387">
        FlowForge AI Assistant
      </text>
      <text x="50" y="170" fontSize="13" fill="#cdd6f4">
        Let's assess your production floor's automation maturity.
      </text>
      <text x="50" y="190" fontSize="13" fill="#cdd6f4">
        What percentage of your processes use automated systems?
      </text>

      {/* User Message */}
      <rect x="270" y="220" width="500" height="60" rx="8" fill="#89b4fa" opacity="0.2" />
      <rect x="270" y="220" width="500" height="60" rx="8" fill="none" stroke="#89b4fa" strokeWidth="2" />
      <text x="290" y="245" fontSize="13" fill="#cdd6f4">
        About 30% of our assembly line is automated, but our
      </text>
      <text x="290" y="265" fontSize="13" fill="#cdd6f4">
        quality control is still mostly manual inspection.
      </text>

      {/* AI Message 2 */}
      <rect x="30" y="300" width="520" height="100" rx="8" fill="#313244" />
      <text x="50" y="325" fontSize="14" fontWeight="bold" fill="#fab387">
        FlowForge AI Assistant
      </text>
      <text x="50" y="350" fontSize="13" fill="#cdd6f4">
        Excellent context. For quality control specifically, are you
      </text>
      <text x="50" y="370" fontSize="13" fill="#cdd6f4">
        collecting any digital data during inspections, or is it
      </text>
      <text x="50" y="390" fontSize="13" fill="#cdd6f4">
        primarily recorded on paper forms?
      </text>

      {/* Typing Indicator */}
      <rect x="30" y="420" width="100" height="40" rx="8" fill="#313244" />
      <circle cx="60" cy="440" r="4" fill="#6c7086">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="440" r="4" fill="#6c7086">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="440" r="4" fill="#6c7086">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
      </circle>

      {/* Input Area */}
      <rect y="540" width="800" height="60" fill="#181825" />
      <rect x="30" y="555" width="680" height="30" rx="15" fill="#313244" />
      <text x="50" y="575" fontSize="13" fill="#6c7086">
        Type your response...
      </text>

      {/* Send Button */}
      <circle cx="750" cy="570" r="18" fill="#f25c05" />
      <circle cx="750" cy="570" r="18" fill="url(#gradient)" />
      <path
        d="M 745 570 L 755 570 L 750 565 Z"
        fill="#1e1e2e"
        transform="rotate(90 750 570)"
      />

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

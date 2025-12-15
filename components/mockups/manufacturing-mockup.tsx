export default function ManufacturingMockup() {
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
        flowforge.ai/session/manufacturing-assessment
      </text>

      {/* Header */}
      <rect y="40" width="800" height="60" fill="#F5F5F4" />
      <text x="30" y="75" fontSize="20" fontWeight="bold" fill="#171614">
        Manufacturing Digital Transformation Assessment
      </text>

      {/* Chat Messages Container */}
      <rect y="100" width="800" height="500" fill="#FFFEFB" />

      {/* AI Message 1 */}
      <rect x="30" y="120" width="500" height="80" rx="8" fill="#FFFFFF" />
      <rect x="30" y="120" width="500" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="145" fontSize="14" fontWeight="bold" fill="#F25C05">
        FlowForge AI Assistant
      </text>
      <text x="50" y="170" fontSize="13" fill="#171614">
        Let's assess your production floor's automation maturity.
      </text>
      <text x="50" y="190" fontSize="13" fill="#171614">
        What percentage of your processes use automated systems?
      </text>

      {/* User Message */}
      <rect x="270" y="220" width="500" height="60" rx="8" fill="#F25C05" opacity="0.1" />
      <rect x="270" y="220" width="500" height="60" rx="8" fill="none" stroke="#F25C05" strokeWidth="2" />
      <text x="290" y="245" fontSize="13" fill="#171614">
        About 30% of our assembly line is automated, but our
      </text>
      <text x="290" y="265" fontSize="13" fill="#171614">
        quality control is still mostly manual inspection.
      </text>

      {/* AI Message 2 */}
      <rect x="30" y="300" width="520" height="100" rx="8" fill="#FFFFFF" />
      <rect x="30" y="300" width="520" height="100" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="325" fontSize="14" fontWeight="bold" fill="#F25C05">
        FlowForge AI Assistant
      </text>
      <text x="50" y="350" fontSize="13" fill="#171614">
        Excellent context. For quality control specifically, are you
      </text>
      <text x="50" y="370" fontSize="13" fill="#171614">
        collecting any digital data during inspections, or is it
      </text>
      <text x="50" y="390" fontSize="13" fill="#171614">
        primarily recorded on paper forms?
      </text>

      {/* Typing Indicator */}
      <rect x="30" y="420" width="100" height="40" rx="8" fill="#F5F5F4" />
      <circle cx="60" cy="440" r="4" fill="#78716C">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="440" r="4" fill="#78716C">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="440" r="4" fill="#78716C">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
      </circle>

      {/* Input Area */}
      <rect y="540" width="800" height="60" fill="#F5F5F4" />
      <rect x="30" y="555" width="680" height="30" rx="15" fill="#FFFFFF" />
      <rect x="30" y="555" width="680" height="30" rx="15" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="575" fontSize="13" fill="#78716C">
        Type your response...
      </text>

      {/* Send Button */}
      <circle cx="750" cy="570" r="18" fill="url(#gradient)" />
      <path
        d="M 745 570 L 755 570 L 750 565 Z"
        fill="#FFFFFF"
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

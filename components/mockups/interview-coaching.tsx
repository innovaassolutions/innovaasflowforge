export default function InterviewCoaching() {
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
        flowforge.ai/session/leadership-discovery
      </text>

      {/* Header */}
      <rect y="40" width="800" height="60" fill="#FAF8F3" />
      <text x="30" y="75" fontSize="20" fontWeight="bold" fill="#171614">
        Leadership Discovery Session
      </text>

      {/* Chat Messages Container */}
      <rect y="100" width="800" height="500" fill="#FFFEFB" />

      {/* AI Message 1 */}
      <rect x="30" y="120" width="540" height="100" rx="8" fill="#FFFFFF" />
      <rect x="30" y="120" width="540" height="100" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="145" fontSize="14" fontWeight="bold" fill="#F25C05">
        FlowForge AI Coach
      </text>
      <text x="50" y="170" fontSize="13" fill="#171614">
        Welcome to your leadership discovery. There are no right or wrong
      </text>
      <text x="50" y="190" fontSize="13" fill="#171614">
        answers — just honest reflection. When you're under pressure at
      </text>
      <text x="50" y="210" fontSize="13" fill="#171614">
        work, what's your instinctive first response?
      </text>

      {/* User Message */}
      <rect x="250" y="240" width="520" height="80" rx="8" fill="#F25C05" opacity="0.1" />
      <rect x="250" y="240" width="520" height="80" rx="8" fill="none" stroke="#F25C05" strokeWidth="2" />
      <text x="270" y="265" fontSize="13" fill="#171614">
        I tend to take charge and start organizing people. I get very
      </text>
      <text x="270" y="285" fontSize="13" fill="#171614">
        focused on the problem, sometimes at the expense of checking
      </text>
      <text x="270" y="305" fontSize="13" fill="#171614">
        in with how my team is feeling about it.
      </text>

      {/* AI Message 2 */}
      <rect x="30" y="340" width="540" height="100" rx="8" fill="#FFFFFF" />
      <rect x="30" y="340" width="540" height="100" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="365" fontSize="14" fontWeight="bold" fill="#F25C05">
        FlowForge AI Coach
      </text>
      <text x="50" y="390" fontSize="13" fill="#171614">
        That self-awareness is powerful. You notice the tension between
      </text>
      <text x="50" y="410" fontSize="13" fill="#171614">
        action and empathy. Think of a time when you did pause to check
      </text>
      <text x="50" y="430" fontSize="13" fill="#171614">
        in — what happened differently in that situation?
      </text>

      {/* Typing Indicator */}
      <rect x="30" y="460" width="100" height="40" rx="8" fill="#FAF8F3" />
      <circle cx="60" cy="480" r="4" fill="#71706B">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="480" r="4" fill="#71706B">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="480" r="4" fill="#71706B">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.4s" repeatCount="indefinite" />
      </circle>

      {/* Input Area */}
      <rect y="540" width="800" height="60" fill="#FAF8F3" />
      <rect x="30" y="555" width="680" height="30" rx="15" fill="#FFFFFF" />
      <rect x="30" y="555" width="680" height="30" rx="15" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="575" fontSize="13" fill="#71706B">
        Type your response...
      </text>

      {/* Send Button */}
      <circle cx="750" cy="570" r="18" fill="url(#coaching-gradient)" />
      <path
        d="M 745 570 L 755 570 L 750 565 Z"
        fill="#FFFFFF"
        transform="rotate(90 750 570)"
      />

      <defs>
        <linearGradient id="coaching-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function InterviewEducation() {
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
        flowforge.innovaas.co/session/parent-feedback
      </text>

      {/* Header */}
      <rect y="40" width="800" height="60" fill="#FAF8F3" />
      <text x="30" y="75" fontSize="20" fontWeight="bold" fill="#171614">
        Parent Experience Feedback
      </text>

      {/* Chat Messages Container */}
      <rect y="100" width="800" height="500" fill="#FFFEFB" />

      {/* AI Message 1 */}
      <rect x="30" y="120" width="530" height="80" rx="8" fill="#FFFFFF" />
      <rect x="30" y="120" width="530" height="80" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="145" fontSize="14" fontWeight="bold" fill="#1D9BA3">
        FlowForge AI
      </text>
      <text x="50" y="170" fontSize="13" fill="#171614">
        Welcome! We'd love to hear about your family's experience.
      </text>
      <text x="50" y="190" fontSize="13" fill="#171614">
        How would you describe communication with your child's teachers?
      </text>

      {/* User Message */}
      <rect x="230" y="220" width="540" height="80" rx="8" fill="#1D9BA3" opacity="0.1" />
      <rect x="230" y="220" width="540" height="80" rx="8" fill="none" stroke="#1D9BA3" strokeWidth="2" />
      <text x="250" y="245" fontSize="13" fill="#171614">
        It's been mostly good — we get weekly newsletters. But when
      </text>
      <text x="250" y="265" fontSize="13" fill="#171614">
        there's something specific about my son, I sometimes feel like
      </text>
      <text x="250" y="285" fontSize="13" fill="#171614">
        I'm not hearing about it until parent-teacher conferences.
      </text>

      {/* AI Message 2 */}
      <rect x="30" y="320" width="540" height="100" rx="8" fill="#FFFFFF" />
      <rect x="30" y="320" width="540" height="100" rx="8" fill="none" stroke="#E7E5E4" strokeWidth="1" />
      <text x="50" y="345" fontSize="14" fontWeight="bold" fill="#1D9BA3">
        FlowForge AI
      </text>
      <text x="50" y="370" fontSize="13" fill="#171614">
        That's really valuable feedback. It sounds like the general updates
      </text>
      <text x="50" y="390" fontSize="13" fill="#171614">
        are good, but you'd like more individual progress visibility. If you
      </text>
      <text x="50" y="410" fontSize="13" fill="#171614">
        could change one thing about school communication, what would it be?
      </text>

      {/* Typing Indicator */}
      <rect x="30" y="440" width="100" height="40" rx="8" fill="#FAF8F3" />
      <circle cx="60" cy="460" r="4" fill="#71706B">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="460" r="4" fill="#71706B">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="460" r="4" fill="#71706B">
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
      <circle cx="750" cy="570" r="18" fill="url(#education-gradient)" />
      <path
        d="M 745 570 L 755 570 L 750 565 Z"
        fill="#FFFFFF"
        transform="rotate(90 750 570)"
      />

      <defs>
        <linearGradient id="education-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f25c05" />
          <stop offset="100%" stopColor="#1d9ba3" />
        </linearGradient>
      </defs>
    </svg>
  )
}

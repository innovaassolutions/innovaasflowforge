// Education Industry Hero Mockup - Shows institutional assessment insights
export default function IndustryHeroEducation() {
	return (
		<svg
			viewBox="0 0 900 500"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="w-full h-auto"
		>
			<defs>
				{/* Industry gradient - academic blue */}
				<linearGradient id="edu-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#3B82F6" />
					<stop offset="100%" stopColor="#6366F1" />
				</linearGradient>
				<filter id="edu-glow" x="-50%" y="-50%" width="200%" height="200%">
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

			{/* LEFT PANEL - Faculty Insights */}
			<rect x="40" y="30" width="380" height="50" rx="16" fill="#FAF8F3" />
			<rect x="40" y="64" width="380" height="1" fill="#E7E5E4" />
			<circle cx="65" cy="55" r="8" fill="#3B82F6" />
			<text x="82" y="60" fontSize="14" fontWeight="600" fill="#171614">Institutional Assessment</text>

			{/* Education icon */}
			<rect x="60" y="100" width="60" height="60" rx="12" fill="#3B82F6" fillOpacity="0.1" />
			<path d="M90 115 L65 130 L90 145 L115 130 Z" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinejoin="round" />
			<path d="M75 135 L75 150 Q90 158 105 150 L105 135" fill="none" stroke="#3B82F6" strokeWidth="2" />

			{/* Institution info */}
			<text x="140" y="125" fontSize="16" fontWeight="600" fill="#171614">Greenfield International School</text>
			<text x="140" y="145" fontSize="12" fill="#71706B">Complete Assessment • Faculty + Parents</text>

			{/* Response stats */}
			<rect x="60" y="175" width="340" height="70" rx="12" fill="#3B82F6" fillOpacity="0.05" />
			<g transform="translate(75, 195)">
				<text x="0" y="0" fontSize="24" fontWeight="700" fill="#3B82F6">72</text>
				<text x="0" y="18" fontSize="9" fill="#71706B">Faculty</text>
			</g>
			<g transform="translate(145, 195)">
				<text x="0" y="0" fontSize="24" fontWeight="700" fill="#22C55E">248</text>
				<text x="0" y="18" fontSize="9" fill="#71706B">Parents</text>
			</g>
			<g transform="translate(225, 195)">
				<text x="0" y="0" fontSize="24" fontWeight="700" fill="#6366F1">85%</text>
				<text x="0" y="18" fontSize="9" fill="#71706B">Response</text>
			</g>
			<g transform="translate(305, 195)">
				<text x="0" y="0" fontSize="24" fontWeight="700" fill="#8B5CF6">6</text>
				<text x="0" y="18" fontSize="9" fill="#71706B">Depts</text>
			</g>

			{/* Parent Satisfaction Score */}
			<text x="60" y="270" fontSize="11" fontWeight="600" fill="#71706B">PARENT SATISFACTION</text>

			<g transform="translate(60, 283)">
				<rect x="0" y="0" width="340" height="50" rx="8" fill="#22C55E" fillOpacity="0.05" />
				<circle cx="30" cy="25" r="20" stroke="#22C55E" strokeWidth="4" fill="none" />
				<circle cx="30" cy="25" r="20" stroke="#E7E5E4" strokeWidth="4" fill="none" strokeDasharray="126" strokeDashoffset="126" />
				<circle cx="30" cy="25" r="20" stroke="#22C55E" strokeWidth="4" fill="none" strokeDasharray="126" strokeDashoffset="23" strokeLinecap="round" transform="rotate(-90 30 25)">
					<animate attributeName="stroke-dashoffset" from="126" to="23" dur="1s" fill="freeze" />
				</circle>
				<text x="30" y="29" fontSize="11" fontWeight="700" fill="#22C55E" textAnchor="middle">82%</text>

				<text x="65" y="18" fontSize="11" fontWeight="600" fill="#171614">Parents recommend institution</text>
				<text x="65" y="34" fontSize="10" fill="#71706B">+8% vs last year • Top driver: Communication</text>
			</g>

			{/* Key insight */}
			<rect x="60" y="350" width="340" height="55" rx="8" fill="#FFFEFB" stroke="#3B82F6" strokeWidth="1" />
			<circle cx="85" cy="377" r="12" fill="#F59E0B" />
			<text x="83" y="381" fontSize="12" fill="white" textAnchor="middle">!</text>
			<text x="105" y="370" fontSize="11" fontWeight="600" fill="#171614">Gap Identified</text>
			<text x="105" y="386" fontSize="10" fill="#71706B">Parents want more progress updates - faculty unaware</text>

			{/* Accreditation tag */}
			<rect x="60" y="430" width="340" height="35" rx="6" fill="#FAF8F3" />
			<text x="80" y="452" fontSize="11" fill="#71706B">Accreditation evidence •</text>
			<text x="200" y="452" fontSize="11" fontWeight="600" fill="#3B82F6">SACSCOC aligned documentation</text>

			{/* RIGHT PANEL - Department Analysis */}
			<rect x="480" y="30" width="380" height="50" rx="16" fill="#171614" />
			<text x="510" y="60" fontSize="14" fontWeight="600" fill="#FFFEFB">SCHOOL HEALTH CHECK</text>
			<circle cx="830" cy="55" r="6" fill="#22C55E">
				<animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
			</circle>

			{/* Department bars */}
			<g transform="translate(510, 100)">
				<text x="0" y="0" fontSize="11" fontWeight="600" fill="#71706B">DIGITAL READINESS BY DEPARTMENT</text>

				{/* Business */}
				<text x="0" y="30" fontSize="11" fill="#171614">Business</text>
				<rect x="100" y="18" width="200" height="18" rx="4" fill="#E7E5E4" />
				<rect x="100" y="18" width="170" height="18" rx="4" fill="#22C55E">
					<animate attributeName="width" from="0" to="170" dur="0.8s" fill="freeze" />
				</rect>
				<text x="310" y="31" fontSize="11" fontWeight="600" fill="#22C55E">85%</text>

				{/* STEM */}
				<text x="0" y="60" fontSize="11" fill="#171614">STEM</text>
				<rect x="100" y="48" width="200" height="18" rx="4" fill="#E7E5E4" />
				<rect x="100" y="48" width="156" height="18" rx="4" fill="#3B82F6">
					<animate attributeName="width" from="0" to="156" dur="0.8s" fill="freeze" begin="0.1s" />
				</rect>
				<text x="310" y="61" fontSize="11" fontWeight="600" fill="#3B82F6">78%</text>

				{/* Arts & Humanities */}
				<text x="0" y="90" fontSize="11" fill="#171614">Arts & Humanities</text>
				<rect x="100" y="78" width="200" height="18" rx="4" fill="#E7E5E4" />
				<rect x="100" y="78" width="130" height="18" rx="4" fill="#6366F1">
					<animate attributeName="width" from="0" to="130" dur="0.8s" fill="freeze" begin="0.2s" />
				</rect>
				<text x="310" y="91" fontSize="11" fontWeight="600" fill="#6366F1">65%</text>

				{/* Education */}
				<text x="0" y="120" fontSize="11" fill="#171614">Education</text>
				<rect x="100" y="108" width="200" height="18" rx="4" fill="#E7E5E4" />
				<rect x="100" y="108" width="144" height="18" rx="4" fill="#8B5CF6">
					<animate attributeName="width" from="0" to="144" dur="0.8s" fill="freeze" begin="0.3s" />
				</rect>
				<text x="310" y="121" fontSize="11" fontWeight="600" fill="#8B5CF6">72%</text>

				{/* Health Sciences */}
				<text x="0" y="150" fontSize="11" fill="#171614">Health Sciences</text>
				<rect x="100" y="138" width="200" height="18" rx="4" fill="#E7E5E4" />
				<rect x="100" y="138" width="116" height="18" rx="4" fill="#F59E0B">
					<animate attributeName="width" from="0" to="116" dur="0.8s" fill="freeze" begin="0.4s" />
				</rect>
				<text x="310" y="151" fontSize="11" fontWeight="600" fill="#F59E0B">58%</text>
			</g>

			{/* Strategic recommendations */}
			<text x="510" y="285" fontSize="11" fontWeight="600" fill="#171614">Priority Actions</text>

			<g transform="translate(510, 300)">
				<rect x="0" y="0" width="320" height="40" rx="6" fill="#3B82F6" fillOpacity="0.1" />
				<circle cx="20" cy="20" r="12" fill="#3B82F6" />
				<text x="20" y="24" fontSize="10" fill="white" textAnchor="middle">1</text>
				<text x="42" y="17" fontSize="10" fontWeight="500" fill="#171614">Launch faculty development program</text>
				<text x="42" y="30" fontSize="9" fill="#71706B">Address training gap cited by 68% of faculty</text>
			</g>

			<g transform="translate(510, 350)">
				<rect x="0" y="0" width="320" height="40" rx="6" fill="#22C55E" fillOpacity="0.1" />
				<circle cx="20" cy="20" r="12" fill="#22C55E" />
				<text x="20" y="24" fontSize="10" fill="white" textAnchor="middle">2</text>
				<text x="42" y="17" fontSize="10" fontWeight="500" fill="#171614">Implement parent progress portal</text>
				<text x="42" y="30" fontSize="9" fill="#71706B">Address #1 parent request - boost satisfaction 12%</text>
			</g>

			<g transform="translate(510, 400)">
				<rect x="0" y="0" width="320" height="40" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
				<circle cx="20" cy="20" r="12" fill="#8B5CF6" />
				<text x="20" y="24" fontSize="10" fill="white" textAnchor="middle">3</text>
				<text x="42" y="17" fontSize="10" fontWeight="500" fill="#171614">Pilot hybrid learning in Health Sciences</text>
				<text x="42" y="30" fontSize="9" fill="#71706B">Lowest digital readiness - targeted support</text>
			</g>
		</svg>
	)
}

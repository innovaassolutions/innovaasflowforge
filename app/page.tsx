import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-mocha-base">
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/designguide/innovaas_orange_and_white_transparent_bkgrnd_2559x594.png"
            alt="Innovaas Logo"
            width={400}
            height={93}
            priority
            className="w-auto h-20"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-brand bg-clip-text text-transparent
                       md:text-5xl
                       lg:text-6xl">
          InnovaasFlow Forge
        </h1>

        <p className="text-xl text-mocha-subtext1 text-center max-w-2xl mb-8
                      md:text-2xl">
          Smart Industry 4.0 Readiness Assessment Platform
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-6 max-w-4xl w-full mt-12
                        md:grid-cols-2
                        lg:grid-cols-3">
          <div className="card">
            <div className="w-12 h-12 rounded-lg bg-brand-orange/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-mocha-text mb-2">Multi-Stakeholder</h3>
            <p className="text-mocha-subtext1 text-sm">Role-based interviews across IT, Operations, Production, and Engineering teams</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 rounded-lg bg-brand-teal/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-mocha-text mb-2">AI-Powered</h3>
            <p className="text-mocha-subtext1 text-sm">Intelligent conversation agents tailored to each stakeholder role</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 rounded-lg bg-mocha-mauve/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-mocha-mauve" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-mocha-text mb-2">Cross-Synthesis</h3>
            <p className="text-mocha-subtext1 text-sm">Automated analysis combining insights and identifying strategic gaps</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 mt-12
                        xs:flex-row">
          <button className="btn-primary">
            Start Assessment Campaign
          </button>
          <button className="btn-secondary">
            View Demo
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-12">
          <span className="badge badge-warning">
            🚧 In Development - Workshop Ready Nov 18, 2025
          </span>
        </div>
      </div>
    </div>
  );
}

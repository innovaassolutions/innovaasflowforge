'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Factory,
  Briefcase,
  Target,
  Check,
  Clock,
  Shield,
  TrendingUp,
  Brain
} from 'lucide-react'
import ManufacturingMockup from './mockups/manufacturing-mockup'
import DashboardMockup from './mockups/dashboard-mockup'
import ReportMockup from './mockups/report-mockup'
import HeroBackground from './mockups/hero-background'

export default function PromotionalLanding() {
  const [selectedMockup, setSelectedMockup] = useState<'dashboard' | 'interview' | 'report'>('interview')

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20
                          md:py-28
                          lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-brand-teal/10" />
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-6
                        lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-foreground mb-6
                           sm:text-5xl
                           md:text-6xl
                           lg:text-7xl">
              Transform Stakeholder Insights Into{' '}
              <span className="text-primary">
                Strategic Action
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto
                          md:text-xl
                          lg:text-2xl">
              AI-powered assessment platform that conducts intelligent stakeholder interviews
              and synthesizes insights into actionable transformation roadmaps.
            </p>

            <div className="flex flex-col gap-4 items-center
                            sm:flex-row sm:justify-center
                            md:gap-6">
              <Link
                href="/auth/signup"
                className="w-full px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg
                           hover:bg-[hsl(var(--accent-hover))] transition-colors
                           sm:w-auto
                           md:px-10 md:py-5 md:text-lg">
                Start Free Assessment
              </Link>

              <Link
                href="#how-it-works"
                className="w-full px-8 py-4 border-2 border-border bg-card text-foreground font-semibold rounded-lg
                           hover:bg-muted hover:border-primary transition-colors
                           sm:w-auto
                           md:px-10 md:py-5 md:text-lg">
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-16 bg-muted
                          md:py-20
                          lg:py-24">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12
                         md:text-4xl
                         lg:text-5xl lg:mb-16">
            Built For Transformation Leaders
          </h2>

          <div className="grid grid-cols-1 gap-6
                          md:grid-cols-2 md:gap-8
                          lg:grid-cols-3 lg:gap-10">
            {/* Persona 1 */}
            <div className="bg-card p-6 rounded-lg border border-border
                            hover:border-brand-teal transition-colors
                            md:p-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4
                              md:w-14 md:h-14">
                <Factory className="w-6 h-6 text-primary-foreground
                                   md:w-7 md:h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3
                             md:text-2xl">
                Manufacturing Leaders
              </h3>
              <p className="text-muted-foreground mb-4
                            md:text-lg">
                Assess Industry 4.0 readiness across production facilities and stakeholder teams.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground
                             md:text-base">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Digital transformation maturity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Automation readiness analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Stakeholder alignment mapping</span>
                </li>
              </ul>
            </div>

            {/* Persona 2 */}
            <div className="bg-card p-6 rounded-lg border border-border
                            hover:border-brand-teal transition-colors
                            md:p-8">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4
                              md:w-14 md:h-14">
                <Briefcase className="w-6 h-6 text-primary-foreground
                                     md:w-7 md:h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3
                             md:text-2xl">
                Management Consultants
              </h3>
              <p className="text-muted-foreground mb-4
                            md:text-lg">
                Facilitate structured workshops and synthesize insights across diverse methodologies.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground
                             md:text-base">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Lean Six Sigma workshops</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Business Model Canvas sessions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Theory of Constraints analysis</span>
                </li>
              </ul>
            </div>

            {/* Persona 3 */}
            <div className="bg-card p-6 rounded-lg border border-border
                            hover:border-brand-teal transition-colors
                            md:p-8 md:col-span-2
                            lg:col-span-1">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4
                              md:w-14 md:h-14">
                <Target className="w-6 h-6 text-primary-foreground
                                  md:w-7 md:h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3
                             md:text-2xl">
                Strategic Planners
              </h3>
              <p className="text-muted-foreground mb-4
                            md:text-lg">
                Gather cross-functional insights and build data-driven strategic roadmaps.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground
                             md:text-base">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Jobs To Be Done research</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Strategic brainstorming facilitation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <span>Multi-stakeholder synthesis</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-background
                                             md:py-20
                                             lg:py-24">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12
                         md:text-4xl
                         lg:text-5xl lg:mb-16">
            Three Steps to Strategic Clarity
          </h2>

          <div className="grid grid-cols-1 gap-12
                          lg:grid-cols-3 lg:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-base font-bold text-primary-foreground
                                md:w-14 md:h-14 md:text-xl">
                  1
                </div>
                <div className="flex-1 h-1 bg-primary/50 ml-4
                                lg:hidden" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4
                             md:text-3xl">
                Create Campaign
              </h3>
              <p className="text-muted-foreground mb-4
                            md:text-lg">
                Define your assessment scope and invite stakeholders via secure, personalized links.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground
                             md:text-base">
                <li>• Multi-stakeholder coordination</li>
                <li>• Flexible methodology selection</li>
                <li>• Progress tracking dashboard</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-base font-bold text-primary-foreground
                                md:w-14 md:h-14 md:text-xl">
                  2
                </div>
                <div className="flex-1 h-1 bg-primary/50 ml-4
                                lg:hidden" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4
                             md:text-3xl">
                AI-Facilitated Interviews
              </h3>
              <p className="text-muted-foreground mb-4
                            md:text-lg">
                Stakeholders engage in intelligent conversations that adapt based on their responses.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground
                             md:text-base">
                <li>• Context-aware questioning</li>
                <li>• Natural conversation flow</li>
                <li>• Anonymous response options</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold
                                md:w-14 md:h-14 md:text-xl">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4
                             md:text-3xl">
                Strategic Synthesis
              </h3>
              <p className="text-muted-foreground mb-4
                            md:text-lg">
                AI analyzes all interviews and generates comprehensive readiness assessments.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground
                             md:text-base">
                <li>• Multi-dimensional analysis</li>
                <li>• Visual data representations</li>
                <li>• Actionable recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase with Mockups */}
      <section className="py-16 bg-muted
                          md:py-20
                          lg:py-24">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12
                         md:text-4xl
                         lg:text-5xl lg:mb-16">
            See FlowForge In Action
          </h2>

          {/* Mockup Selector */}
          <div className="flex flex-col gap-3 mb-8
                          sm:flex-row sm:justify-center sm:gap-4
                          md:mb-12">
            <button
              onClick={() => setSelectedMockup('dashboard')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all
                          md:px-8 md:py-4
                          ${selectedMockup === 'dashboard'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                          }`}>
              Campaign Dashboard
            </button>
            <button
              onClick={() => setSelectedMockup('interview')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all
                          md:px-8 md:py-4
                          ${selectedMockup === 'interview'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                          }`}>
              AI Interview
            </button>
            <button
              onClick={() => setSelectedMockup('report')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all
                          md:px-8 md:py-4
                          ${selectedMockup === 'report'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
                          }`}>
              Assessment Report
            </button>
          </div>

          {/* Mockup Display */}
          <div className="max-w-5xl mx-auto">
            {selectedMockup === 'dashboard' && <DashboardMockup />}
            {selectedMockup === 'interview' && <ManufacturingMockup />}
            {selectedMockup === 'report' && <ReportMockup />}
          </div>

          {/* Feature Description */}
          <div className="mt-8 max-w-3xl mx-auto text-center
                          md:mt-12">
            {selectedMockup === 'dashboard' && (
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4
                               md:text-3xl">
                  Centralized Campaign Management
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  Track multiple assessment campaigns, monitor stakeholder participation,
                  and manage interview progress from a unified dashboard.
                </p>
              </div>
            )}
            {selectedMockup === 'interview' && (
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4
                               md:text-3xl">
                  Intelligent Interview Agent
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  AI-powered conversations that adapt to stakeholder responses, probe deeper
                  when needed, and capture rich qualitative insights.
                </p>
              </div>
            )}
            {selectedMockup === 'report' && (
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4
                               md:text-3xl">
                  Comprehensive Assessment Reports
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  Multi-dimensional analysis with visual data representations, scoring across
                  readiness dimensions, and actionable strategic recommendations.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background
                          md:py-20
                          lg:py-24">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12
                         md:text-4xl
                         lg:text-5xl lg:mb-16">
            Why FlowForge?
          </h2>

          <div className="grid grid-cols-1 gap-8
                          md:grid-cols-2
                          lg:gap-12">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                              md:w-12 md:h-12">
                <Clock className="w-5 h-5 text-primary-foreground
                                 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2
                               md:text-2xl">
                  Save 80% of Assessment Time
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  Automate stakeholder interviews while maintaining depth and quality.
                  What used to take weeks now takes days.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                              md:w-12 md:h-12">
                <Shield className="w-5 h-5 text-primary-foreground
                                  md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2
                               md:text-2xl">
                  Eliminate Interview Bias
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  Consistent, structured questioning ensures every stakeholder receives
                  the same rigorous assessment experience.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                              md:w-12 md:h-12">
                <TrendingUp className="w-5 h-5 text-primary-foreground
                                      md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2
                               md:text-2xl">
                  Scale Without Limits
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  Conduct assessments with 10 or 1,000 stakeholders simultaneously.
                  Your capacity is no longer bottlenecked by interviewer availability.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                              md:w-12 md:h-12">
                <Brain className="w-5 h-5 text-primary-foreground
                                 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2
                               md:text-2xl">
                  Data-Driven Insights
                </h3>
                <p className="text-muted-foreground
                              md:text-lg">
                  AI synthesis identifies patterns, themes, and strategic opportunities
                  across hundreds of interview transcripts instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-br from-card via-muted to-card
                          md:py-20
                          lg:py-28">
        <div className="max-w-4xl mx-auto px-6 text-center
                        lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-6
                         md:text-4xl
                         lg:text-5xl lg:mb-8">
            Ready to Transform Your Assessment Process?
          </h2>

          <p className="text-lg text-muted-foreground mb-8
                        md:text-xl
                        lg:text-2xl lg:mb-12">
            Join transformation leaders who are leveraging AI to accelerate strategic insights.
          </p>

          <div className="flex flex-col gap-4 items-center
                          sm:flex-row sm:justify-center
                          md:gap-6">
            <Link
              href="/auth/signup"
              className="w-full px-10 py-5 bg-primary text-primary-foreground font-bold rounded-lg text-lg
                         hover:bg-[hsl(var(--accent-hover))] transition-colors
                         sm:w-auto
                         md:px-12 md:py-6 md:text-xl">
              Start Your Free Assessment
            </Link>

            <Link
              href="/auth/login"
              className="w-full px-10 py-5 border-2 border-border bg-card text-foreground font-bold rounded-lg text-lg
                         hover:bg-muted hover:border-primary transition-colors
                         sm:w-auto
                         md:px-12 md:py-6 md:text-xl">
              Sign In
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground
                        md:text-base">
            No credit card required • Set up in minutes • Enterprise-ready security
          </p>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Check,
  Clock,
  Shield,
  TrendingUp,
  Brain,
  ArrowRight
} from 'lucide-react'
import { useIndustryPreference } from '@/hooks/use-industry-preference'
import { getIndustryContent, IndustryKey } from '@/lib/industry-content'
import IndustrySelector from './industry-selector'
import IndustryHeroMockup from './mockups/industry-hero-index'
import DashboardMockup from './mockups/dashboard-mockup'
import ManufacturingMockup from './mockups/manufacturing-mockup'
import ReportMockup from './mockups/report-mockup'
import HeroBackground from './mockups/hero-background'

export default function PromotionalLanding() {
  const { industry, setIndustry, isLoaded } = useIndustryPreference()
  const [selectedMockup, setSelectedMockup] = useState<'dashboard' | 'interview' | 'report'>('interview')

  // Get industry-specific content
  const content = getIndustryContent(industry)

  // Prevent hydration issues by not rendering industry-specific content until loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Industry Selector Bar - Prominent */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-brand-teal/10 border-b-2 border-primary/20 py-4 px-4
                      sm:py-5">
        <div className="max-w-7xl mx-auto flex justify-center">
          <IndustrySelector
            selected={industry}
            onSelect={setIndustry}
            variant="pills"
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12
                          md:py-16
                          lg:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-brand-teal/10" />
        <HeroBackground />

        <div className="relative max-w-7xl mx-auto px-6
                        lg:px-8">
          <div className="grid grid-cols-1 gap-8 items-center
                          lg:grid-cols-2 lg:gap-12">
            {/* Left: Text Content */}
            <div className="text-center
                            lg:text-left">
              <h1 className="text-3xl font-bold text-foreground mb-4
                             sm:text-4xl
                             md:text-5xl
                             lg:text-6xl">
                {content.heroHeadline.split(content.heroHighlight)[0]}
                <span className="text-primary">
                  {content.heroHighlight}
                </span>
                {content.heroHeadline.split(content.heroHighlight)[1]}
              </h1>

              <p className="text-base text-muted-foreground mb-6 max-w-xl mx-auto
                            md:text-lg
                            lg:text-xl lg:mx-0">
                {content.heroDescription}
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap justify-center gap-6 mb-8
                              lg:justify-start">
                {content.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary
                                    md:text-3xl">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground
                                    md:text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 items-center
                              sm:flex-row sm:justify-center
                              lg:justify-start
                              md:gap-4">
                <Link
                  href="/auth/signup"
                  className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg
                             hover:bg-[hsl(var(--accent-hover))] transition-colors flex items-center justify-center gap-2
                             sm:w-auto
                             md:px-8 md:py-4 md:text-lg">
                  {content.ctaPrimary}
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="#how-it-works"
                  className="w-full px-6 py-3 border-2 border-border bg-card text-foreground font-semibold rounded-lg
                             hover:bg-muted hover:border-primary transition-colors
                             sm:w-auto
                             md:px-8 md:py-4 md:text-lg">
                  {content.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* Right: Industry Illustration + Mockup */}
            <div className="relative">
              {/* Character Illustration - positioned right side, hand pointing at mockup */}
              <div className="absolute -right-44 bottom-24 w-56 h-56 z-10
                              hidden md:block
                              lg:-right-60 lg:bottom-36 lg:w-80 lg:h-80
                              xl:-right-72 xl:bottom-44 xl:w-96 xl:h-96">
                <Image
                  src={content.illustration}
                  alt={`${content.name} professional`}
                  width={384}
                  height={384}
                  className="object-contain drop-shadow-2xl"
                  unoptimized
                />
              </div>
              <div className="rounded-lg overflow-hidden shadow-2xl">
                <IndustryHeroMockup industry={industry} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-12 bg-muted
                          md:py-16
                          lg:py-20">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8
                         md:text-3xl
                         lg:text-4xl lg:mb-12">
            What You Get
          </h2>

          <div className="grid grid-cols-1 gap-6
                          md:grid-cols-3 md:gap-8">
            {content.valueProps.map((prop, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg border border-border text-center
                           hover:border-primary transition-colors
                           md:p-8"
              >
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4
                                md:w-14 md:h-14">
                  <Check className="w-6 h-6 text-primary-foreground
                                   md:w-7 md:h-7" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2
                               md:text-xl">
                  {prop.title}
                </h3>
                <p className="text-muted-foreground text-sm
                              md:text-base">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section className="py-12 bg-background
                          md:py-16
                          lg:py-20">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8
                         md:text-3xl
                         lg:text-4xl lg:mb-12">
            Built For {content.name} Leaders
          </h2>

          <div className="grid grid-cols-1 gap-6
                          md:grid-cols-2 md:gap-8
                          lg:grid-cols-3 lg:gap-10">
            {content.personas.map((persona, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg border border-border
                           hover:border-primary transition-colors
                           md:p-8"
              >
                <h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
                  {persona.title}
                </h3>
                <p className="text-muted-foreground mb-4
                              md:text-lg">
                  {persona.description}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground
                               md:text-base">
                  {persona.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[hsl(var(--success))] flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-12 bg-muted
                          md:py-16
                          lg:py-20">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-3
                         md:text-3xl
                         lg:text-4xl">
            We Understand Your Challenges
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto
                        md:text-lg md:mb-12">
            Traditional assessments are slow, expensive, and often miss what matters most.
          </p>

          <div className="grid grid-cols-1 gap-6
                          md:grid-cols-3 md:gap-8">
            {content.painPoints.map((pain, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg border-l-4 border-primary
                           md:p-8"
              >
                <h3 className="text-lg font-bold text-foreground mb-2
                               md:text-xl">
                  {pain.title}
                </h3>
                <p className="text-muted-foreground text-sm
                              md:text-base">
                  {pain.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 bg-background
                                             md:py-16
                                             lg:py-20">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8
                         md:text-3xl
                         lg:text-4xl lg:mb-12">
            Three Steps to Strategic Clarity
          </h2>

          <div className="grid grid-cols-1 gap-8
                          lg:grid-cols-3 lg:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground
                                md:w-12 md:h-12 md:text-lg">
                  1
                </div>
                <div className="flex-1 h-1 bg-primary/50 ml-4
                                lg:hidden" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3
                             md:text-2xl">
                Create Campaign
              </h3>
              <p className="text-muted-foreground mb-3
                            md:text-lg">
                Define your assessment scope and invite stakeholders via secure, personalized links.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground
                             md:text-base">
                <li>• Multi-stakeholder coordination</li>
                <li>• Flexible methodology selection</li>
                <li>• Progress tracking dashboard</li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground
                                md:w-12 md:h-12 md:text-lg">
                  2
                </div>
                <div className="flex-1 h-1 bg-primary/50 ml-4
                                lg:hidden" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3
                             md:text-2xl">
                AI-Facilitated Interviews
              </h3>
              <p className="text-muted-foreground mb-3
                            md:text-lg">
                Stakeholders engage in intelligent conversations that adapt based on their responses.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground
                             md:text-base">
                <li>• Context-aware questioning</li>
                <li>• Natural conversation flow</li>
                <li>• Anonymous response options</li>
              </ul>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold
                                md:w-12 md:h-12 md:text-lg">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3
                             md:text-2xl">
                Strategic Synthesis
              </h3>
              <p className="text-muted-foreground mb-3
                            md:text-lg">
                AI analyzes all interviews and generates comprehensive readiness assessments.
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground
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
      <section className="py-12 bg-muted
                          md:py-16
                          lg:py-20">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8
                         md:text-3xl
                         lg:text-4xl lg:mb-12">
            See FlowForge In Action
          </h2>

          {/* Mockup Selector */}
          <div className="flex flex-col gap-3 mb-8
                          sm:flex-row sm:justify-center sm:gap-4
                          md:mb-10">
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
          <div className="mt-6 max-w-3xl mx-auto text-center
                          md:mt-10">
            {selectedMockup === 'dashboard' && (
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
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
                <h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
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
                <h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
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
      <section className="py-12 bg-background
                          md:py-16
                          lg:py-20">
        <div className="max-w-7xl mx-auto px-6
                        lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8
                         md:text-3xl
                         lg:text-4xl lg:mb-12">
            Why FlowForge?
          </h2>

          <div className="grid grid-cols-1 gap-6
                          md:grid-cols-2
                          lg:gap-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                              md:w-12 md:h-12">
                <Clock className="w-5 h-5 text-primary-foreground
                                 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2
                               md:text-xl">
                  Save 80% of Assessment Time
                </h3>
                <p className="text-muted-foreground text-sm
                              md:text-base">
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
                <h3 className="text-lg font-bold text-foreground mb-2
                               md:text-xl">
                  Eliminate Interview Bias
                </h3>
                <p className="text-muted-foreground text-sm
                              md:text-base">
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
                <h3 className="text-lg font-bold text-foreground mb-2
                               md:text-xl">
                  Scale Without Limits
                </h3>
                <p className="text-muted-foreground text-sm
                              md:text-base">
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
                <h3 className="text-lg font-bold text-foreground mb-2
                               md:text-xl">
                  Data-Driven Insights
                </h3>
                <p className="text-muted-foreground text-sm
                              md:text-base">
                  AI synthesis identifies patterns, themes, and strategic opportunities
                  across hundreds of interview transcripts instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 bg-gradient-to-br from-card via-muted to-card
                          md:py-16
                          lg:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center
                        lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-4
                         md:text-3xl
                         lg:text-4xl lg:mb-6">
            Ready to Transform Your Assessment Process?
          </h2>

          <p className="text-base text-muted-foreground mb-6
                        md:text-lg
                        lg:text-xl lg:mb-10">
            Join {content.name.toLowerCase()} leaders who are leveraging AI to accelerate strategic insights.
          </p>

          <div className="flex flex-col gap-4 items-center
                          sm:flex-row sm:justify-center
                          md:gap-6">
            <Link
              href="/auth/signup"
              className="w-full px-8 py-4 bg-primary text-primary-foreground font-bold rounded-lg text-lg
                         hover:bg-[hsl(var(--accent-hover))] transition-colors flex items-center justify-center gap-2
                         sm:w-auto
                         md:px-10 md:py-5 md:text-xl">
              {content.ctaPrimary}
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/auth/login"
              className="w-full px-8 py-4 border-2 border-border bg-card text-foreground font-bold rounded-lg text-lg
                         hover:bg-muted hover:border-primary transition-colors
                         sm:w-auto
                         md:px-10 md:py-5 md:text-xl">
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

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
import { useLandingAnalytics } from '@/hooks/use-landing-analytics'
import { getIndustryContent, IndustryKey } from '@/lib/industry-content'
import IndustrySelector from './industry-selector'
import IndustryHeroMockup from './mockups/industry-hero-index'
import DashboardMockup from './mockups/dashboard-mockup-index'
import InterviewMockup from './mockups/interview-mockup-index'
import ReportMockup from './mockups/report-mockup-index'
import HeroBackground from './mockups/hero-background'
import ContactForm from './contact-form'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from '@/components/ui/dialog'

// Per-industry illustration container sizing (images have different aspect ratios)
const illustrationConfig: Record<IndustryKey, { container: string; width: number; height: number }> = {
	'professional-services': {
		// consultant.png: 291x695 (portrait ~1:2.4)
		container: '-right-20 bottom-0 w-36 h-[20rem] lg:-right-28 lg:w-44 lg:h-[24rem] xl:-right-32 xl:w-48 xl:h-[28rem]',
		width: 291,
		height: 695,
	},
	education: {
		// educator.png: 1024x1024 (square — character ~50% width, ~85% height of canvas)
		// Needs larger container to match perceived size of portrait illustrations
		container: '-right-64 bottom-0 w-96 h-96 lg:-right-80 lg:w-[28rem] lg:h-[28rem] xl:-right-96 xl:w-[33rem] xl:h-[33rem]',
		width: 1024,
		height: 1024,
	},
	coaching: {
		// coach.png: 296x886 (portrait ~1:3)
		container: '-right-16 bottom-0 w-32 h-[20rem] lg:-right-24 lg:w-40 lg:h-[24rem] xl:-right-28 xl:w-44 xl:h-[28rem]',
		width: 296,
		height: 886,
	},
}

export default function PromotionalLanding() {
	const { industry, setIndustry, isLoaded } = useIndustryPreference()
	const [selectedMockup, setSelectedMockup] = useState<'dashboard' | 'interview' | 'report'>('interview')
	const [contactModalOpen, setContactModalOpen] = useState(false)

	// Analytics tracking for CRM dashboard
	useLandingAnalytics({
		pageSlug: 'home',
		pageTitle: 'FlowForge - AI-Powered Strategic Assessment Platform',
	})

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
			{/* Contact Form Modal */}
			<Dialog open={contactModalOpen} onOpenChange={setContactModalOpen}>
				<DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-xl
                                  bg-background border-border">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold md:text-2xl">
							{content.contactForm.dialogTitle}
						</DialogTitle>
						<DialogDescription className="text-muted-foreground">
							{content.contactForm.dialogDescription}
						</DialogDescription>
					</DialogHeader>
					<ContactForm
						submitLabel={content.ctaPrimary}
						compact
						interest={content.contactForm.interest}
						organizationLabel={content.contactForm.organizationLabel}
						organizationPlaceholder={content.contactForm.organizationPlaceholder}
						roleLabel={content.contactForm.roleLabel}
						rolePlaceholder={content.contactForm.rolePlaceholder}
						notesPlaceholder={content.contactForm.notesPlaceholder}
						source={content.contactForm.source}
						onSuccess={() => {
							// Keep modal open to show success state
						}}
					/>
				</DialogContent>
			</Dialog>

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

							<div className="text-base text-muted-foreground mb-6 max-w-xl mx-auto
                            md:text-lg
                            lg:text-xl lg:mx-0">
								{Array.isArray(content.heroDescription)
									? content.heroDescription.map((paragraph, i) => (
										<p key={i} className={i < content.heroDescription.length - 1 ? 'mb-3' : ''}>
											{paragraph}
										</p>
									))
									: <p>{content.heroDescription}</p>
								}
							</div>

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
								<button
									onClick={() => setContactModalOpen(true)}
									className="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg
                             hover:bg-[hsl(var(--accent-hover))] transition-colors flex items-center justify-center gap-2
                             sm:w-auto
                             md:px-8 md:py-4 md:text-lg">
									{content.ctaPrimary}
									<ArrowRight className="w-4 h-4" />
								</button>

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
							{/* Character Illustration - positioned right side, aligned with mockup */}
							<div className={`absolute z-10 hidden md:block ${illustrationConfig[industry].container}`}>
								<Image
									src={content.illustration}
									alt={`${content.name} professional`}
									width={illustrationConfig[industry].width}
									height={illustrationConfig[industry].height}
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
						Who FlowForge is Built For?
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
						Traditional oversight relies on episodic data, filtered feedback and annual hindsight.
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
						{content.stepsHeading}
					</h2>

					<div className="grid grid-cols-1 gap-8
                          lg:grid-cols-3 lg:gap-8">
						{content.steps.map((step, index) => (
							<div key={index} className="relative">
								<div className="flex items-center mb-4">
									<div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground
                                    md:w-12 md:h-12 md:text-lg">
										{index + 1}
									</div>
									{index < content.steps.length - 1 && (
										<div className="flex-1 h-1 bg-primary/50 ml-4
                                        lg:hidden" />
									)}
								</div>
								<h3 className="text-xl font-bold text-foreground mb-3
                                 md:text-2xl">
									{step.title}
								</h3>
								<p className="text-muted-foreground mb-3
                                md:text-lg">
									{step.description}
								</p>
								<ul className="space-y-1 text-sm text-muted-foreground
                                 md:text-base">
									{step.bullets.map((bullet, bi) => (
										<li key={bi}>• {bullet}</li>
									))}
								</ul>
							</div>
						))}
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
							Dashboard
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
						{selectedMockup === 'dashboard' && <DashboardMockup industry={industry} />}
						{selectedMockup === 'interview' && <InterviewMockup industry={industry} />}
						{selectedMockup === 'report' && <ReportMockup industry={industry} />}
					</div>

					{/* Feature Description */}
					<div className="mt-6 max-w-3xl mx-auto text-center
                          md:mt-10">
						{selectedMockup === 'dashboard' && (
							<div>
								<h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
									{industry === 'coaching'
										? 'Practice Health at a Glance'
										: industry === 'education'
											? 'School Health at a Glance'
											: 'Practice Health at a Glance'}
								</h3>
								<p className="text-muted-foreground
                              md:text-lg">
									{industry === 'coaching'
										? 'See client progress, archetype distributions, growth edge trends, and satisfaction scores — your entire coaching practice in one view.'
										: industry === 'education'
											? 'Parent satisfaction scores, faculty alignment, student retention risks, and department health — your institution\'s vital signs at a glance.'
											: 'Client readiness scores, stakeholder alignment, risk signals, and key findings across all engagements — your consulting practice in one view.'}
								</p>
							</div>
						)}
						{selectedMockup === 'interview' && (
							<div>
								<h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
									{industry === 'coaching'
										? 'AI-Guided Discovery Session'
										: industry === 'education'
											? 'Adaptive Feedback Conversations'
											: 'Intelligent Interview Agent'}
								</h3>
								<p className="text-muted-foreground
                              md:text-lg">
									{industry === 'coaching'
										? 'AI-facilitated sessions that explore leadership patterns, surface archetypes, and capture deep developmental insights.'
										: industry === 'education'
											? 'AI-powered conversations that adapt to parent and faculty responses, uncovering actionable insights for institutional improvement.'
											: 'AI-powered conversations that adapt to stakeholder responses, probe deeper when needed, and capture rich qualitative insights.'}
								</p>
							</div>
						)}
						{selectedMockup === 'report' && (
							<div>
								<h3 className="text-xl font-bold text-foreground mb-3
                               md:text-2xl">
									{industry === 'coaching'
										? 'Leadership Profile Reports'
										: industry === 'education'
											? 'Institutional Insights Reports'
											: 'Strategic Assessment Reports'}
								</h3>
								<p className="text-muted-foreground
                              md:text-lg">
									{industry === 'coaching'
										? 'Archetype discovery profiles with dimension scores, growth edges, tension patterns, and personalized development pathways.'
										: industry === 'education'
											? 'Satisfaction analysis across key dimensions with parent highlights, faculty recommendations, and data-driven improvement priorities.'
											: 'Multi-dimensional readiness analysis with visual data representations, scoring across strategic dimensions, and actionable recommendations.'}
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
						{content.benefits.map((benefit, index) => {
							const IconComponent = benefit.icon === 'clock' ? Clock
								: benefit.icon === 'shield' ? Shield
								: benefit.icon === 'trending-up' ? TrendingUp
								: Brain
							return (
								<div key={index} className="flex gap-4">
									<div className="flex-shrink-0 w-10 h-10 bg-primary rounded-lg flex items-center justify-center
                                      md:w-12 md:h-12">
										<IconComponent className="w-5 h-5 text-primary-foreground
                                                        md:w-6 md:h-6" />
									</div>
									<div>
										<h3 className="text-lg font-bold text-foreground mb-2
                                           md:text-xl">
											{benefit.title}
										</h3>
										<p className="text-muted-foreground text-sm
                                          md:text-base">
											{benefit.description}
										</p>
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</section>

			{/* Contact / Let's Talk Section (inline form) */}
			<section id="contact" className="py-12 bg-gradient-to-br from-card via-muted to-card
                                        md:py-16
                                        lg:py-24">
				<div className="max-w-3xl mx-auto px-6
                        lg:px-8">
					<div className="text-center mb-8 md:mb-10">
						<h2 className="text-2xl font-bold text-foreground mb-4
                           md:text-3xl
                           lg:text-4xl">
							{content.contactForm.dialogTitle}
						</h2>
						<p className="text-base text-muted-foreground max-w-xl mx-auto
                          md:text-lg">
							{content.contactForm.dialogDescription}
						</p>
					</div>

					<div className="bg-card border border-border rounded-xl p-6 shadow-lg
                          md:p-10">
						<ContactForm
							submitLabel={content.ctaPrimary}
							interest={content.contactForm.interest}
							organizationLabel={content.contactForm.organizationLabel}
							organizationPlaceholder={content.contactForm.organizationPlaceholder}
							roleLabel={content.contactForm.roleLabel}
							rolePlaceholder={content.contactForm.rolePlaceholder}
							notesPlaceholder={content.contactForm.notesPlaceholder}
							source={content.contactForm.source}
						/>
					</div>

				</div>
			</section>
		</div>
	)
}

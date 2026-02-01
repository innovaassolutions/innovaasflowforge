/**
 * Relief Moves Data
 *
 * Contains all relief move sets for misaligned archetype pairings
 * and protection strategies for aligned pairings.
 *
 * Source: Mark Nickerson's Leadership Archetypes methodology
 * Reference: docs/leadingwithmeaning/Leadership_Archetypes.md
 */

import type { Archetype } from '@/lib/agents/archetype-constitution'

export interface ReliefMoveSet {
  title: string
  reliefAim: string
  narrative: string
  moves: string[]
  framing: string
}

export interface AlignedProtectionSet {
  underPressure: string[]
  whenAligned: string[]
  reframe: string
}

export const MISALIGNMENT_RELIEF_MOVES: Record<string, ReliefMoveSet> = {
  // =========================================================================
  // DEFAULT: ANCHOR
  // =========================================================================
  anchor_catalyst: {
    title: 'From holding things together → moving things forward',
    reliefAim: 'Shift from absorbing tension to creating visible progress without becoming reckless or reactive.',
    narrative: 'The relief here comes from reclaiming your right to decide and move. When you allow yourself to generate momentum, calm stops being something you personally manufacture and starts becoming a byproduct of clarity and direction.',
    moves: [
      'Choose one decision per week that you will make quickly and visibly, without consensus.',
      'Replace "Let\'s keep things steady" language with "Here\'s the call and why."',
      'Block a weekly 30 minute "decision window" where progress is the only goal.',
    ],
    framing: 'You are not being reckless. You are reclaiming movement.',
  },
  anchor_steward: {
    title: 'From stability → connection',
    reliefAim: 'Allow calm leadership to include humanity, not just composure.',
    narrative: 'Relief comes from letting yourself be emotionally present without feeling responsible for managing everyone else\'s experience. When connection is allowed back in, steadiness stops feeling isolating and starts feeling shared.',
    moves: [
      'Schedule one intentional check-in that is not about status or performance.',
      'Say one thing out loud that you normally hold internally to keep things smooth.',
      'Ask "How is this actually landing for you?" once per week.',
    ],
    framing: 'Being steady does not mean being distant.',
  },
  anchor_wayfinder: {
    title: 'From emotional regulation → direction setting',
    reliefAim: 'Shift from holding emotional space to actively orienting people toward what matters.',
    narrative: 'Relief comes when clarity becomes your primary contribution. When you name direction, calm follows without you having to personally carry it.',
    moves: [
      'Open meetings with "Here\'s what matters most this week."',
      'Capture decisions instead of feelings in notes.',
      'Reduce reassurance language and increase clarity language.',
    ],
    framing: 'Clarity is a form of calm.',
  },
  anchor_architect: {
    title: 'From patching → designing',
    reliefAim: 'Trade short-term stabilization for long-term structural relief.',
    narrative: 'Relief comes when you stop being the glue and start being the designer. When systems begin to carry the load, your calm no longer depends on constant vigilance.',
    moves: [
      'Identify one recurring issue you will stop smoothing over.',
      'Document one simple rule or process instead of fixing case by case.',
      'Let a small failure happen in service of a better system.',
    ],
    framing: 'You are allowed to stop being the glue.',
  },

  // =========================================================================
  // DEFAULT: CATALYST
  // =========================================================================
  catalyst_anchor: {
    title: 'From speed → steadiness',
    reliefAim: 'Slow the pace without losing authority or effectiveness.',
    narrative: 'Relief comes when steadiness replaces urgency as your stabilizing force. When you allow yourself to move deliberately, decisions land more cleanly and momentum becomes something you guide, not something that carries you.',
    moves: [
      'Add a deliberate pause before decisions that are not urgent.',
      'Name one thing that does not need to move this week.',
      'Shorten your task list by cutting urgency, not importance.',
    ],
    framing: 'Not everything needs momentum to move forward.',
  },
  catalyst_steward: {
    title: 'From results → relationships',
    reliefAim: 'Let connection matter as much as progress without sacrificing momentum.',
    narrative: 'Relief comes when you allow space for relationship without interpreting it as a slowdown. When people feel seen and included, results stop feeling like something you have to drag forward alone.',
    moves: [
      'Ask for input before deciding once per week.',
      'Reflect impact, not just outcomes.',
      'Slow one conversation to understand how the work is landing.',
    ],
    framing: 'Results land better when people are with you.',
  },
  catalyst_wayfinder: {
    title: 'From action → intention',
    reliefAim: 'Replace urgency with intention without losing decisiveness.',
    narrative: 'Relief comes when you give yourself permission to pause long enough to choose well. When action is guided by clarity, movement becomes energizing instead of draining.',
    moves: [
      'Define a single weekly priority before acting.',
      'Stop solving and ask "What problem are we actually solving?"',
      'Protect one block of uninterrupted thinking time.',
    ],
    framing: 'Speed without direction is still exhausting.',
  },
  catalyst_architect: {
    title: 'From heroics → systems',
    reliefAim: 'Stop compensating for broken systems and start building ones that carry the load.',
    narrative: 'Relief comes when progress no longer depends on your personal effort. When systems begin to support the work, momentum becomes sustainable instead of exhausting.',
    moves: [
      'Refuse to solve the same problem twice without documenting it.',
      'Delegate system fixes instead of doing them yourself.',
      'Replace urgency with repeatability.',
    ],
    framing: 'Your effort should not be the system.',
  },

  // =========================================================================
  // DEFAULT: STEWARD
  // =========================================================================
  steward_anchor: {
    title: 'From caretaking → steady authority',
    reliefAim: 'Release emotional over responsibility while maintaining compassion.',
    narrative: 'Relief comes when you allow others to regulate themselves. When you lead with steadiness instead of absorption, support becomes sustainable and your presence feels calmer rather than depleted.',
    moves: [
      'Stop rescuing discomfort that is not harmful.',
      'State expectations without cushioning them.',
      'Let others regulate themselves.',
    ],
    framing: 'Support does not require self-sacrifice.',
  },
  steward_catalyst: {
    title: 'From harmony → movement',
    reliefAim: 'Allow forward motion to create trust instead of threatening it.',
    narrative: 'Relief comes when you recognize that momentum can be caring. Clear decisions reduce anxiety, and progress often does more to support people than prolonged reassurance.',
    moves: [
      'Initiate one uncomfortable but necessary decision.',
      'Name what is not working instead of smoothing it.',
      'Replace "Are we okay?" with "Here\'s what we\'re doing."',
    ],
    framing: 'Momentum can be caring.',
  },
  steward_wayfinder: {
    title: 'From listening → orienting',
    reliefAim: 'Turn empathy into clarity without losing care.',
    narrative: 'Relief comes when listening leads to direction. When you summarize patterns and name next steps, understanding becomes useful rather than overwhelming.',
    moves: [
      'Summarize patterns instead of individual concerns.',
      'Close conversations with direction, not validation alone.',
      'Ask "What do we do with this?"',
    ],
    framing: 'Understanding is only half the work.',
  },
  steward_architect: {
    title: 'From helping → fixing the root',
    reliefAim: 'Build structures that reduce emotional and relational load.',
    narrative: 'Relief comes when systems begin to do the supporting. When structure replaces constant caretaking, your care becomes a choice rather than a burden.',
    moves: [
      'Identify where support is compensating for bad design.',
      'Create one process that removes a common pain point.',
      'Stop filling gaps that should not exist.',
    ],
    framing: 'You are allowed to fix the system, not the people.',
  },

  // =========================================================================
  // DEFAULT: WAYFINDER
  // =========================================================================
  wayfinder_anchor: {
    title: 'From thinking → grounding',
    reliefAim: 'Reduce mental strain by replacing constant analysis with grounded presence.',
    narrative: 'Relief comes when steadiness no longer depends on having every variable mapped. When you allow yourself to be present instead of predictive, clarity quiets rather than accelerates your mind.',
    moves: [
      'Decide before you fully understand.',
      'Close loops intentionally.',
      'Shift from analysis to embodiment.',
    ],
    framing: 'You do not need to see everything to be steady.',
  },
  wayfinder_catalyst: {
    title: 'From planning → acting',
    reliefAim: 'Turn sufficient clarity into action without waiting for certainty.',
    narrative: 'Relief comes when movement is allowed to refine thinking instead of the other way around. When action becomes part of how you learn, leadership feels lighter and more alive.',
    moves: [
      'Set a decision deadline.',
      'Act on 70 percent clarity.',
      'Let action refine thinking.',
    ],
    framing: 'Movement creates clarity too.',
  },
  wayfinder_steward: {
    title: 'From abstraction → connection',
    reliefAim: 'Reconnect strategy to human presence.',
    narrative: 'Relief comes when insight is paired with connection. When you allow yourself to be relational as well as reflective, leadership feels more human and less solitary.',
    moves: [
      'Have one conversation without agenda.',
      'Check how decisions affect trust, not just outcomes.',
      'Speak less conceptually.',
    ],
    framing: 'Leadership lives in relationship, not just insight.',
  },
  wayfinder_architect: {
    title: 'From vision → structure',
    reliefAim: 'Make direction tangible through simple structure.',
    narrative: 'Relief comes when ideas turn into scaffolding. When even small structures begin to support the vision, clarity starts to feel useful instead of heavy.',
    moves: [
      'Translate ideas into simple rules.',
      'Build one structure that supports the strategy.',
      'Stop revising the vision and start building.',
    ],
    framing: 'Clarity needs scaffolding.',
  },

  // =========================================================================
  // DEFAULT: ARCHITECT
  // =========================================================================
  architect_anchor: {
    title: 'From fixing → allowing calm',
    reliefAim: 'Allow calm to exist without redesigning everything.',
    narrative: 'Relief comes when steadiness is no longer dependent on fixing. When you let go of constant improvement, your energy returns and your leadership feels less tense and more grounded.',
    moves: [
      'Let something be imperfect.',
      'Reduce change velocity.',
      'Name what is already working.',
    ],
    framing: 'Not everything needs redesign.',
  },
  architect_catalyst: {
    title: 'From perfection → progress',
    reliefAim: 'Prioritize progress over optimization.',
    narrative: 'Relief comes when movement is allowed before perfection. When systems evolve through use instead of endless refinement, your work starts to feel alive instead of stalled.',
    moves: [
      'Ship the minimum viable version.',
      'Time-box design.',
      'Let usage refine structure.',
    ],
    framing: 'Progress beats polish.',
  },
  architect_steward: {
    title: 'From structure → trust',
    reliefAim: 'Rebalance systems with humanity.',
    narrative: 'Relief comes when trust is treated as part of the design. When people feel considered, systems land more effectively and leadership feels more relational and less mechanical.',
    moves: [
      'Ask how the system feels to people.',
      'Adjust process to support morale.',
      'Lead with empathy before logic.',
    ],
    framing: 'Systems serve people, not the other way around.',
  },
  architect_wayfinder: {
    title: 'From building → orienting',
    reliefAim: 'Reconnect building effort to clear direction.',
    narrative: 'Relief comes when structure serves strategy. When you pause to orient before improving, your work feels purposeful instead of endless.',
    moves: [
      'Pause construction to clarify direction.',
      'Ask "What problem matters most?"',
      'Stop improving what does not align.',
    ],
    framing: 'Structure without direction is just busy.',
  },
}

export const ALIGNED_PROTECTION: Record<string, AlignedProtectionSet> = {
  anchor_anchor: {
    underPressure: [
      'Absorbs noise instead of sorting it',
      'Holds attention too long to keep things stable',
      'Hesitates to delegate because it feels destabilizing',
    ],
    whenAligned: [
      'Filters emotional noise quickly',
      'Delegates clearly to preserve steadiness',
      'Uses attention to anchor what truly matters',
    ],
    reframe: 'Calm does not come from holding everything. It comes from deciding what does not need holding.',
  },
  catalyst_catalyst: {
    underPressure: [
      'Treats everything as urgent',
      'Keeps attention moving instead of contained',
      'Delegates late or not at all to maintain momentum',
    ],
    whenAligned: [
      'Channels attention toward the few things that matter',
      'Delegates execution early so speed does not depend on them',
      'Uses decisions to create focus, not just motion',
    ],
    reframe: 'Momentum feels better when it is shared.',
  },
  steward_steward: {
    underPressure: [
      'Gives attention to people before priorities',
      'Avoids delegation to protect relationships',
      'Lets emotional needs dictate focus',
    ],
    whenAligned: [
      'Chooses attention intentionally',
      'Delegates with care and clarity',
      'Separates support from ownership',
    ],
    reframe: 'Being caring does not require carrying everything.',
  },
  wayfinder_wayfinder: {
    underPressure: [
      'Keeps attention in thinking mode',
      'Holds work instead of delegating because clarity feels incomplete',
      'Over-indexes on understanding before action',
    ],
    whenAligned: [
      'Protects thinking time by delegating execution',
      'Uses attention to orient, then releases control',
      'Lets action refine clarity',
    ],
    reframe: 'You do not lose insight by letting others move.',
  },
  architect_architect: {
    underPressure: [
      'Fixates attention on broken systems',
      'Holds work to redesign it properly',
      'Avoids delegation until the system feels right',
    ],
    whenAligned: [
      'Delegates within imperfect systems',
      'Uses attention to decide what is worth fixing now',
      'Builds while others run',
    ],
    reframe: 'You can design and delegate at the same time.',
  },
}

/**
 * Get relief move set for a given archetype pairing.
 * Returns the appropriate set or undefined if not found.
 */
export function getReliefMoves(defaultArchetype: Archetype, authenticArchetype: Archetype): ReliefMoveSet | undefined {
  const key = `${defaultArchetype}_${authenticArchetype}`
  return MISALIGNMENT_RELIEF_MOVES[key]
}

/**
 * Get aligned protection set for a given archetype (when default === authentic).
 * Returns the appropriate set or undefined if not found.
 */
export function getAlignedProtection(archetype: Archetype): AlignedProtectionSet | undefined {
  const key = `${archetype}_${archetype}`
  return ALIGNED_PROTECTION[key]
}

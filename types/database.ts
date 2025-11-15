/**
 * Database Types for InnovaasFlow Forge
 * Auto-generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =====================================================
// CAMPAIGNS
// =====================================================

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'archived'
export type CampaignType = 'industry_4.0' | 'digital_transformation' | 'process_optimization' | 'custom'

export interface Campaign {
  id: string
  name: string
  description: string | null
  campaign_type: CampaignType
  status: CampaignStatus

  // Campaign configuration
  facilitator_name: string
  facilitator_email: string
  company_name: string | null
  company_industry: string | null

  // Knowledge base configuration
  knowledge_base_ids: string[] | null

  // Timestamps
  created_at: string
  updated_at: string
  started_at: string | null
  completed_at: string | null

  // Metadata
  metadata: Json
}

export interface CampaignInsert extends Omit<Campaign, 'id' | 'created_at' | 'updated_at'> {}
export interface CampaignUpdate extends Partial<CampaignInsert> {}

// =====================================================
// STAKEHOLDER SESSIONS
// =====================================================

export type StakeholderRole =
  | 'managing_director'
  | 'it_operations'
  | 'production'
  | 'purchasing'
  | 'planning'
  | 'engineering'

export type SessionStatus = 'invited' | 'in_progress' | 'completed' | 'abandoned'

export interface StakeholderSession {
  id: string
  campaign_id: string

  // Stakeholder information
  stakeholder_name: string
  stakeholder_email: string
  stakeholder_role: StakeholderRole
  stakeholder_title: string | null

  // Session state
  status: SessionStatus
  progress_percentage: number
  current_question_index: number

  // Access control
  access_token: string | null
  access_expires_at: string | null

  // Session tracking
  started_at: string | null
  completed_at: string | null
  last_activity_at: string | null

  // Document uploads
  has_uploaded_documents: boolean

  // Timestamps
  created_at: string
  updated_at: string

  // Metadata
  metadata: Json
}

export interface StakeholderSessionInsert extends Omit<StakeholderSession, 'id' | 'created_at' | 'updated_at'> {}
export interface StakeholderSessionUpdate extends Partial<StakeholderSessionInsert> {}

// =====================================================
// AGENT SESSIONS
// =====================================================

export type AgentType = 'interview_agent' | 'document_analyst' | 'synthesis_agent'

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Json
}

export interface AgentSession {
  id: string
  stakeholder_session_id: string

  // Agent configuration
  agent_type: AgentType
  agent_model: string

  // Conversation state
  conversation_history: ConversationMessage[]
  system_prompt: string | null

  // Session context
  session_context: Json

  // Timestamps
  created_at: string
  updated_at: string
  last_message_at: string | null

  // Metadata
  metadata: Json
}

export interface AgentSessionInsert extends Omit<AgentSession, 'id' | 'created_at' | 'updated_at'> {}
export interface AgentSessionUpdate extends Partial<AgentSessionInsert> {}

// =====================================================
// SESSION DOCUMENTS
// =====================================================

export type DocumentType = 'sop' | 'diagram' | 'specification' | 'report' | 'other'
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface AgentQuestion {
  question: string
  timestamp: string
  answered: boolean
  answer?: string
}

export interface AgentInsight {
  insight: string
  timestamp: string
  category: 'observation' | 'concern' | 'recommendation'
}

export interface SessionDocument {
  id: string
  stakeholder_session_id: string

  // Document information
  document_name: string
  document_type: DocumentType
  file_size: number
  mime_type: string

  // Storage
  storage_path: string
  storage_bucket: string

  // Processing state
  processing_status: ProcessingStatus
  is_analyzed: boolean

  // Analysis metadata
  page_count: number | null
  extracted_text: string | null

  // Agent interaction
  agent_questions: AgentQuestion[]
  agent_insights: AgentInsight[]

  // Timestamps
  created_at: string
  updated_at: string
  analyzed_at: string | null

  // Metadata
  metadata: Json
}

export interface SessionDocumentInsert extends Omit<SessionDocument, 'id' | 'created_at' | 'updated_at'> {}
export interface SessionDocumentUpdate extends Partial<SessionDocumentInsert> {}

// =====================================================
// DOCUMENT CHUNKS
// =====================================================

export interface DocumentChunk {
  id: string
  session_document_id: string

  // Chunk information
  chunk_index: number
  chunk_text: string
  chunk_metadata: Json

  // Vector embedding
  embedding: number[] | null

  // Timestamps
  created_at: string
}

export interface DocumentChunkInsert extends Omit<DocumentChunk, 'id' | 'created_at'> {}

// =====================================================
// SYNTHESIS
// =====================================================

export type SynthesisType = 'cross_stakeholder' | 'contradiction_analysis' | 'roadmap_generation'

export interface Theme {
  title: string
  description: string
  mentioned_by: string[] // stakeholder_session_ids
  frequency: number
}

export interface Contradiction {
  topic: string
  perspectives: {
    stakeholder_id: string
    stakeholder_name: string
    stakeholder_role: StakeholderRole
    statement: string
  }[]
  significance: 'low' | 'medium' | 'high' | 'critical'
}

export interface Gap {
  area: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

export interface Recommendation {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  timeframe: 'immediate' | 'short_term' | 'medium_term' | 'long_term'
  dependencies: string[]
}

export interface RoadmapItem {
  phase: number
  title: string
  description: string
  duration: string
  deliverables: string[]
  dependencies: string[]
  stakeholders: StakeholderRole[]
}

export interface Synthesis {
  id: string
  campaign_id: string

  // Synthesis type
  synthesis_type: SynthesisType

  // Analysis content
  title: string
  summary: string | null
  detailed_analysis: Json

  // Identified patterns
  themes: Theme[]
  contradictions: Contradiction[]
  gaps: Gap[]

  // Strategic outputs
  recommendations: Recommendation[]
  roadmap: RoadmapItem[]

  // Source tracking
  source_session_ids: string[] | null

  // Timestamps
  created_at: string
  updated_at: string

  // Metadata
  metadata: Json
}

export interface SynthesisInsert extends Omit<Synthesis, 'id' | 'created_at' | 'updated_at'> {}
export interface SynthesisUpdate extends Partial<SynthesisInsert> {}

// =====================================================
// KNOWLEDGE BASE
// =====================================================

export type KnowledgeDomain =
  | 'uns'
  | 'industry_4.0'
  | 'iiot'
  | 'isa95'
  | 'sparkplug_b'
  | 'mqtt'
  | 'opc_ua'
  | 'digital_twin'

export type KnowledgeCategory = 'concept' | 'framework' | 'standard' | 'best_practice'
export type SourceType = 'documentation' | 'whitepaper' | 'standard' | 'article' | 'book'

export interface Knowledge {
  id: string

  // Knowledge classification
  domain: KnowledgeDomain
  category: KnowledgeCategory

  // Content
  title: string
  description: string | null
  full_content: string

  // Source tracking
  source_url: string | null
  source_type: SourceType | null
  author: string | null
  publication_date: string | null

  // Searchability
  tags: string[] | null
  is_public: boolean

  // Timestamps
  created_at: string
  updated_at: string

  // Metadata
  metadata: Json
}

export interface KnowledgeInsert extends Omit<Knowledge, 'id' | 'created_at' | 'updated_at'> {}
export interface KnowledgeUpdate extends Partial<KnowledgeInsert> {}

// =====================================================
// KNOWLEDGE CHUNKS
// =====================================================

export interface KnowledgeChunk {
  id: string
  knowledge_id: string

  // Chunk information
  chunk_index: number
  chunk_text: string
  chunk_metadata: Json

  // Vector embedding
  embedding: number[] | null

  // Timestamps
  created_at: string
}

export interface KnowledgeChunkInsert extends Omit<KnowledgeChunk, 'id' | 'created_at'> {}

// =====================================================
// VECTOR SEARCH RESULTS
// =====================================================

export interface SessionDocumentSearchResult {
  chunk_id: string
  document_id: string
  document_name: string
  chunk_text: string
  similarity: number
}

export interface KnowledgeSearchResult {
  chunk_id: string
  knowledge_id: string
  title: string
  domain: KnowledgeDomain
  chunk_text: string
  similarity: number
}

// =====================================================
// DATABASE SCHEMA
// =====================================================

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: Campaign
        Insert: CampaignInsert
        Update: CampaignUpdate
      }
      stakeholder_sessions: {
        Row: StakeholderSession
        Insert: StakeholderSessionInsert
        Update: StakeholderSessionUpdate
      }
      agent_sessions: {
        Row: AgentSession
        Insert: AgentSessionInsert
        Update: AgentSessionUpdate
      }
      session_documents: {
        Row: SessionDocument
        Insert: SessionDocumentInsert
        Update: SessionDocumentUpdate
      }
      document_chunks: {
        Row: DocumentChunk
        Insert: DocumentChunkInsert
      }
      synthesis: {
        Row: Synthesis
        Insert: SynthesisInsert
        Update: SynthesisUpdate
      }
      knowledge: {
        Row: Knowledge
        Insert: KnowledgeInsert
        Update: KnowledgeUpdate
      }
      knowledge_chunks: {
        Row: KnowledgeChunk
        Insert: KnowledgeChunkInsert
      }
    }
    Functions: {
      search_session_documents: {
        Args: {
          query_embedding: number[]
          session_id: string
          match_threshold?: number
          match_count?: number
        }
        Returns: SessionDocumentSearchResult[]
      }
      search_knowledge: {
        Args: {
          query_embedding: number[]
          domain_filter?: KnowledgeDomain | null
          match_threshold?: number
          match_count?: number
        }
        Returns: KnowledgeSearchResult[]
      }
    }
  }
}

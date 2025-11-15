-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- CAMPAIGNS TABLE
-- Manages assessment campaigns (e.g., Alimex Industry 4.0 Assessment)
-- =====================================================
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL, -- 'industry_4.0', 'digital_transformation', 'custom', etc.
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'completed', 'archived'

  -- Campaign configuration
  facilitator_name TEXT NOT NULL,
  facilitator_email TEXT NOT NULL,
  company_name TEXT,
  company_industry TEXT,

  -- Knowledge base configuration
  knowledge_base_ids UUID[], -- References to knowledge table for domain-specific content

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type);
CREATE INDEX idx_campaigns_facilitator_email ON campaigns(facilitator_email);

-- =====================================================
-- STAKEHOLDER SESSIONS TABLE
-- Tracks individual stakeholder interview sessions
-- =====================================================
CREATE TABLE stakeholder_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Stakeholder information
  stakeholder_name TEXT NOT NULL,
  stakeholder_email TEXT NOT NULL,
  stakeholder_role TEXT NOT NULL, -- 'managing_director', 'it_operations', 'production', 'purchasing', 'planning', 'engineering'
  stakeholder_title TEXT,

  -- Session state
  status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'in_progress', 'completed', 'abandoned'
  progress_percentage INTEGER DEFAULT 0,
  current_question_index INTEGER DEFAULT 0,

  -- Access control
  access_token TEXT UNIQUE, -- For stakeholder login without authentication
  access_expires_at TIMESTAMPTZ,

  -- Session tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  -- Document uploads for this session
  has_uploaded_documents BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_stakeholder_sessions_campaign ON stakeholder_sessions(campaign_id);
CREATE INDEX idx_stakeholder_sessions_email ON stakeholder_sessions(stakeholder_email);
CREATE INDEX idx_stakeholder_sessions_status ON stakeholder_sessions(status);
CREATE INDEX idx_stakeholder_sessions_role ON stakeholder_sessions(stakeholder_role);
CREATE INDEX idx_stakeholder_sessions_token ON stakeholder_sessions(access_token);

-- =====================================================
-- AGENT SESSIONS TABLE
-- AI conversation state and message history
-- =====================================================
CREATE TABLE agent_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_session_id UUID NOT NULL REFERENCES stakeholder_sessions(id) ON DELETE CASCADE,

  -- Agent configuration
  agent_type TEXT NOT NULL, -- 'interview_agent', 'document_analyst', 'synthesis_agent'
  agent_model TEXT NOT NULL DEFAULT 'claude-sonnet-4-5', -- AI model used

  -- Conversation state
  conversation_history JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {role, content, timestamp}
  system_prompt TEXT,

  -- Session context
  session_context JSONB DEFAULT '{}'::jsonb, -- Current context, variables, state

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agent_sessions_stakeholder ON agent_sessions(stakeholder_session_id);
CREATE INDEX idx_agent_sessions_type ON agent_sessions(agent_type);
CREATE INDEX idx_agent_sessions_updated ON agent_sessions(updated_at DESC);

-- =====================================================
-- SESSION DOCUMENTS TABLE
-- Uploaded documents (SOPs, diagrams, specs) linked to sessions
-- =====================================================
CREATE TABLE session_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stakeholder_session_id UUID NOT NULL REFERENCES stakeholder_sessions(id) ON DELETE CASCADE,

  -- Document information
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'sop', 'diagram', 'specification', 'report', 'other'
  file_size BIGINT NOT NULL, -- bytes
  mime_type TEXT NOT NULL,

  -- Storage
  storage_path TEXT NOT NULL, -- Path in Supabase Storage
  storage_bucket TEXT NOT NULL DEFAULT 'session-documents',

  -- Processing state
  processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  is_analyzed BOOLEAN DEFAULT FALSE,

  -- Analysis metadata
  page_count INTEGER,
  extracted_text TEXT,

  -- Agent interaction
  agent_questions JSONB DEFAULT '[]'::jsonb, -- Questions asked by agent about this document
  agent_insights JSONB DEFAULT '[]'::jsonb, -- Insights/observations from agent

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_session_documents_stakeholder ON session_documents(stakeholder_session_id);
CREATE INDEX idx_session_documents_type ON session_documents(document_type);
CREATE INDEX idx_session_documents_status ON session_documents(processing_status);
CREATE INDEX idx_session_documents_analyzed ON session_documents(is_analyzed);

-- =====================================================
-- DOCUMENT CHUNKS TABLE
-- RAG embeddings for uploaded session documents
-- =====================================================
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_document_id UUID NOT NULL REFERENCES session_documents(id) ON DELETE CASCADE,

  -- Chunk information
  chunk_index INTEGER NOT NULL, -- Order within document
  chunk_text TEXT NOT NULL,
  chunk_metadata JSONB DEFAULT '{}'::jsonb, -- page number, section, etc.

  -- Vector embedding for RAG
  embedding vector(1536), -- OpenAI embeddings dimension

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_chunks_session_doc ON document_chunks(session_document_id);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops);

-- =====================================================
-- SYNTHESIS TABLE
-- Cross-interview analysis and strategic insights
-- =====================================================
CREATE TABLE synthesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Synthesis type
  synthesis_type TEXT NOT NULL, -- 'cross_stakeholder', 'contradiction_analysis', 'roadmap_generation'

  -- Analysis content
  title TEXT NOT NULL,
  summary TEXT,
  detailed_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Identified patterns
  themes JSONB DEFAULT '[]'::jsonb, -- Common themes across interviews
  contradictions JSONB DEFAULT '[]'::jsonb, -- Conflicting statements
  gaps JSONB DEFAULT '[]'::jsonb, -- Missing information or capabilities

  -- Strategic outputs
  recommendations JSONB DEFAULT '[]'::jsonb,
  roadmap JSONB DEFAULT '[]'::jsonb, -- Strategic roadmap items

  -- Source tracking
  source_session_ids UUID[], -- Stakeholder sessions used in synthesis

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_synthesis_campaign ON synthesis(campaign_id);
CREATE INDEX idx_synthesis_type ON synthesis(synthesis_type);
CREATE INDEX idx_synthesis_created ON synthesis(created_at DESC);

-- =====================================================
-- KNOWLEDGE BASE TABLE
-- Pre-seeded domain knowledge (UNS, Industry 4.0, IIoT, etc.)
-- =====================================================
CREATE TABLE knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Knowledge classification
  domain TEXT NOT NULL, -- 'uns', 'industry_4.0', 'iiot', 'isa95', 'sparkplug_b', etc.
  category TEXT NOT NULL, -- 'concept', 'framework', 'standard', 'best_practice'

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  full_content TEXT NOT NULL,

  -- Source tracking
  source_url TEXT,
  source_type TEXT, -- 'documentation', 'whitepaper', 'standard', 'article'
  author TEXT,
  publication_date DATE,

  -- Searchability
  tags TEXT[],
  is_public BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_knowledge_domain ON knowledge(domain);
CREATE INDEX idx_knowledge_category ON knowledge(category);
CREATE INDEX idx_knowledge_tags ON knowledge USING GIN(tags);
CREATE INDEX idx_knowledge_public ON knowledge(is_public);

-- =====================================================
-- KNOWLEDGE CHUNKS TABLE
-- RAG embeddings for knowledge base content
-- =====================================================
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  knowledge_id UUID NOT NULL REFERENCES knowledge(id) ON DELETE CASCADE,

  -- Chunk information
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_metadata JSONB DEFAULT '{}'::jsonb,

  -- Vector embedding for RAG
  embedding vector(1536), -- OpenAI embeddings dimension

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_chunks_knowledge ON knowledge_chunks(knowledge_id);
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Public knowledge is readable by anyone
CREATE POLICY "Public knowledge is readable"
  ON knowledge FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Public knowledge chunks are readable"
  ON knowledge_chunks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM knowledge
      WHERE knowledge.id = knowledge_chunks.knowledge_id
      AND knowledge.is_public = TRUE
    )
  );

-- Stakeholders can access their own sessions via access_token
CREATE POLICY "Stakeholders can view their own sessions"
  ON stakeholder_sessions FOR SELECT
  USING (
    access_token = current_setting('request.jwt.claims', true)::json->>'access_token'
    OR auth.uid() IS NOT NULL -- Authenticated users can view all
  );

-- Service role has full access (for server-side operations)
-- This is handled by Supabase automatically for service_role key

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakeholder_sessions_updated_at BEFORE UPDATE ON stakeholder_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_sessions_updated_at BEFORE UPDATE ON agent_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_documents_updated_at BEFORE UPDATE ON session_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_synthesis_updated_at BEFORE UPDATE ON synthesis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_updated_at BEFORE UPDATE ON knowledge
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VECTOR SEARCH FUNCTIONS
-- =====================================================

-- Search session documents by semantic similarity
CREATE OR REPLACE FUNCTION search_session_documents(
  query_embedding vector(1536),
  session_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_name TEXT,
  chunk_text TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    sd.id,
    sd.document_name,
    dc.chunk_text,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN session_documents sd ON dc.session_document_id = sd.id
  WHERE sd.stakeholder_session_id = session_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Search knowledge base by semantic similarity
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  domain_filter TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  chunk_id UUID,
  knowledge_id UUID,
  title TEXT,
  domain TEXT,
  chunk_text TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    k.id,
    k.title,
    k.domain,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  JOIN knowledge k ON kc.knowledge_id = k.id
  WHERE (domain_filter IS NULL OR k.domain = domain_filter)
    AND k.is_public = TRUE
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE campaigns IS 'Assessment campaigns managed by facilitators';
COMMENT ON TABLE stakeholder_sessions IS 'Individual stakeholder interview sessions within campaigns';
COMMENT ON TABLE agent_sessions IS 'AI conversation state and message history for each session';
COMMENT ON TABLE session_documents IS 'Documents uploaded during sessions (SOPs, diagrams, specs)';
COMMENT ON TABLE document_chunks IS 'RAG embeddings for uploaded session documents';
COMMENT ON TABLE synthesis IS 'Cross-interview analysis and strategic insights';
COMMENT ON TABLE knowledge IS 'Pre-seeded domain knowledge base (UNS, Industry 4.0, IIoT)';
COMMENT ON TABLE knowledge_chunks IS 'RAG embeddings for knowledge base content';

# Supabase Database Schema

This directory contains the database schema and migrations for the InnovaasFlow Forge platform.

## Database Overview

The platform uses **PostgreSQL with pgvector** for storing structured data and RAG embeddings.

### Core Tables

#### 1. **campaigns**
Assessment campaigns managed by facilitators (e.g., "Alimex Industry 4.0 Readiness Assessment").

**Key fields:**
- `name`, `description`, `campaign_type`
- `status`: 'draft' | 'active' | 'completed' | 'archived'
- `facilitator_name`, `facilitator_email`
- `knowledge_base_ids`: References to pre-seeded knowledge domains

#### 2. **stakeholder_sessions**
Individual stakeholder interview sessions within campaigns.

**Key fields:**
- `campaign_id`: Parent campaign
- `stakeholder_name`, `stakeholder_email`, `stakeholder_role`
- `status`: 'invited' | 'in_progress' | 'completed' | 'abandoned'
- `access_token`: For passwordless stakeholder login
- `progress_percentage`, `current_question_index`

**Stakeholder roles:**
- `managing_director`
- `it_operations`
- `production`
- `purchasing`
- `planning`
- `engineering`

#### 3. **agent_sessions**
AI conversation state and message history for each stakeholder session.

**Key fields:**
- `stakeholder_session_id`: Parent session
- `agent_type`: 'interview_agent' | 'document_analyst' | 'synthesis_agent'
- `conversation_history`: JSONB array of messages
- `session_context`: Current state and variables

#### 4. **session_documents** 🆕
Documents uploaded during sessions (SOPs, architectural diagrams, specifications).

**Key features:**
- Upload during active sessions
- Agent can review and ask questions about documents
- Processing status tracking
- Extracted text for RAG
- Storage path references

**Document types:**
- `sop` - Standard Operating Procedures
- `diagram` - Architectural diagrams, flowcharts
- `specification` - Technical specifications
- `report` - Reports, analyses
- `other` - Other document types

#### 5. **document_chunks** 🆕
RAG embeddings for uploaded session documents (1536-dimensional OpenAI embeddings).

**Enables:**
- Semantic search within uploaded documents
- Agent context retrieval during conversations
- Document-based Q&A

#### 6. **synthesis**
Cross-interview analysis and strategic insights.

**Key fields:**
- `synthesis_type`: 'cross_stakeholder' | 'contradiction_analysis' | 'roadmap_generation'
- `themes`: Common themes across interviews
- `contradictions`: Conflicting statements between stakeholders
- `gaps`: Missing information or capabilities
- `recommendations`: Strategic recommendations
- `roadmap`: Strategic roadmap items

#### 7. **knowledge**
Pre-seeded domain knowledge base (UNS, Industry 4.0, IIoT, ISA-95, Sparkplug B).

**Domains:**
- `uns` - Unified Namespace
- `industry_4.0` - Industry 4.0 concepts
- `iiot` - Industrial Internet of Things
- `isa95` - ISA-95 hierarchy
- `sparkplug_b` - Sparkplug B protocol

**Categories:**
- `concept` - Conceptual frameworks
- `framework` - Implementation frameworks
- `standard` - Industry standards
- `best_practice` - Best practices

#### 8. **knowledge_chunks**
RAG embeddings for knowledge base content (1536-dimensional OpenAI embeddings).

## Storage Buckets

### 1. **session-documents** (Private)
Stores documents uploaded during stakeholder sessions.

**Access:**
- Authenticated users can upload
- Users can view their own session documents
- Service role can delete

### 2. **knowledge-assets** (Public)
Stores knowledge base assets (PDFs, whitepapers, documentation).

**Access:**
- Public read access
- Authenticated users can upload

## Vector Search Functions

### `search_session_documents()`
Semantic search within a stakeholder's uploaded documents.

```sql
SELECT * FROM search_session_documents(
  query_embedding := '[...]'::vector(1536),
  session_id := '123e4567-e89b-12d3-a456-426614174000',
  match_threshold := 0.7,
  match_count := 5
);
```

**Returns:**
- `chunk_id`: Document chunk UUID
- `document_id`: Source document UUID
- `document_name`: Original filename
- `chunk_text`: Chunk content
- `similarity`: Cosine similarity score (0-1)

### `search_knowledge()`
Semantic search within the knowledge base.

```sql
SELECT * FROM search_knowledge(
  query_embedding := '[...]'::vector(1536),
  domain_filter := 'uns', -- Optional: filter by domain
  match_threshold := 0.7,
  match_count := 10
);
```

**Returns:**
- `chunk_id`: Knowledge chunk UUID
- `knowledge_id`: Source knowledge UUID
- `title`: Knowledge title
- `domain`: Knowledge domain
- `chunk_text`: Chunk content
- `similarity`: Cosine similarity score (0-1)

## Applying Migrations

### Option 1: Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/20251115_initial_schema.sql`
4. Paste and run
5. Copy the contents of `storage-config.sql`
6. Paste and run

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

### Option 3: Direct PostgreSQL Connection

```bash
# Using psql
psql "postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  -f migrations/20251115_initial_schema.sql

psql "postgresql://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  -f storage-config.sql
```

## Testing the Schema

After applying migrations, verify the setup:

```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Insert test campaign
INSERT INTO campaigns (name, description, campaign_type, facilitator_name, facilitator_email)
VALUES (
  'Test Campaign',
  'Testing the database schema',
  'industry_4.0',
  'Test Facilitator',
  'test@example.com'
);
```

## Key Features

### 🔒 Row Level Security (RLS)
All tables have RLS enabled. Access is controlled via:
- `auth.uid()` for authenticated users
- `access_token` for stakeholder sessions (passwordless access)
- Service role key for server-side operations

### 🔄 Automatic Timestamps
`updated_at` columns are automatically updated via triggers.

### 🔍 Vector Search
Built-in semantic search using pgvector:
- **IVFFlat indexing** for fast approximate nearest neighbor search
- **Cosine similarity** for relevance scoring
- Optimized for OpenAI embeddings (1536 dimensions)

### 📄 Document Analysis
- Upload documents during sessions
- Automatic text extraction
- Agent can ask questions about uploaded content
- RAG-powered document search

### 🎯 Multi-Tenant Isolation
Each campaign is isolated with RLS policies ensuring data privacy.

## Environment Variables

Make sure these are configured in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

## Next Steps

1. ✅ Apply migrations
2. 🔍 Seed knowledge base with UNS/Industry 4.0 content
3. 🤖 Build interview agents
4. 🎨 Create facilitator dashboard
5. 📱 Build stakeholder interview UI
6. 📤 Implement document upload interface
7. 🧪 Create testing interface

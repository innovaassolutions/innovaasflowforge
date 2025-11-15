# Industry 4.0 / IIoT Knowledge Base

This directory contains comprehensive knowledge base content for the Flow Forge AI-assisted business consulting platform, specifically focused on Smart Industry 4.0 readiness assessments.

## Contents

### 1. [Unified Namespace (UNS) Fundamentals](./uns-fundamentals.md)
**~5,000 words** | Domain: `uns` | Category: `framework`

Comprehensive guide to Unified Namespace architecture for Industrial IoT including:
- Core concepts and definition
- Architecture components (MQTT broker, data models, integration, security)
- MQTT Sparkplug B integration
- ISA-95 alignment
- Event-driven patterns
- Business benefits
- Implementation patterns for manufacturing
- Best practices for topic namespace design, data modeling
- Common challenges and solutions

**Key Topics:**
- Real-time data fabric
- MQTT pub/sub architecture
- Semantic hierarchies
- Report-by-exception
- Device lifecycle management
- **Payload format flexibility** (Sparkplug B, JSON, custom)
- Alternative approaches (UMH comparison)

### 2. [United Manufacturing Hub (UMH) Unified Namespace Architecture](./umh-unified-namespace.md)
**~5,500 words** | Domain: `uns` | Category: `framework`

Detailed exploration of UMH's open-source UNS approach including:
- Hybrid MQTT + Kafka architecture
- Plain MQTT with JSON payloads (no Sparkplug B requirement)
- ISA-95 based topic structure (`umh/v1/enterprise/site/area/...`)
- Default schemas (_historian, _analytics, _local)
- Merge points for data consolidation
- OT-friendly implementation philosophy
- Comparison with Sparkplug B approach

**Key Topics:**
- Open-source UNS platform
- JSON vs. Protocol Buffers tradeoffs
- Data Bridge microservice
- Flexible vs. strict specifications
- Kubernetes deployment

### 3. [ISA-95 Enterprise-Control System Integration Hierarchy](./isa-95-hierarchy.md)
**~3,500 words** | Domain: `isa95` | Category: `standard`

Detailed breakdown of the ISA-95 five-level hierarchy standard including:
- Level 0: Physical Production Processes
- Level 1: Sensing and Manipulation
- Level 2: Monitoring and Supervision (PLCs, DCS, HMI)
- Level 3: Manufacturing Operations Management (MES, SCADA, QMS)
- Level 4: Business Planning and Logistics (ERP, SCM, CRM)
- Standard object models and integration patterns
- Industry 4.0 relevance and UNS alignment
- Practical applications across production, quality, and maintenance

**Key Topics:**
- Manufacturing hierarchy
- Enterprise-control integration
- MES and ERP interfaces
- Equipment hierarchy
- Production order management

### 4. [MQTT Sparkplug B Protocol Specification](./sparkplug-b-protocol.md)
**~3,000 words** | Domain: `sparkplug_b` | Category: `standard`

Technical specification of MQTT Sparkplug B protocol including:
- Purpose and goals (interoperability for IIoT)
- Topic namespace structure (`spBv1.0/group_id/message_type/edge_node_id/device_id`)
- Message types (NBIRTH, NDEATH, DBIRTH, DDEATH, NDATA, DDATA, NCMD, DCMD, STATE)
- Payload format using Protocol Buffers
- State management and birth/death certificates
- Report-by-exception patterns
- Integration with non-MQTT devices (OPC UA, Modbus)
- Best practices for topic design and metric naming

**Key Topics:**
- MQTT extensions
- Birth/death certificates
- Protocol Buffers encoding
- State management
- Device discovery

## Total Content

- **4 documents**
- **~16,500 words**
- **Authoritative sources:** HiveMQ, ISA.org, Eclipse Foundation, United Manufacturing Hub
- **Researched:** November 2024

## Purpose

This knowledge base powers the RAG (Retrieval-Augmented Generation) system for AI agents conducting Smart Industry 4.0 readiness assessments. The content enables agents to:

1. **Ask intelligent, domain-specific questions** during stakeholder interviews
2. **Provide contextual explanations** of Industry 4.0 concepts
3. **Identify gaps and opportunities** based on established standards and best practices
4. **Generate strategic recommendations** aligned with UNS, ISA-95, and Sparkplug B frameworks

## Database Schema

Content from these documents will be:
1. **Chunked** into semantic segments (~500-1000 tokens each)
2. **Embedded** using OpenAI embeddings (1536 dimensions)
3. **Stored** in `knowledge` and `knowledge_chunks` tables in Supabase
4. **Retrieved** via vector similarity search during agent conversations

## Future Additions

Additional knowledge base topics to consider:
- **OPC UA** - Industrial automation communication standard
- **MQTT Essentials** - Core MQTT protocol concepts
- **Digital Twin** - Virtual representations of physical assets
- **Predictive Maintenance** - AI/ML for equipment health
- **OEE (Overall Equipment Effectiveness)** - Manufacturing KPIs
- **Edge Computing** - Processing at the data source
- **Time-Series Databases** - Historians and trending
- **Industry 4.0 Maturity Models** - Assessment frameworks

## Sources and Attribution

### Primary Sources
- **HiveMQ** - MQTT and UNS documentation (https://www.hivemq.com)
- **ISA** - International Society of Automation standards (https://www.isa.org)
- **Eclipse Foundation** - Sparkplug specification (https://sparkplug.eclipse.org)
- **EMQX** - Industrial MQTT platform documentation (https://www.emqx.com)
- **Inductive Automation** - Ignition SCADA and UNS resources
- **Siemens** - Manufacturing execution systems documentation

### Research Date
November 15, 2024

## License

This knowledge base content is compiled from publicly available sources and industry standards. Citations and references are included in each document. This compilation is for use within the Flow Forge platform for Smart Industry consulting services.

---

**Next Steps:**
1. Create import script to chunk and embed this content
2. Store in Supabase `knowledge` and `knowledge_chunks` tables
3. Test vector search functionality
4. Integrate with agent interview system

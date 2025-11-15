# United Manufacturing Hub (UMH) Unified Namespace Architecture

## Overview

United Manufacturing Hub (UMH) is an **open-source industrial data infrastructure platform** that implements Unified Namespace architecture with a pragmatic, flexible approach. Unlike specifications that enforce strict protocols (like Sparkplug B), UMH prioritizes **ease of use, modularity, and accessibility** while maintaining the core UNS benefits of centralized, event-driven data flow.

## Core Philosophy

UMH frames their Unified Namespace as a **"single source of truth for all Industrial Data"** that connects machines, sensors, and systems into a standardized, real-time data source. Their emphasis centers on creating a data backbone that enables seamless integration across all applications.

### Key Principles

1. **Open-Source Foundation**: "The future of industrial infrastructure must be modular and open source, as this is the only way to make data easily available and components interchangeable."

2. **Rapid Deployment**: Designed to be deployable in under 10 minutes with minimal configuration

3. **Pragmatic Flexibility**: Combines MQTT's simplicity with Kafka's processing power without enforcing rigid specifications

4. **OT-Friendly**: Prioritizes readability and usability for operational technology professionals

## Hybrid Architecture: MQTT + Kafka

UMH employs a unique **dual-broker architecture** that combines the strengths of MQTT and Kafka:

### MQTT Layer (Shop Floor Collection)

**Purpose**: Safe message delivery between devices and simplified data gathering on the shop floor

**Strengths**:
- Handles numerous unreliable connections efficiently
- Widely supported by OT devices and sensors
- Simple pub/sub model familiar to plant engineers
- Low overhead for edge devices

**MQTT Broker**: HiveMQ (customized for UMH stack requirements)

**Usage Pattern**: "Send messages from IoT devices via MQTT"

### Kafka Layer (Enterprise Processing)

**Purpose**: Scalable data processing and enterprise-wide data distribution

**Strengths**:
- Processes large volumes of data efficiently
- Advanced stream processing capabilities
- Horizontal scaling for enterprise deployments
- Persistent message storage with replay capability

**Weaknesses**: Struggles with maintaining numerous unreliable connections (handled by MQTT instead)

**Usage Pattern**: "Then work in Kafka only" for downstream applications

### Data Bridge Microservice

The critical component that transfers and transforms data between MQTT and Kafka:

**Functions**:
- Protocol translation (MQTT → Kafka)
- Data transformation to adhere to UMH data model
- **Merge points**: Consolidates multiple MQTT topics into single Kafka topics
- Source identification preservation through message keys

**Key Principle**: "No data modification occurs between the OT producer and the message broker to maintain modularity"

## Topic Structure - ISA-95 Based

UMH uses a hierarchical topic structure following ISA-95 principles, but with their own format optimized for manufacturing:

### Format

```
umh/v1/{enterprise}/{site}/{area}/{productionLine}/{workCell}/{originID}/_schema
```

### Components Explained

- **`umh/v1`**: Versioning prefix enables future evolution without breaking compatibility
- **`{enterprise}`**: Top-level organization identifier
- **`{site}`**: Physical location (factory, plant)
- **`{area}`**: Manufacturing area within site
- **`{productionLine}`**: Specific production line
- **`{workCell}`**: Individual work cell or station
- **`{originID}`**: Device identifier (serial number, MAC address, software component ID)
- **`_schema`**: Schema tag determines data type and handling (underscore prefix distinguishes it from hierarchy)

### Naming Conventions

**Allowed characters**: Letters, numbers, hyphens (`-`), underscores (`_`)
**Avoided characters**: MQTT/Kafka reserved characters (`.`, `+`, `#`, `/`)

**Flexible naming**: Human-readable names preferred over numeric codes for OT accessibility

### Example Topics

```
umh/v1/demo-pharma-enterprise/Cologne/_historian/rainfall/isRaining
umh/v1/acme-corp/texas-plant/assembly/line-a/cell-3/robot-01/_analytics
umh/v1/alimex/johor-factory/production/extrusion-line/cell-2/extruder-05/_historian/temperature
```

## Payload Format - JSON Standard

**UMH mandates JSON as the sole supported payload format**, diverging from binary protocol approaches like Sparkplug B.

### Rationale for JSON

1. **Direct Readability**: Enables immediate inspection in tools like MQTT Explorer, Node-RED, and debugging consoles
2. **OT Accessibility**: Operational technology professionals can read and troubleshoot without specialized decoders
3. **Tooling Compatibility**: Works with all standard MQTT and Kafka tools without plugins
4. **Bandwidth Not a Concern**: "Bandwidth is rarely a concern" in manufacturing environments—clarity trumps compression

### Acknowledged Tradeoffs

The documentation acknowledges JSON "can be more resource-intensive compared to formats like Protobuf or Avro" but argues the accessibility benefits outweigh compression savings in typical manufacturing deployments.

### No Sparkplug B Requirement

**Sparkplug B is not mentioned** in UMH documentation. The platform uses plain MQTT with JSON payloads, demonstrating that **Unified Namespace does not require Sparkplug B specification**.

This flexibility allows organizations to:
- Choose payload formats based on their needs
- Integrate legacy systems without protocol translation
- Adopt UNS principles without vendor lock-in
- Evolve data formats over time

## Default Schemas

UMH defines standard schema types for common use cases:

### `_historian` - Time-Series Data

**Purpose**: Store time-series measurements in TimescaleDB

**Data Structure**:
```json
{
  "timestamp_ms": 1699564800000,
  "temperature": 245.7,
  "pressure": 125.3,
  "vibration": 0.42
}
```

**Features**:
- Optional tag grouping using underscores or topic hierarchies
- Automatic storage in time-series database
- Optimized for trending and historical analysis
- Retention policies configurable

### `_analytics` - Production Events

**Purpose**: Handle production-related events (jobs, products, shifts, states)

**Structured Event Types**:
- Job start/end events
- Product tracking
- Shift changeovers
- State changes (running, stopped, maintenance)

**Data Structure**:
```json
{
  "event_type": "job_start",
  "timestamp_ms": 1699564800000,
  "job_id": "JOB-12345",
  "product_code": "SKU-ABC",
  "quantity_target": 1000
}
```

**Features**:
- Standardized event schemas
- Integration with MES/ERP systems
- Production genealogy tracking
- OEE calculation support

### `_local` - Ephemeral Data

**Purpose**: Data that remains local and is not forwarded or stored

**Use Cases**:
- Temporary calculations
- Local control loops
- Debugging information
- Transient state

**Characteristics**:
- Not persisted to databases
- Not forwarded across bridges
- Available only on local MQTT broker
- Minimal overhead

## Merge Points Feature

A unique UMH capability for organizing data efficiently:

### Concept

Consolidate multiple MQTT topics into single Kafka topics while preserving source identification through message keys.

### Example

**MQTT Topics** (separate):
```
umh/v1/factory-a/line-1/cell-1/sensor-01/_historian/temperature
umh/v1/factory-a/line-1/cell-2/sensor-02/_historian/temperature
umh/v1/factory-a/line-2/cell-1/sensor-03/_historian/temperature
```

**Kafka Topic** (consolidated):
```
umh.v1.factory-a._historian.temperature

Message Key: line-1.cell-1.sensor-01
Payload: {"timestamp_ms": 1699564800000, "value": 245.7}

Message Key: line-1.cell-2.sensor-02
Payload: {"timestamp_ms": 1699564800000, "value": 248.3}

Message Key: line-2.cell-1.sensor-03
Payload: {"timestamp_ms": 1699564800000, "value": 251.2}
```

### Benefits

- Simplified downstream processing (single Kafka topic for all temperature sensors)
- Preserved context through message keys
- Efficient stream processing
- Logical data organization

## Data Validation and Integrity

While emphasizing flexibility, UMH maintains data integrity through schema validation:

### Validation Rules

- Messages to `_historian` and `_analytics` are **rejected unless compliant** with established formats
- Custom schemas can be defined but must include validation rules
- Malformed JSON is rejected at the broker
- Type checking enforced for standardized fields

### Balance of Flexibility and Structure

The schema system allows **customization within defined boundaries**:
- Topic structure is flexible (use as many hierarchy levels as needed)
- Payload schemas are extensible (add custom fields)
- Standard schemas ensure interoperability
- Validation prevents data corruption

## Integration with Enterprise Systems

UMH's architecture facilitates seamless integration:

### Data Flow Patterns

1. **OT → IT Integration**
   ```
   Sensors/PLCs → MQTT → Data Bridge → Kafka → TimescaleDB/BI Tools
   ```

2. **Bidirectional Communication**
   ```
   ERP/MES ← Kafka ← Data Bridge ← MQTT ← Controllers
   ```

3. **Multi-Site Aggregation**
   ```
   Site A (MQTT+Kafka) → Central Kafka → Enterprise Analytics
   Site B (MQTT+Kafka) ↗
   ```

### Supported Integrations

- **MES Systems**: SAP ME, Siemens Opcenter, Apriso
- **ERP Systems**: SAP S/4HANA, Oracle, Microsoft Dynamics
- **SCADA Systems**: Ignition, WinCC, Wonderware
- **Databases**: TimescaleDB, PostgreSQL, InfluxDB
- **Analytics**: Grafana, Tableau, PowerBI
- **Cloud Platforms**: AWS IoT, Azure IoT Hub, Google Cloud IoT

## Deployment Models

### On-Premise

- Full control and data sovereignty
- Low-latency edge processing
- Compliance with data residency requirements
- Air-gapped environments supported

### Cloud-Native

- Elastic scaling based on demand
- Global deployment with regional presence
- Managed services and automatic updates
- Cost-effective for variable workloads

### Hybrid Edge-Cloud

- Edge processing for real-time control
- Cloud aggregation for analytics
- Bandwidth optimization (process locally, send summaries)
- Resilience through distributed architecture

### Kubernetes-Based

UMH is designed for Kubernetes deployment:
- Containerized microservices
- Helm charts for installation
- Auto-scaling capabilities
- High availability configurations

## Benefits of UMH Approach

### 1. OT-Friendly Implementation

- **No protocol translation needed** for most devices
- **JSON payloads** readable by plant engineers
- **MQTT familiarity** in OT environment
- **Gradual adoption** without forklift upgrades

### 2. Flexibility vs. Rigid Specifications

- **No vendor lock-in** to specific protocols
- **Evolutionary architecture** allows incremental improvements
- **Custom schemas** for unique requirements
- **Mixed protocols** possible (JSON, Sparkplug B, custom)

### 3. Open-Source Advantages

- **Transparency**: Full source code access
- **Community-driven**: Active contributor ecosystem
- **Cost-effective**: No licensing fees
- **Extensibility**: Modify and extend as needed

### 4. Hybrid Processing Power

- **MQTT for collection**: Simple, reliable device connectivity
- **Kafka for processing**: Enterprise-scale data handling
- **Best of both worlds**: Optimized for manufacturing reality

### 5. Rapid Deployment

- **10-minute setup**: Minimal configuration required
- **Pre-built components**: Integrated stack out-of-box
- **Quick wins**: Demonstrate value fast
- **Iterative expansion**: Start small, scale incrementally

## Comparison: UMH vs. Sparkplug B

| Aspect | UMH Approach | Sparkplug B Approach |
|--------|-------------|---------------------|
| **Payload Format** | JSON (mandated) | Protocol Buffers (binary) |
| **Readability** | Human-readable | Requires decoder |
| **Bandwidth** | Higher (JSON overhead) | Lower (binary compression) |
| **OT Accessibility** | Very high | Moderate (tooling needed) |
| **Specification** | Flexible schemas | Strict specification |
| **State Management** | Application-level | Built-in birth/death certificates |
| **Processing** | Hybrid MQTT+Kafka | MQTT-centric |
| **Vendor Neutrality** | Open-source | Open specification (Eclipse) |

**Key Insight**: Both approaches achieve Unified Namespace goals through different philosophies. UMH prioritizes **ease of use and flexibility**, while Sparkplug B prioritizes **strict interoperability and efficiency**.

## Best Practices from UMH

### 1. Topic Design

- **Mirror physical layout**: Topic hierarchy should match factory layout
- **Human-readable names**: Avoid cryptic codes, use descriptive names
- **Consistent naming**: Establish conventions and document them
- **Version topics**: Use `umh/v1` pattern for future evolution

### 2. Payload Strategy

- **Keep JSON simple**: Flat structures preferred over deep nesting
- **Include timestamps**: Always provide `timestamp_ms` field
- **Add context**: Include enough information to interpret data standalone
- **Validate schemas**: Enforce structure to prevent data corruption

### 3. Data Flow Optimization

- **Edge processing**: Filter and aggregate at source when possible
- **Selective forwarding**: Only send relevant data to Kafka/cloud
- **Merge strategically**: Consolidate similar data streams for efficient processing
- **Retain on MQTT**: Use retained messages for current state visibility

### 4. Integration Patterns

- **Start with historians**: Time-series data provides quick value
- **Add analytics gradually**: Implement production events after foundation stable
- **Preserve raw data**: Keep original messages for future analysis
- **Enable bidirectional**: Support commands from enterprise to shop floor

## Summary

The United Manufacturing Hub demonstrates that **Unified Namespace is a concept, not a specific protocol**. By using plain MQTT with JSON payloads and a hybrid MQTT+Kafka architecture, UMH achieves the core UNS benefits—centralized data hub, event-driven architecture, semantic organization—without requiring Sparkplug B or Protocol Buffers.

This approach proves that organizations can implement UNS using:
- **Flexible payload formats** (JSON, Sparkplug B, custom binary, or mixed)
- **Standard MQTT** without extensions
- **OT-friendly tools** that prioritize accessibility
- **Open-source components** to avoid vendor lock-in
- **Pragmatic architectures** that balance simplicity and scalability

The choice between UMH's flexible JSON approach and Sparkplug B's strict specification depends on organizational priorities: ease of use vs. bandwidth efficiency, OT accessibility vs. protocol interoperability, flexibility vs. standardization. Both are valid paths to Unified Namespace success.

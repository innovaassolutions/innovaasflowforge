# MQTT Sparkplug B Protocol Specification

## Overview

MQTT Sparkplug B is an **open-source software specification that provides MQTT clients with an interoperable framework to seamlessly integrate data** from applications, sensors, devices, and gateways within MQTT infrastructure. Originally introduced by Cirrus Link Solutions in 2016 as Sparkplug A, it was upgraded to Sparkplug B shortly afterward and is now governed by the Eclipse Foundation.

## Purpose and Goals

The Sparkplug specification aims to **"define an MQTT Topic Namespace, payload, and session state management that can be applied generically to the overall IIoT market sector but specifically meets the requirements of real-time SCADA/Control HMI solutions."**

### Three Primary Specifications

1. **MQTT topic namespace definition** - Standardized topic structure
2. **MQTT state management framework** - Birth/death certificates and session awareness
3. **MQTT payload structure** - Binary encoding using Protocol Buffers

### Problem Solved

While standard MQTT provides a flexible publish-subscribe messaging protocol, it requires participants to manually coordinate:
- Where to subscribe (topic structures vary by implementation)
- How to interpret data (no standard payload format)
- How to publish data (no naming conventions)
- How to manage device state (online/offline detection)

This creates tight coupling between producers and consumers, making systems fragile and difficult to scale.

**Sparkplug solves this by enabling all participants to settle on:**
- A common data format
- Where to receive specific data
- How to publish their data
- How data can be interpreted

## MQTT Requirements

Sparkplug requires an MQTT broker implementing the full MQTT 3.1.1 specification, specifically supporting:

- **Quality of Service (QoS) levels 0 and 1**
- **Retained messages** for state preservation
- **Last Will and Testament (LWT)** for disconnect detection
- **Flexible security mechanisms** (TLS, authentication, authorization)

## Topic Namespace Structure

Sparkplug defines a standardized topic structure:

```
namespace/group_id/message_type/edge_node_id/[device_id]
```

### Components

- **namespace:** Always `spBv1.0` for Sparkplug B version 1.0
- **group_id:** Logical grouping of edge nodes (often maps to ISA-95 Site or Area)
- **message_type:** Type of message (NBIRTH, NDEATH, DBIRTH, DDEATH, NDATA, DDATA, NCMD, DCMD, STATE)
- **edge_node_id:** Unique identifier for the edge gateway or controller
- **device_id:** (Optional) Unique identifier for a specific device connected to the edge node

### Example Topics

```
spBv1.0/Alimex/NBIRTH/Gateway-01
spBv1.0/Alimex/DBIRTH/Gateway-01/Extruder-05
spBv1.0/Alimex/NDATA/Gateway-01
spBv1.0/Alimex/DDATA/Gateway-01/Extruder-05
spBv1.0/Alimex/NCMD/Gateway-01
spBv1.0/Alimex/DCMD/Gateway-01/Extruder-05
```

## Message Types

### Birth Certificates (Announce Capabilities)

#### NBIRTH - Node Birth
Published when an edge node comes online. Contains:
- Complete list of metrics the edge node will publish
- Metric definitions including name, datatype, engineering units
- Initial values for all metrics
- Node-level metadata

**Topic:** `spBv1.0/{group_id}/NBIRTH/{edge_node_id}`
**QoS:** 0
**Retain:** False

#### DBIRTH - Device Birth
Published when a device connected to an edge node comes online. Contains:
- Complete list of metrics the device will publish
- Metric definitions including name, datatype, engineering units
- Initial values for all metrics
- Device-level metadata

**Topic:** `spBv1.0/{group_id}/DBIRTH/{edge_node_id}/{device_id}`
**QoS:** 0
**Retain:** False

### Death Certificates (Announce Disconnection)

#### NDEATH - Node Death
Published automatically by the MQTT broker when an edge node disconnects unexpectedly (using MQTT Last Will and Testament). This alerts all subscribers that the node is offline.

**Topic:** `spBv1.0/{group_id}/NDEATH/{edge_node_id}`
**QoS:** 1
**Retain:** False

#### DDEATH - Device Death
Published by the edge node when a device disconnects. Alerts subscribers that the specific device is offline while the edge node remains connected.

**Topic:** `spBv1.0/{group_id}/DDEATH/{edge_node_id}/{device_id}`
**QoS:** 0
**Retain:** False

### Data Messages (Report-by-Exception)

#### NDATA - Node Data
Published by edge node when one or more of its metrics change. Only changed metrics are included (report-by-exception pattern).

**Topic:** `spBv1.0/{group_id}/NDATA/{edge_node_id}`
**QoS:** 0
**Retain:** False

#### DDATA - Device Data
Published by edge node when one or more device metrics change. Only changed metrics are included.

**Topic:** `spBv1.0/{group_id}/DDATA/{edge_node_id}/{device_id}`
**QoS:** 0
**Retain:** False

### Command Messages (Control and Configuration)

#### NCMD - Node Command
Published by SCADA/Host application to send commands to an edge node.

**Topic:** `spBv1.0/{group_id}/NCMD/{edge_node_id}`
**QoS:** 0
**Retain:** False

#### DCMD - Device Command
Published by SCADA/Host application to send commands to a specific device.

**Topic:** `spBv1.0/{group_id}/DCMD/{edge_node_id}/{device_id}`
**QoS:** 0
**Retain:** False

### State Message (SCADA Application Status)

#### STATE - Host Application State
Published by primary SCADA/Host application to indicate online/offline status. Edge nodes monitor this and can rebirth if the host application restarts.

**Topic:** `STATE/{scada_host_id}`
**QoS:** 1
**Retain:** True (important!)

## Payload Format - Protocol Buffers

Sparkplug B uses **Google Protocol Buffers (protobuf)** for message encoding, providing:

- **Efficient binary format** - Dramatically reduced bandwidth compared to JSON or XML
- **Schema-based** - Type-safe data transmission
- **Language-agnostic** - Client libraries available for many programming languages
- **Backward compatibility** - Schema evolution supported

### Metric Structure

Each metric in a Sparkplug payload includes:

```protobuf
message Metric {
    string name = 1;              // Metric identifier
    uint64 alias = 2;             // Optional numeric alias (for bandwidth optimization)
    uint64 timestamp = 3;         // Unix epoch timestamp in milliseconds
    uint32 datatype = 4;          // Data type indicator
    bool is_historical = 5;       // Historical data flag
    bool is_transient = 6;        // Do not store in database
    bool is_null = 7;             // Null value indicator
    MetaData metadata = 8;        // Engineering units, quality, etc.
    PropertySet properties = 9;   // Extended properties

    // Value (one of the following)
    uint32 int_value = 10;
    uint64 long_value = 11;
    float float_value = 12;
    double double_value = 13;
    bool boolean_value = 14;
    string string_value = 15;
    bytes bytes_value = 16;
    DataSet dataset_value = 17;
    Template template_value = 18;
}
```

### Supported Data Types

- Integers: Int8, Int16, Int32, Int64, UInt8, UInt16, UInt32, UInt64
- Floating Point: Float, Double
- Boolean: Boolean
- String: String, Text
- Binary: Bytes
- DateTime: DateTime (64-bit Unix timestamp)
- Complex: DataSet, Template (for structured data)

### Metadata

Metrics can include metadata such as:
- **Engineering Units** (e.g., "°C", "PSI", "RPM", "m/s")
- **Quality** (GOOD, BAD, UNCERTAIN)
- **Min/Max values**
- **Description**
- **Custom properties**

## State Management

### Session Establishment

1. **Edge Node connects** to MQTT broker
2. **Sets Last Will and Testament (LWT)** to publish NDEATH on disconnect
3. **Publishes STATE topic subscription** to monitor SCADA host
4. **Publishes NBIRTH** with all metric definitions
5. For each connected device, **publishes DBIRTH** with device metrics

### Report-by-Exception

After birth certificates, edge nodes only publish data when values change:
- Reduces network bandwidth by 90%+ compared to polling
- Lowers broker load
- Decreases data storage requirements
- Provides real-time responsiveness

### Rebirth Mechanism

If a SCADA host application restarts (STATE goes from ONLINE → OFFLINE → ONLINE), edge nodes automatically republish NBIRTH and DBIRTH messages to resynchronize state with the new host instance.

### Disconnect Handling

When an edge node loses connection:
1. MQTT broker publishes the node's **NDEATH** (LWT)
2. All subscribers immediately know the node is offline
3. No need for heartbeat polling or timeout detection
4. When reconnecting, node publishes **NBIRTH** to announce it's back online

## Integration with Non-MQTT Devices

Sparkplug edge nodes act as protocol translators, enabling integration of legacy devices using:
- **OPC UA** - Industrial automation standard
- **Modbus** - Serial/TCP protocol
- **EtherNet/IP** - Allen-Bradley/Rockwell
- **PROFINET** - Siemens
- **BACnet** - Building automation
- **Custom protocols** - Proprietary equipment interfaces

### Device Discovery

Sparkplug provides built-in device discovery features through:
- DBIRTH messages announcing new devices
- Template definitions for device types
- Hierarchical namespace structure
- Metadata-rich metric definitions

## Benefits of Sparkplug B

### 1. Interoperability
- Vendor-neutral specification
- Multiple client implementations available
- Works with any MQTT 3.1.1 compliant broker
- Standardized data format eliminates custom parsers

### 2. Bandwidth Efficiency
- Binary Protocol Buffers encoding
- Report-by-exception pattern
- Optional metric aliases for further compression
- 10-100x reduction vs. JSON or XML

### 3. Auto-Discovery
- BIRTH certificates announce capabilities automatically
- No manual configuration of subscribers needed
- Dynamic addition of devices without reconfiguration
- Self-documenting through metadata

### 4. State Management
- Automatic online/offline detection via DEATH certificates
- No heartbeat polling overhead
- Immediate notification of connectivity changes
- Rebirth mechanism for state resynchronization

### 5. Scalability
- Supports millions of devices
- Hierarchical grouping (group_id, edge_node_id, device_id)
- Distributed architecture with edge processing
- Cloud-native compatibility

## Use Cases

### SCADA Systems
- Remote monitoring and control
- Alarm management
- Historical trending
- Operator dashboards

### Manufacturing Execution Systems (MES)
- Production tracking
- Quality data collection
- Equipment performance monitoring
- Downtime analysis

### Energy Management
- Utility monitoring (electricity, gas, water)
- Solar/wind farm data collection
- Grid monitoring and control
- Energy optimization

### Building Automation
- HVAC control
- Lighting management
- Access control integration
- Environmental monitoring

### Industrial IoT Applications
- Predictive maintenance
- Digital twin synchronization
- Edge analytics
- Cloud data aggregation

## Best Practices

### Topic Namespace Design
Map Sparkplug group_id to ISA-95 hierarchy:
```
group_id = Enterprise-Site-Area
edge_node_id = Line-Cell
device_id = Equipment-Module
```

Example: `spBv1.0/Alimex-Johor-Production/DDATA/LineA-Cell3/Extruder-01`

### Metric Naming
Use clear, descriptive names with context:
- ✅ `Temperature_Barrel_Zone1`
- ✅ `Pressure_Hydraulic_Main`
- ❌ `Temp1`
- ❌ `P2`

### Birth Certificate Completeness
Include all possible metrics in BIRTH, even if current value is null or zero. This allows subscribers to know the full capabilities of the device.

### Engineering Units
Always include units metadata:
```
Temperature_Barrel_Zone1
  value: 245.7
  metadata:
    engineering_units: "°C"
```

### Quality Indicators
Use quality metadata to indicate:
- GOOD: Valid, reliable data
- BAD: Sensor failure, communication error
- UNCERTAIN: Questionable accuracy, calibration due

## Summary

MQTT Sparkplug B provides a comprehensive, standardized framework for IIoT communications that solves the challenges of interoperability, scalability, and state management. By combining MQTT's proven publish-subscribe architecture with structured topic namespaces, efficient binary payloads, and intelligent state management, Sparkplug enables organizations to build robust, flexible Industrial IoT ecosystems.

When used in conjunction with Unified Namespace (UNS) architecture and ISA-95 hierarchy models, Sparkplug B becomes a powerful enabler for Industry 4.0 digital transformation, providing the communication foundation for real-time data access, advanced analytics, and AI/ML applications in manufacturing and industrial environments.

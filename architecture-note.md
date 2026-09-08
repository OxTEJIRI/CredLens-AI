# CredLens AI — Short Architecture Note

## Overview

CredLens AI is designed as a simple three-stage flow:

**Attestcoin Protocol → Scoring Engine → Creditcoin Contract**

The goal is to use **Attestcoin** as the trusted source of verified cross-chain data, pass those verified signals into a lightweight scoring engine, and then store the resulting trust decision in a **Creditcoin** smart contract on testnet.

## Proposed Flow

### 1. Attestcoin Protocol
Attestcoin provides the application with **cryptographically verified cross-chain wallet activity**.

This is the trust layer of the system. Instead of relying on a centralized oracle or unverifiable API response, the app only accepts attested cross-chain inputs.

**Output from this stage:**
- verified wallet activity signals
- verified history depth
- verified behavior consistency indicators

### 2. Scoring Engine
The scoring engine receives the attested inputs and converts them into a simple trust assessment.

For the MVP, this engine should remain transparent and easy to explain. It can combine the verified signals into a result such as:
- **Trusted**
- **Review Needed**
- **Risky**

**Output from this stage:**
- score value
- risk label
- explanation summary for the UI

### 3. Creditcoin Contract
Once the score is generated, the application submits the result to a smart contract deployed on **Creditcoin testnet**.

The contract records the trust assessment on-chain so that the final result is transparent, timestamped, and auditable.

**Data stored on-chain:**
- wallet address
- score
- label
- timestamp
- submitting address

## End-to-End Sequence

```text
User enters wallet address
    ↓
App requests attested cross-chain signals
    ↓
Attestcoin returns verified data
    ↓
Scoring engine evaluates verified signals
    ↓
App generates trust result
    ↓
Creditcoin contract stores score on testnet
    ↓
UI displays final result and transaction confirmation
```

## Design Principle

**No attested data, no score, and no on-chain decision.**

This keeps Attestcoin central to the product instead of making it a secondary add-on.

## Why This Architecture Fits the Hackathon

This proposed architecture is aligned with the hackathon requirement that projects use **Attestcoin Protocol** meaningfully and functionally. It also supports the AI-track pattern of using **verified cross-chain data** to inform a decision and trigger a transparent on-chain action on Creditcoin.

## MVP Boundary

To keep the build manageable, the first version should include only:
- one wallet input
- one verified Attestcoin data flow
- one lightweight scoring engine
- one Creditcoin contract write
- one UI result screen

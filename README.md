# CredLens AI

**AI-powered trust scoring on Creditcoin using Attestcoin-verified cross-chain data**

## Status

In development for **BUIDL CTC 2026 Fall**.

## Track

**AI**

## Project Description

CredLens AI is a Creditcoin application that uses **Attestcoin Protocol** to bring **cryptographically verified cross-chain wallet activity** into Creditcoin, analyzes those signals with a lightweight AI-style scoring engine, and records the resulting trust assessment on-chain.

The goal is to make AI-assisted on-chain decisions more trustworthy by ensuring that the model uses verified cross-chain inputs rather than opaque or centralized data pipelines.

## Problem

AI-driven on-chain automation is difficult to trust when it depends on cross-chain data that is not cryptographically verified. In many systems, developers and users must rely on centralized oracle operators or off-chain APIs before allowing important blockchain actions.

This creates a trust gap:
- the data source may be opaque
- the decision path may be hard to audit
- the final on-chain action may depend on weak or unverifiable inputs

## Solution

CredLens AI solves this by:
1. receiving verified cross-chain signals through **Attestcoin Protocol**
2. analyzing those attested signals with a transparent trust-scoring engine
3. submitting the resulting score or status to a **Creditcoin** smart contract on testnet

This makes the decision flow more transparent, auditable, and aligned with trustless cross-chain infrastructure.

## Attestcoin Integration Summary

Attestcoin Protocol is the core of the application.

CredLens AI uses Attestcoin to import **verified cross-chain wallet activity** into the app. The scoring engine only evaluates attested inputs. Once the score is produced, the application writes the result to a Creditcoin contract.

**No attested data, no score, and no on-chain decision.**

That design ensures Attestcoin is not an add-on; it is the trust layer that enables the product to function.

## Why This Matters

Cross-chain AI agents and automated blockchain systems are only as reliable as their inputs. If those inputs are unverifiable, then automation becomes difficult to trust.

CredLens AI demonstrates a practical pattern for the Creditcoin ecosystem:
- verified data comes from other chains
- AI turns that data into a usable decision
- Creditcoin records the outcome transparently on-chain

## Core Use Case

A user submits a wallet address for evaluation.

The application retrieves or consumes **Attestcoin-verified cross-chain activity**, converts the verified signals into a simple trust score, and stores the final result on Creditcoin.

Example outputs:
- **Trusted**
- **Review Needed**
- **Risky**

## Planned MVP

The minimum viable product includes:
- a simple frontend with wallet input
- one Attestcoin-powered verified data flow
- a lightweight scoring engine
- a Creditcoin smart contract that stores the score and status
- a testnet deployment

## Demo Flow

The prototype demo will show one complete flow:
1. user enters a wallet address
2. the app retrieves verified cross-chain signals through Attestcoin
3. the scoring engine analyzes the attested data
4. the app generates a trust score and label
5. the result is submitted to a Creditcoin smart contract on testnet
6. the UI displays the final outcome and transaction confirmation

## High-Level Architecture

```text
User Input
   -> Frontend
   -> Attestcoin-verified cross-chain data
   -> Scoring engine
   -> Creditcoin smart contract
   -> On-chain trust result
```

## Planned Repository Structure

```text
.
├── README.md
├── contracts/
├── frontend/
├── docs/
└── scripts/
```

## Scoring Approach

The initial scoring model is designed to be simple, transparent, and demo-friendly.

Planned verified signals include:
- wallet activity level
- history depth
- behavior consistency

These signals are combined into a trust assessment that is easy to explain during judging and in the demo video.

## Submission Alignment

This project is designed to align with the hackathon requirements by aiming to provide:
- meaningful and functional **Attestcoin Protocol** integration
- a project deployed on **testnet**
- technical documentation explaining the setup and integration flow
- a GitHub repository with a README
- a demo video and project deck for submission

## Technical Documentation

Additional technical documentation will be added in `docs/`, including:
- Attestcoin integration flow
- contract behavior
- scoring logic
- local setup instructions
- testnet deployment notes

## Roadmap

### Phase 1
- finalize architecture
- implement Attestcoin integration
- define the scoring logic

### Phase 2
- build the Creditcoin smart contract
- connect frontend to the verified data flow
- deploy to testnet

### Phase 3
- prepare demo video
- finalize deck or whitepaper
- polish documentation and submission materials

## Team

**Team name:** _To be added_

**Members:**
- _To be added_

## Links

- Project deck / whitepaper: _To be added_
- Demo video: _To be added_
- Testnet deployment: _To be added_
- Repository: _This repository_

## Current Status
Stage 1 is complete: CredLens AI can take a real Ethereum Sepolia transaction hash, generate an Attestcoin proof with the USC SDK, and verify that proof on Creditcoin CC3 Testnet. The verification script currently prints VERIFIED for a valid attested transaction, confirming the proof-of-verification flow works end to end.

Stage 2 complete: verified Sepolia transaction data now flows into a deterministic CredLens AI wallet scoring pipeline, producing a score, label, and reasons from attested inputs.

Status: Completed: created and deployed CredLensScoreRegistry, tested it manually, then wired the scoring pipeline so it writes scores on-chain automatically.


## Notes

This README is the project foundation and will be updated as development progresses.

The project is intentionally scoped to keep the Attestcoin integration central, demonstrable, and submission-ready for the hackathon.
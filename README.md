# CredLens AI

**AI-powered trust scoring on Creditcoin using Attestcoin-verified cross-chain data.**

## Status

Completed and built for **BUIDL CTC 2026 Fall**.

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

## Live Demo

- Frontend: https://oxtejiri.github.io/CredLens-AI/
- Backend: https://credlens-ai-bt2f.onrender.com
- Health check: https://credlens-ai-bt2f.onrender.com/health
- Score endpoint: https://credlens-ai-bt2f.onrender.com/score

## Why CredLens AI

Most wallets are pseudonymous and difficult to assess in a trustworthy way. CredLens AI improves that by using **verifiable transaction evidence** instead of self-reported claims.

The app:
- verifies an Attestcoin-backed transaction on Sepolia
- extracts the linked wallet activity context
- computes a trust score from observed signals
- labels the result for easier interpretation
- writes the score to Creditcoin for durable registry-level visibility

This creates a bridge between **cross-chain proof**, **AI-assisted risk interpretation**, and **credit-oriented onchain infrastructure**.

## Core Features

- **Attestcoin-backed verification** of Sepolia transaction evidence
- **Trust score generation** from wallet-linked activity
- **Creditcoin registry write-back** for persistent recording
- **Simple public frontend** for entering a transaction hash and viewing results
- **Live backend deployment** with production endpoints

## How It Works

1. A user submits a Sepolia transaction hash through the frontend.
2. The backend verifies the transaction against the Attestcoin-backed flow.
3. CredLens AI computes a trust score from the verified wallet context.
4. The result is categorized into a human-readable risk label.
5. The final score is written to the Creditcoin registry.
6. The frontend displays the verification status, wallet, score, label, and registry transaction details.

## Architecture

### Frontend
- Single-file vanilla HTML, CSS, and JavaScript
- Hosted on GitHub Pages
- Sends `POST /score` requests to the deployed backend
- Displays verification and registry-write results in a clean score dashboard

### Backend
- Node.js + TypeScript
- Uses native `node:http` server setup
- Deployed on Render
- Exposes public API endpoints for health checks and scoring
- Handles verification, scoring, and Creditcoin write flow

### Trust Flow
- **Input:** Attestcoin-backed Sepolia transaction hash
- **Verification:** Confirm source transaction and wallet association
- **Scoring:** Compute trust / risk score from verified signals
- **Registry Write:** Persist result to Creditcoin
- **Output:** Structured JSON response for frontend display and downstream integrations

## API

### `GET /health`

Checks whether the backend is live.

Example response:

{
  "ok": true
}

### `POST /score`

Computes and stores a trust score from a verified transaction.

Request body:

{
  "txHash": "0x69779f3eaafd5ce64a43ac030def32961234201dad5c50311dfd260156a9c386"
}

Example response:

{
  "ok": true,
  "result": {
    "verified": true,
    "sourceChain": "sepolia",
    "sourceTxHash": "0x69779f3eaafd5ce64a43ac030def32961234201dad5c50311dfd260156a9c386",
    "wallet": "0x8eDd995Ec2607f838d2D2410410a2e809746C5f6",
    "rawScore": 8,
    "storedScore": 8,
    "label": "Risky",
    "registryTxHash": "0xb7647ac8456f6090e361e6d8c9f77102e2d3d71ac889f3bf3fa6a2f7d6690b29",
    "registryContract": "0x754DDe5EDd19307c777aDCc82Bb4e59a8CaC11e4"
  }
}

## Demo Flow

1. Open the GitHub Pages frontend.
2. Paste a valid Attestcoin-backed Sepolia transaction hash.
3. Click **Verify and Score**.
4. Review the returned verification result.
5. Inspect the wallet, raw score, stored score, label, and registry write details.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, TypeScript
- **Hosting:** GitHub Pages, Render
- **Blockchain context:** Sepolia, Attestcoin, Creditcoin

## Project Status

### Completed
- Backend deployed successfully on Render
- Health endpoint working
- Score endpoint working
- Frontend connected to live backend
- GitHub Pages frontend deployed
- End-to-end scoring flow verified successfully

## Local Development

### Backend

Install dependencies:

npm install

Run the server:

npm run server

### Frontend

Open `index.html` locally or serve it with a simple static server.

## Hackathon Framing

CredLens AI demonstrates how **verified wallet activity** can become a practical trust primitive. Instead of relying on opaque reputation claims, the app uses verifiable transaction evidence and writes a usable credit-oriented signal to Creditcoin.

This makes the project relevant for:
- onchain lending
- borrower screening
- wallet reputation
- trust-based marketplace access
- decentralized identity and risk tooling

## Submission Notes

Built for **BUIDL CTC 2026 Fall**.

CredLens AI combines:
- **Attestcoin** for verifiable activity proof
- **AI trust scoring** for interpretable assessment
- **Creditcoin** for persistent registry-backed score storage

## Author

Built by **OxTEJIRI**.
# CredLens AI — First End-to-End Demo Task List

## Goal
Ship one working end-to-end testnet demo for **CredLens AI**:
- user enters a wallet
- app fetches **Attestcoin-verified** cross-chain data
- scoring engine computes a trust score
- app writes the result to a **Creditcoin testnet** contract
- UI shows the full proof-to-decision flow

## Demo success criteria
The first demo is done only if all of these are true:
- a tester can input one wallet address in the UI
- the backend or integration layer retrieves one verified data payload through Attestcoin
- the app refuses to score if attested data is missing or invalid
- the scoring logic outputs one of: **Trusted**, **Review Needed**, or **Risky**
- the result is written to a Creditcoin testnet contract
- the UI shows the returned score, the attested signal(s), and the transaction reference
- the full flow can be recorded in a short demo video without manual patching

## Build rule
**No attested data, no score, no on-chain decision.**

## Priority order
1. Lock the exact demo flow
2. Prove Attestcoin data retrieval
3. Implement scoring engine
4. Write score to Creditcoin contract
5. Connect everything in a simple frontend
6. Test the full happy path
7. Prepare fallback handling for demo day

## Task list

### 1) Lock demo scope
- [ ] Freeze the first demo to **one wallet → one verified data flow → one score → one on-chain write**
- [ ] Pick the exact wallet activity signals for v1
- [ ] Define the minimum input and output schema
- [ ] Decide the scoring thresholds for Trusted / Review Needed / Risky
- [ ] Write one short demo script describing the happy path

**Definition of done:** everyone on the team can describe the same 60-second product flow without ambiguity.

### 2) Set up repos and environment
- [ ] Create the GitHub repository if not already created
- [ ] Add a clear folder structure for frontend, contract, and integration logic
- [ ] Add `.env.example` with required variables only
- [ ] Set up testnet wallet(s) for deployment and testing
- [ ] Confirm access to Attestcoin docs, SDKs, endpoints, or sample flows
- [ ] Confirm access to Creditcoin testnet RPC, explorer, and deployment flow

**Definition of done:** the project runs locally and every required key, RPC, and endpoint is known.

### 3) Implement Attestcoin verification flow first
- [ ] Choose one Attestcoin-supported data path for the MVP
- [ ] Retrieve one attested payload for a test wallet
- [ ] Parse and normalize the returned data into the app's internal format
- [ ] Verify what fields prove the payload is attested and usable
- [ ] Add a hard failure path when attested data is unavailable
- [ ] Save one sample response for local testing and UI mocking

**Definition of done:** given a wallet input, the app can produce one normalized verified payload or a clean rejection.

### 4) Define the scoring engine
- [ ] Create a simple deterministic scoring formula for v1
- [ ] Map verified signals into numeric weights
- [ ] Convert the numeric result into the three trust labels
- [ ] Add a reason summary explaining why a wallet received that result
- [ ] Add the rule that scoring stops if verified inputs are missing

**Suggested v1 inputs:**
- verified wallet activity level
- verified history depth
- verified behavior consistency

**Definition of done:** the same input always returns the same score and label.

### 5) Build the Creditcoin contract
- [ ] Define the minimum storage structure for wallet score records
- [ ] Add a function to write a score result for a wallet
- [ ] Store the label, numeric score, timestamp, and proof reference if available
- [ ] Add basic access control if needed for the demo writer account
- [ ] Deploy to Creditcoin testnet
- [ ] Verify one successful write from a test script

**Definition of done:** a deployed testnet contract accepts and stores one score record successfully.

### 6) Create the integration script / API layer
- [ ] Build one function that accepts a wallet address
- [ ] Call the Attestcoin retrieval flow
- [ ] Pass normalized verified data into the scoring engine
- [ ] Submit the final result to the Creditcoin contract
- [ ] Return a structured response to the frontend
- [ ] Log each stage for demo visibility and debugging

**Response should include:**
- wallet address
- verified signals used
- score value
- score label
- explanation
- transaction hash or contract reference

**Definition of done:** one command or API call completes the full pipeline end to end.

### 7) Build the simplest possible frontend
- [ ] Create a single-page UI with one wallet input field
- [ ] Add a button to run the analysis
- [ ] Show loading states for fetch, score, and contract write
- [ ] Show attested inputs returned by the system
- [ ] Show the final score and label clearly
- [ ] Show the transaction hash and network status
- [ ] Show a visible error state when attested data is missing

**Definition of done:** a user can trigger and understand the full workflow from one screen.

### 8) Test the happy path end to end
- [ ] Pick one wallet address that is most likely to produce stable demo data
- [ ] Run the complete flow locally
- [ ] Confirm the UI result matches the scored backend result
- [ ] Confirm the on-chain record matches the frontend output
- [ ] Save the transaction hash and screenshots
- [ ] Repeat the full demo at least three times

**Definition of done:** the same demo flow succeeds repeatedly without manual intervention.

### 9) Add demo-safe failure handling
- [ ] Handle invalid wallet input
- [ ] Handle missing or delayed Attestcoin response
- [ ] Handle scoring rejection due to insufficient verified data
- [ ] Handle failed contract write gracefully
- [ ] Prepare one fallback wallet for demo day
- [ ] Prepare one backup recorded run in case testnet is unstable

**Definition of done:** failures are understandable, and none of them crash the demo.

### 10) Prepare proof for submission later
- [ ] Save architecture screenshot(s)
- [ ] Save contract address and explorer link
- [ ] Save one example transaction
- [ ] Keep one clean sample wallet and output for the demo video
- [ ] Record implementation notes while building

**Definition of done:** the team is not reconstructing evidence at the last minute.

## Recommended work breakdown for the first demo

### Critical path
1. Attestcoin verified payload retrieval
2. Scoring logic
3. Creditcoin contract write
4. Frontend wiring
5. Repeatable demo test

### Nice-to-have only if time remains
- [ ] Better score explanation UI
- [ ] Multiple wallets in one session
- [ ] Historical score view
- [ ] More verified signals
- [ ] Better styling and animations

## Suggested owners
- **Integration owner:** Attestcoin retrieval and normalization
- **Protocol owner:** Creditcoin contract and deployment
- **App owner:** frontend and API wiring
- **Product/demo owner:** script, screenshots, and video flow

## First end-to-end demo checklist
Use this right before calling the demo complete:
- [ ] Wallet input works
- [ ] Verified payload is retrieved
- [ ] Missing verification blocks scoring
- [ ] Score is computed
- [ ] Score label is shown
- [ ] Result is written on Creditcoin testnet
- [ ] Transaction hash is visible
- [ ] Demo can be repeated consistently

## Practical note
For this first demo, favor **clarity and reliability over sophistication**. A small flow that proves verified cross-chain data can drive an on-chain AI trust decision is much stronger than a bigger but fragile prototype.
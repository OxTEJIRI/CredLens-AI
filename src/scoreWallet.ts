export type VerificationStatus = "VERIFIED"

export type VerifiedWalletInput = {
  walletAddress: string
  chain: "sepolia"
  verificationStatus: VerificationStatus
  walletAgeDays: number
  txCount30d: number
  uniqueActiveDays30d: number
  totalTxCount: number
  avgTxValueEth: number
}

export type WalletRiskLabel = "Trusted" | "Review Needed" | "Risky"

export type WalletScoreResult = {
  score: number
  label: WalletRiskLabel
  reasons: string[]
}

type RawVerifiedWalletData = {
  walletAddress?: string
  chain?: string
  verificationStatus?: string
  walletAgeDays?: number | string | bigint
  txCount30d?: number | string | bigint
  uniqueActiveDays30d?: number | string | bigint
  totalTxCount?: number | string | bigint
  avgTxValueEth?: number | string | bigint
}

function toSafeNumber(value: number | string | bigint | undefined, fieldName: string): number {
  if (value === undefined) {
    throw new Error(`Missing required field: ${fieldName}`)
  }

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric field: ${fieldName}`)
  }

  if (parsed < 0) {
    throw new Error(`Numeric field cannot be negative: ${fieldName}`)
  }

  return parsed
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

export function normalizeVerifiedData(raw: RawVerifiedWalletData): VerifiedWalletInput {
  if (raw.verificationStatus !== "VERIFIED") {
    throw new Error("No attested data, no score")
  }

  if (!raw.walletAddress) {
    throw new Error("Missing required field: walletAddress")
  }

  return {
    walletAddress: raw.walletAddress,
    chain: "sepolia",
    verificationStatus: "VERIFIED",
    walletAgeDays: toSafeNumber(raw.walletAgeDays, "walletAgeDays"),
    txCount30d: toSafeNumber(raw.txCount30d, "txCount30d"),
    uniqueActiveDays30d: toSafeNumber(raw.uniqueActiveDays30d, "uniqueActiveDays30d"),
    totalTxCount: toSafeNumber(raw.totalTxCount, "totalTxCount"),
    avgTxValueEth: toSafeNumber(raw.avgTxValueEth, "avgTxValueEth")
  }
}

export function scoreWallet(input: VerifiedWalletInput): WalletScoreResult {
  if (input.verificationStatus !== "VERIFIED") {
    throw new Error("No attested data, no score")
  }

  let score = 0
  const reasons: string[] = []

  if (input.walletAgeDays >= 180) {
    score += 25
    reasons.push("Wallet history is older than 180 days")
  } else if (input.walletAgeDays >= 90) {
    score += 18
    reasons.push("Wallet history is older than 90 days")
  } else if (input.walletAgeDays >= 30) {
    score += 10
    reasons.push("Wallet history is at least 30 days old")
  } else {
    reasons.push("Wallet history is still very new")
  }

  if (input.txCount30d >= 20) {
    score += 25
    reasons.push("High recent transaction activity")
  } else if (input.txCount30d >= 10) {
    score += 18
    reasons.push("Solid recent transaction activity")
  } else if (input.txCount30d >= 3) {
    score += 10
    reasons.push("Some recent transaction activity")
  } else {
    reasons.push("Very limited recent transaction activity")
  }

  if (input.uniqueActiveDays30d >= 10) {
    score += 20
    reasons.push("Activity is spread across many days")
  } else if (input.uniqueActiveDays30d >= 5) {
    score += 12
    reasons.push("Activity is reasonably consistent")
  } else if (input.uniqueActiveDays30d >= 2) {
    score += 6
    reasons.push("Activity is somewhat concentrated")
  } else {
    reasons.push("Activity is concentrated into too few days")
  }

  if (input.totalTxCount >= 50) {
    score += 15
    reasons.push("Wallet has a strong lifetime transaction count")
  } else if (input.totalTxCount >= 20) {
    score += 10
    reasons.push("Wallet has a moderate lifetime transaction count")
  } else if (input.totalTxCount >= 5) {
    score += 5
    reasons.push("Wallet has a small but non-trivial lifetime transaction count")
  } else {
    reasons.push("Wallet lifetime transaction count is very low")
  }

  if (input.avgTxValueEth >= 0.01 && input.avgTxValueEth <= 5) {
    score += 15
    reasons.push("Average transaction value is within a healthy activity band")
  } else if (input.avgTxValueEth > 0 && input.avgTxValueEth < 0.01) {
    score += 8
    reasons.push("Average transaction value is small but non-zero")
  } else if (input.avgTxValueEth > 5) {
    score += 8
    reasons.push("Average transaction value is high")
  } else {
    reasons.push("Average transaction value is too close to zero")
  }

  const finalScore = clampScore(score)

  let label: WalletRiskLabel = "Risky"
  if (finalScore >= 70) {
    label = "Trusted"
  } else if (finalScore >= 40) {
    label = "Review Needed"
  }

  return {
    score: finalScore,
    label,
    reasons
  }
}

/*
Example usage:

const rawVerifiedData = {
  walletAddress: "0x1234...abcd",
  chain: "sepolia",
  verificationStatus: "VERIFIED",
  walletAgeDays: 120,
  txCount30d: 14,
  uniqueActiveDays30d: 8,
  totalTxCount: 37,
  avgTxValueEth: 0.12
}

const normalized = normalizeVerifiedData(rawVerifiedData)
const result = scoreWallet(normalized)

console.log(normalized)
console.log(result)
*/
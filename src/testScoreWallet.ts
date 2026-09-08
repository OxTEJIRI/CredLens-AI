import { normalizeVerifiedData, scoreWallet } from "./scoreWallet"

type VerifiedTx = {
  walletAddress: string
  chain: "sepolia"
  verificationStatus: "VERIFIED"
  timestampIso: string
  valueEth: number
}

function buildVerifiedWalletSummary(transactions: VerifiedTx[]) {
  if (transactions.length === 0) {
    throw new Error("No verified transactions provided")
  }

  const first = transactions[0]
  if (!first) {
    throw new Error("No verified transactions provided")
  }

  if (first.verificationStatus !== "VERIFIED") {
    throw new Error("No attested data, no score")
  }

  for (const tx of transactions) {
    if (tx.verificationStatus !== "VERIFIED") {
      throw new Error("No attested data, no score")
    }

    if (tx.walletAddress.toLowerCase() !== first.walletAddress.toLowerCase()) {
      throw new Error("All verified transactions must belong to the same wallet")
    }

    if (tx.chain !== "sepolia") {
      throw new Error("This MVP scorer currently supports Sepolia only")
    }
  }

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const sorted = [...transactions].sort((a, b) => {
    return new Date(a.timestampIso).getTime() - new Date(b.timestampIso).getTime()
  })

  const earliest = sorted[0]
  if (!earliest) {
    throw new Error("No verified transactions provided")
  }

  const earliestTxTime = new Date(earliest.timestampIso).getTime()
  const walletAgeDays = Math.max(
    0,
    Math.floor((now.getTime() - earliestTxTime) / (24 * 60 * 60 * 1000))
  )

  const recentTransactions = transactions.filter((tx) => {
    return new Date(tx.timestampIso).getTime() >= thirtyDaysAgo.getTime()
  })

  const uniqueActiveDays30d = new Set(
    recentTransactions.map((tx) => tx.timestampIso.slice(0, 10))
  ).size

  const totalTxCount = transactions.length
  const txCount30d = recentTransactions.length

  const totalValueEth = transactions.reduce((sum, tx) => sum + tx.valueEth, 0)
  const avgTxValueEth = totalTxCount > 0 ? totalValueEth / totalTxCount : 0

  return {
    walletAddress: first.walletAddress,
    chain: "sepolia" as const,
    verificationStatus: "VERIFIED" as const,
    walletAgeDays,
    txCount30d,
    uniqueActiveDays30d,
    totalTxCount,
    avgTxValueEth
  }
}

const verifiedTransactions: VerifiedTx[] = [
  {
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    chain: "sepolia",
    verificationStatus: "VERIFIED",
    timestampIso: "2026-08-01T10:15:00Z",
    valueEth: 0.12
  },
  {
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    chain: "sepolia",
    verificationStatus: "VERIFIED",
    timestampIso: "2026-08-12T14:30:00Z",
    valueEth: 0.08
  },
  {
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    chain: "sepolia",
    verificationStatus: "VERIFIED",
    timestampIso: "2026-08-28T09:45:00Z",
    valueEth: 0.2
  }
]

const summary = buildVerifiedWalletSummary(verifiedTransactions)
const normalized = normalizeVerifiedData(summary)
const result = scoreWallet(normalized)

console.log("VERIFIED WALLET SUMMARY")
console.log(summary)

console.log("NORMALIZED INPUT")
console.log(normalized)

console.log("SCORE RESULT")
console.log(result)

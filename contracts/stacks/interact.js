/**
 * Ayapay Contract Interaction Script
 * 
 * Sends 50 contract-call transactions to the smart contract:
 *   SP1BMN4D2VW70HZK8CBX08PCNA7MJRA703XDZGNZJ.ayapay
 * 
 * Configured with a gas fee of 0.025 STX (25,000 micro-STX) per transaction.
 * Uses curl via child_process for network calls (bypasses Node.js IPv6 issues).
 */

const crypto = require("crypto");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { 
  makeContractCall, 
  AnchorMode, 
  principalCV, 
  uintCV,
  getAddressFromPrivateKey,
  serializeTransaction
} = require("@stacks/transactions");
const { generateWallet } = require("@stacks/wallet-sdk");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../celo/.env") });

// ── Configuration ───────────────────────────────────────────
const CONTRACT_ADDRESS = "SP1BMN4D2VW70HZK8CBX08PCNA7MJRA703XDZGNZJ";
const CONTRACT_NAME = "ayapay";
const FUNCTION_NAME = "add-employee";
const MNEMONIC = process.env.MNEMONIC;
if (!MNEMONIC) {
  console.error("ERROR: MNEMONIC not found in environment. Set it in ../celo/.env");
  process.exit(1);
}
const TOTAL_TX = 50;
const FEE_MICRO_STX = 25000n; // 0.025 STX
const DELAY_MS = 1500;
const API_BASE = "https://api.mainnet.hiro.so";
const TMP_DIR = path.join(__dirname, ".tx_tmp");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── curl-based helpers ──────────────────────────────────────

function curlGet(url) {
  try {
    const result = execSync(`curl -4 -s --connect-timeout 15 --max-time 30 "${url}"`, { encoding: "utf8" });
    return JSON.parse(result);
  } catch (e) {
    throw new Error(`curl GET failed: ${e.message}`);
  }
}

function curlPostBinary(url, filePath) {
  try {
    const result = execSync(
      `curl -4 -s --connect-timeout 15 --max-time 30 -X POST -H "Content-Type: application/octet-stream" --data-binary @${filePath} "${url}"`,
      { encoding: "utf8" }
    );
    try {
      return JSON.parse(result);
    } catch {
      // The API returns a plain txid string (with quotes)
      return { txid: result.replace(/["\n\r\s]/g, "") };
    }
  } catch (e) {
    throw new Error(`curl POST failed: ${e.message}`);
  }
}

// ── Fetch account nonce ─────────────────────────────────────

function fetchAccountNonce(address) {
  const data = curlGet(`${API_BASE}/extended/v1/address/${address}/nonces`);
  return data.possible_next_nonce;
}

// ── Broadcast transaction ───────────────────────────────────

function broadcastTx(transaction, txNum) {
  const hexPayload = serializeTransaction(transaction);
  // serializeTransaction returns a hex string in v7 — convert to raw bytes
  const serialized = Buffer.from(hexPayload, "hex");
  const tmpFile = path.join(TMP_DIR, `tx_${txNum}.bin`);
  fs.writeFileSync(tmpFile, serialized);
  const result = curlPostBinary(`${API_BASE}/v2/transactions`, tmpFile);
  // Clean up
  try { fs.unlinkSync(tmpFile); } catch {}
  return result;
}

// ── Main ────────────────────────────────────────────────────

async function main() {
  // Create temp directory
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  console.log("═══════════════════════════════════════════════════════");
  console.log("  Ayapay Contract Interaction Script");
  console.log(`  Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`  Total Transactions to Send: ${TOTAL_TX}`);
  console.log(`  Fee per Transaction: 0.025 STX (${FEE_MICRO_STX} micro-STX)`);
  console.log(`  Total Estimated Fees: ${(Number(FEE_MICRO_STX) * TOTAL_TX) / 1_000_000} STX`);
  console.log("═══════════════════════════════════════════════════════\n");

  // 1. Generate wallet and extract private key
  console.log("▸ Generating wallet from mnemonic...");
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: "password",
  });
  const privateKey = wallet.accounts[0].stxPrivateKey;
  const senderAddress = getAddressFromPrivateKey(privateKey);
  console.log(`  Sender Address: ${senderAddress}`);

  // 2. Fetch current nonce via curl
  console.log("\n▸ Fetching current account nonce...");
  let currentNonce;
  try {
    currentNonce = fetchAccountNonce(senderAddress);
    console.log(`  Current nonce: ${currentNonce}`);
  } catch (err) {
    console.error(`  Failed to fetch nonce: ${err.message}. Defaulting to 0.`);
    currentNonce = 0;
  }

  // 3. Build and broadcast transactions
  const results = [];

  for (let i = 0; i < TOTAL_TX; i++) {
    const txNum = i + 1;
    const nonce = currentNonce + i;
    
    // Generate unique dummy addresses for each transaction
    const employeeAddress = getAddressFromPrivateKey(crypto.randomBytes(32));
    const walletAddress = getAddressFromPrivateKey(crypto.randomBytes(32));
    const salary = 1000 + i;

    console.log(`\n── TX ${txNum}/${TOTAL_TX} (nonce: ${nonce}) ──`);
    console.log(`  Employee: ${employeeAddress}`);
    console.log(`  Wallet:   ${walletAddress}`);
    console.log(`  Salary:   ${salary} tokens`);

    try {
      const transaction = await makeContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: FUNCTION_NAME,
        functionArgs: [
          principalCV(employeeAddress),
          principalCV(walletAddress),
          uintCV(salary),
          principalCV(CONTRACT_ADDRESS),
        ],
        senderKey: privateKey,
        nonce: BigInt(nonce),
        fee: FEE_MICRO_STX,
        anchorMode: AnchorMode.Any,
      });

      // Broadcast via curl
      const broadcastResponse = broadcastTx(transaction, txNum);

      if (broadcastResponse.error || broadcastResponse.reason) {
        const errorReason = broadcastResponse.reason || broadcastResponse.error;
        console.log(`  ✗ REJECTED: ${errorReason}`);
        if (broadcastResponse.reason_data) {
          console.log(`    Detail: ${JSON.stringify(broadcastResponse.reason_data)}`);
        }
        results.push({ tx: txNum, status: "failed", reason: errorReason });
      } else if (broadcastResponse.txid) {
        const txid = broadcastResponse.txid;
        console.log(`  ✓ Broadcasted: 0x${txid}`);
        console.log(`    Explorer: https://explorer.hiro.so/txid/0x${txid}?chain=mainnet`);
        results.push({ tx: txNum, status: "success", txid });
      } else {
        console.log(`  ? Unknown:`, JSON.stringify(broadcastResponse));
        results.push({ tx: txNum, status: "unknown", response: broadcastResponse });
      }
    } catch (err) {
      console.log(`  ✗ ERROR: ${err.message}`);
      results.push({ tx: txNum, status: "error", reason: err.message });
    }

    // Delay between broadcasts
    if (i < TOTAL_TX - 1) {
      await sleep(DELAY_MS);
    }
  }

  // 4. Cleanup temp dir
  try { fs.rmdirSync(TMP_DIR, { recursive: true }); } catch {}

  // 5. Print Summary
  const successful = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status !== "success").length;

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  SUMMARY");
  console.log(`  ✓ Successful: ${successful}/${TOTAL_TX}`);
  console.log(`  ✗ Failed:     ${failed}/${TOTAL_TX}`);
  console.log(`  Total Fees:   ${(Number(FEE_MICRO_STX) * successful) / 1_000_000} STX`);
  console.log("═══════════════════════════════════════════════════════");
}

main().catch(console.error);

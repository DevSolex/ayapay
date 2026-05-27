/**
 * Ayapay Mainnet Contract Interaction Script
 * ──────────────────────────────────────────────────────────────
 * Contract: SP1BMN4D2VW70HZK8CBX08PCNA7MJRA703XDZGNZJ.ayapay
 *
 * Usage:
 *   node interact_mainnet.js <command> [args...]
 *
 * Commands:
 *   ── Read-Only (free, no gas) ──────────────────────────────
 *   get-employee <employee-id>                 Get employee details
 *   get-employees                              List all registered employees
 *
 *   ── Employee Management (write, costs gas) ────────────────
 *   add-employee <id> <wallet> <salary> <token>   Add a new employee
 *   remove-employee <id>                           Deactivate an employee
 *
 *   ── Payments (write, costs gas) ───────────────────────────
 *   pay-employee <employee-id> <amount> <token-contract>  Pay employee with SIP-010 token
 *
 * Gas fee: 0.025 STX (25,000 micro-STX) per transaction by default.
 * Override with env var FEE_MICRO_STX.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const {
  makeContractCall,
  AnchorMode,
  principalCV,
  uintCV,
  serializeTransaction,
  getAddressFromPrivateKey,
  cvToJSON,
  hexToCV,
  serializeCV,
  contractPrincipalCV,
} = require("@stacks/transactions");
const { generateWallet } = require("@stacks/wallet-sdk");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../celo/.env") });

// ── Configuration ───────────────────────────────────────────────
const CONTRACT_ADDRESS = "SP1BMN4D2VW70HZK8CBX08PCNA7MJRA703XDZGNZJ";
const CONTRACT_NAME = "ayapay";
const MNEMONIC = process.env.MNEMONIC;
const FEE_MICRO_STX = BigInt(process.env.FEE_MICRO_STX || 25000);
const API_BASE = "https://api.mainnet.hiro.so";
const TMP_DIR = path.join(__dirname, ".tx_tmp");

// ── Helpers ─────────────────────────────────────────────────────

function curlGet(url) {
  try {
    const result = execSync(
      `curl -4 -s --connect-timeout 15 --max-time 30 "${url}"`,
      { encoding: "utf8" }
    );
    return JSON.parse(result);
  } catch (e) {
    throw new Error(`curl GET failed: ${e.message}`);
  }
}

function curlPostJson(url, body) {
  try {
    const escaped = JSON.stringify(body).replace(/'/g, "'\\''");
    const result = execSync(
      `curl -4 -s --connect-timeout 15 --max-time 30 -X POST ` +
        `-H "Content-Type: application/json" ` +
        `-d '${escaped}' "${url}"`,
      { encoding: "utf8" }
    );
    return JSON.parse(result);
  } catch (e) {
    throw new Error(`curl POST JSON failed: ${e.message}`);
  }
}

function curlPostBinary(url, filePath) {
  try {
    const result = execSync(
      `curl -4 -s --connect-timeout 15 --max-time 30 -X POST ` +
        `-H "Content-Type: application/octet-stream" ` +
        `--data-binary @${filePath} "${url}"`,
      { encoding: "utf8" }
    );
    try {
      return JSON.parse(result);
    } catch {
      // API returns a plain txid string (with quotes)
      return { txid: result.replace(/["\\n\\r\s]/g, "") };
    }
  } catch (e) {
    throw new Error(`curl POST binary failed: ${e.message}`);
  }
}

function fetchAccountNonce(address) {
  const data = curlGet(
    `${API_BASE}/extended/v1/address/${address}/nonces`
  );
  return data.possible_next_nonce;
}

function broadcastTx(transaction) {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
  const hexPayload = serializeTransaction(transaction);
  const serialized = Buffer.from(hexPayload, "hex");
  const tmpFile = path.join(TMP_DIR, `tx_${Date.now()}.bin`);
  fs.writeFileSync(tmpFile, serialized);
  const result = curlPostBinary(`${API_BASE}/v2/transactions`, tmpFile);
  try { fs.unlinkSync(tmpFile); } catch {}
  return result;
}

function printHeader(title) {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log(`  ${title}`);
  console.log(`  Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log("═══════════════════════════════════════════════════════════\n");
}

function printResult(response) {
  if (response.error || response.reason) {
    console.log(`\n  ✗ REJECTED: ${response.reason || response.error}`);
    if (response.reason_data) {
      console.log(`    Detail: ${JSON.stringify(response.reason_data)}`);
    }
  } else if (response.txid) {
    const txid = response.txid;
    console.log(`\n  ✓ Transaction broadcasted successfully!`);
    console.log(`    TXID: 0x${txid}`);
    console.log(`    Explorer: https://explorer.hiro.so/txid/0x${txid}?chain=mainnet`);
  } else {
    console.log(`\n  ? Unknown response:`, JSON.stringify(response));
  }
}

// ── Wallet Setup ────────────────────────────────────────────────

async function getWallet() {
  if (!MNEMONIC) {
    console.error("ERROR: MNEMONIC not found in environment. Set it in ../celo/.env");
    process.exit(1);
  }
  const wallet = await generateWallet({
    secretKey: MNEMONIC,
    password: "password",
  });
  const privateKey = wallet.accounts[0].stxPrivateKey;
  const senderAddress = getAddressFromPrivateKey(privateKey);
  return { privateKey, senderAddress };
}

// ── Contract Call Builder ───────────────────────────────────────

async function callContract(functionName, functionArgs, postConditions = []) {
  const { privateKey, senderAddress } = await getWallet();
  console.log(`  Sender: ${senderAddress}`);

  // Fetch nonce
  console.log("  Fetching nonce...");
  let nonce;
  try {
    nonce = fetchAccountNonce(senderAddress);
    console.log(`  Nonce:  ${nonce}`);
  } catch (err) {
    console.error(`  Failed to fetch nonce: ${err.message}`);
    process.exit(1);
  }

  // Build transaction
  console.log(`  Building transaction: ${functionName}...`);
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    senderKey: privateKey,
    nonce: BigInt(nonce),
    fee: FEE_MICRO_STX,
    anchorMode: AnchorMode.Any,
  };
  if (postConditions.length > 0) {
    txOptions.postConditions = postConditions;
  }
  const transaction = await makeContractCall(txOptions);

  // Broadcast
  console.log("  Broadcasting to Stacks Mainnet...");
  const response = broadcastTx(transaction);
  printResult(response);
  return response;
}

// ── Read-Only Call Helper ───────────────────────────────────────

function readOnlyCall(functionName, args = []) {
  const body = {
    sender: CONTRACT_ADDRESS,
    arguments: args,
  };
  return curlPostJson(
    `${API_BASE}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/${functionName}`,
    body
  );
}

// ═══════════════════════════════════════════════════════════════
//  COMMAND IMPLEMENTATIONS
// ═══════════════════════════════════════════════════════════════

// ── Read-Only Commands ──────────────────────────────────────────

async function cmdGetEmployee(employeeId) {
  printHeader("Get Employee");
  if (!employeeId) {
    console.error("  ✗ Usage: get-employee <employee-principal>");
    process.exit(1);
  }
  console.log(`  Employee ID: ${employeeId}`);
  console.log("  Querying contract...\n");

  const argHex = serializeCV(principalCV(employeeId));
  const result = readOnlyCall("get-employee", [argHex]);

  if (result.okay) {
    const decoded = cvToJSON(hexToCV(result.result));
    // optional(none) check
    if (!decoded.value || decoded.value === null || decoded.type.includes("none")) {
      console.log("  ✗ Employee not found");
    } else {
      // optional(tuple(...)) has nested .value: decoded.value is the optional wrapper,
      // decoded.value.value is the actual tuple fields
      const emp = decoded.value.value || decoded.value;
      console.log("  ✓ Employee Details:");
      console.log("  ┌─────────────────────────────────────────────────────");
      console.log(`  │ Wallet:  ${emp.wallet.value}`);
      console.log(`  │ Salary:  ${emp.salary.value}`);
      console.log(`  │ Token:   ${emp.token.value}`);
      console.log(`  │ Active:  ${emp.active.value ? "Yes ✓" : "No ✗"}`);
      console.log("  └─────────────────────────────────────────────────────");
    }
  } else {
    console.log(`  ✗ Error: ${result.cause}`);
  }
}

async function cmdGetEmployees() {
  printHeader("Get All Employees");
  console.log("  Querying contract...\n");

  const result = readOnlyCall("get-employees");

  if (result.okay) {
    const decoded = cvToJSON(hexToCV(result.result));
    const employees = decoded.value;
    if (!employees || employees.length === 0) {
      console.log("  No employees registered.");
    } else {
      console.log(`  ✓ Found ${employees.length} employee(s):\n`);
      console.log("  ┌────┬──────────────────────────────────────────────────");
      employees.forEach((emp, i) => {
        const addr = emp.value || emp;
        console.log(`  │ ${String(i + 1).padStart(2, " ")} │ ${addr}`);
      });
      console.log("  └────┴──────────────────────────────────────────────────");
    }
  } else {
    console.log(`  ✗ Error: ${result.cause}`);
  }
}

// ── Employee Management Commands ────────────────────────────────

async function cmdAddEmployee(employeeId, wallet, salary, token) {
  printHeader("Add Employee");
  if (!employeeId || !wallet || !salary || !token) {
    console.error("  ✗ Usage: add-employee <employee-id> <wallet> <salary> <token-principal>");
    console.error("");
    console.error("  Example:");
    console.error("    node interact_mainnet.js add-employee \\");
    console.error("      SP2ABC...XYZ \\        # employee ID");
    console.error("      SP2DEF...UVW \\        # wallet to receive salary");
    console.error("      1000000 \\             # salary amount");
    console.error("      SP1BMN...ZJ.token     # token contract");
    process.exit(1);
  }
  console.log("  ┌─────────────────────────────────────────────────────");
  console.log(`  │ Employee ID: ${employeeId}`);
  console.log(`  │ Wallet:      ${wallet}`);
  console.log(`  │ Salary:      ${salary}`);
  console.log(`  │ Token:       ${token}`);
  console.log("  └─────────────────────────────────────────────────────\n");

  await callContract("add-employee", [
    principalCV(employeeId),
    principalCV(wallet),
    uintCV(salary),
    principalCV(token),
  ]);
}

async function cmdRemoveEmployee(employeeId) {
  printHeader("Remove Employee");
  if (!employeeId) {
    console.error("  ✗ Usage: remove-employee <employee-id>");
    process.exit(1);
  }
  console.log(`  Employee ID: ${employeeId}\n`);
  await callContract("remove-employee", [principalCV(employeeId)]);
}

// ── Payment Commands ────────────────────────────────────────────

async function cmdPayEmployee(employeeId, amount, tokenContract) {
  printHeader("Pay Employee (SIP-010 Token)");
  if (!employeeId || !amount || !tokenContract) {
    console.error("  ✗ Usage: pay-employee <employee-id> <amount> <token-contract>");
    console.error("");
    console.error("  The <token-contract> must be a fully qualified contract principal,");
    console.error("  e.g. SP1BMN4D2VW70HZK8CBX08PCNA7MJRA703XDZGNZJ.token-name");
    process.exit(1);
  }

  // Parse contract principal (ADDRESS.CONTRACT-NAME)
  const parts = tokenContract.split(".");
  if (parts.length !== 2) {
    console.error("  ✗ Invalid token contract format. Expected: ADDRESS.CONTRACT-NAME");
    process.exit(1);
  }

  console.log("  ┌─────────────────────────────────────────────────────");
  console.log(`  │ Employee ID:     ${employeeId}`);
  console.log(`  │ Amount:          ${amount}`);
  console.log(`  │ Token Contract:  ${tokenContract}`);
  console.log("  └─────────────────────────────────────────────────────\n");

  await callContract("pay-employee", [
    principalCV(employeeId),
    uintCV(amount),
    contractPrincipalCV(parts[0], parts[1]),
  ]);
}

// ── Help ────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║            Ayapay Mainnet Contract Interaction Script             ║
║     SP1BMN4D2VW70HZK8CBX08PCNA7MJRA703XDZGNZJ.ayapay           ║
╚═══════════════════════════════════════════════════════════════════╝

Usage: node interact_mainnet.js <command> [args...]

── Read-Only (free, no gas) ───────────────────────────────────────
  get-employee <employee-id>                  Get employee details
  get-employees                               List all registered employees

── Employee Management (costs gas) ────────────────────────────────
  add-employee <id> <wallet> <salary> <token> Register new employee
  remove-employee <id>                        Deactivate an employee

── Payments (costs gas) ───────────────────────────────────────────
  pay-employee <id> <amount> <token-contract> Pay employee with SIP-010 token
    token-contract format: SP1BMN...ZJ.token-name

── Configuration ──────────────────────────────────────────────────
  Fee: ${Number(FEE_MICRO_STX) / 1_000_000} STX per write transaction
  Override with env var FEE_MICRO_STX (in micro-STX)
  Mnemonic loaded from: ../celo/.env
`);
}

// ── Router ──────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  switch (command) {
    // Read-only
    case "get-employee":
      await cmdGetEmployee(args[1]);
      break;
    case "get-employees":
      await cmdGetEmployees();
      break;

    // Employee management
    case "add-employee":
      await cmdAddEmployee(args[1], args[2], args[3], args[4]);
      break;
    case "remove-employee":
      await cmdRemoveEmployee(args[1]);
      break;

    // Payments
    case "pay-employee":
      await cmdPayEmployee(args[1], args[2], args[3]);
      break;

    default:
      console.error(`  ✗ Unknown command: "${command}"\n`);
      printUsage();
      process.exit(1);
  }
}

main().catch(console.error);

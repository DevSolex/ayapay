const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { STACKS_TESTNET } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../celo/.env') });

async function deployContract() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) { console.error('ERROR: MNEMONIC not set in .env'); process.exit(1); }
  
  console.log("Generating wallet from mnemonic...");
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: 'password'
  });
  
  // Extract the private key for the first account (wallet-sdk v7 API)
  const privateKey = wallet.accounts[0].stxPrivateKey;
  
  // Setup Testnet network configuration (network v7 uses constants)
  const network = STACKS_TESTNET;
  const codeBody = fs.readFileSync(path.join(__dirname, './contracts/ayapay.clar'), 'utf8');

  const txOptions = {
    contractName: 'ayapay',
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  console.log("Creating and signing contract deployment transaction...");
  const transaction = await makeContractDeploy(txOptions);
  
  console.log("Broadcasting to Stacks Testnet...");
  const broadcastResponse = await broadcastTransaction({ transaction, network });
  
  console.log("Broadcast Response:", broadcastResponse);
  if (broadcastResponse.txid) {
    console.log(`Transaction successfully broadcasted! View it on the explorer:`);
    console.log(`https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
  }
}

deployContract().catch(console.error);

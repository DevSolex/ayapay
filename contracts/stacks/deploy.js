const { makeContractDeploy, broadcastTransaction, AnchorMode } = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const { generateWallet } = require('@stacks/wallet-sdk');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../celo/.env') });

async function deployContract() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) { console.error('ERROR: MNEMONIC not set in .env'); process.exit(1); }
  
  const wallet = await generateWallet({
    secretKey: mnemonic,
    password: 'password'
  });
  
  const account = wallet.identities[0].coinbases[0]; // Or appropriate derive path
  const privateKey = wallet.identities[0].privateKey; // Simplification, need actual format
  
  const network = new StacksTestnet();
  const codeBody = fs.readFileSync('./contracts/ayapay.clar', 'utf8');

  const txOptions = {
    contractName: 'ayapay',
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
  };

  const transaction = await makeContractDeploy(txOptions);
  const broadcastResponse = await broadcastTransaction(transaction, network);
  
  console.log("Broadcast Response:", broadcastResponse);
}

deployContract().catch(console.error);

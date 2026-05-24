const {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} = require('@stacks/transactions');
const { StacksTestnet } = require('@stacks/network');
const fs = require('fs');
const path = require('path');

async function deployContract() {
  // Read private key from environment or prompt
  const privateKey = process.env.STACKS_ADMIN_PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ ERROR: STACKS_ADMIN_PRIVATE_KEY not set in environment');
    console.log('\nTo deploy:');
    console.log('1. Generate a Stacks wallet at https://www.hiro.so/wallet');
    console.log('2. Get testnet STX from https://explorer.hiro.so/sandbox/faucet?chain=testnet');
    console.log('3. Export your private key from Hiro Wallet');
    console.log('4. Set STACKS_ADMIN_PRIVATE_KEY in your .env file');
    console.log('5. Run: node deploy-testnet.js');
    process.exit(1);
  }

  const network = new StacksTestnet();
  
  // Read contract source
  const contractPath = path.join(__dirname, 'contracts', 'ayapay.clar');
  const codeBody = fs.readFileSync(contractPath, 'utf8');

  console.log('📝 Deploying AyaPay contract to Stacks Testnet...');
  console.log('📄 Contract:', contractPath);
  console.log('🌐 Network:', network.coreApiUrl);

  const txOptions = {
    contractName: 'ayapay',
    codeBody,
    senderKey: privateKey,
    network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
  };

  try {
    const transaction = await makeContractDeploy(txOptions);
    console.log('📤 Broadcasting transaction...');
    
    const broadcastResponse = await broadcastTransaction(transaction, network);
    
    if (broadcastResponse.error) {
      console.error('❌ Deployment failed:', broadcastResponse.error);
      if (broadcastResponse.reason) {
        console.error('Reason:', broadcastResponse.reason);
      }
      process.exit(1);
    }

    console.log('✅ Contract deployed successfully!');
    console.log('📋 Transaction ID:', broadcastResponse.txid);
    console.log('🔗 View on explorer:', `https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    console.log('\n📝 Update your .env file with:');
    console.log(`STACKS_CONTRACT_ADDRESS=<your-stacks-address>`);
    console.log(`STACKS_CONTRACT_NAME=ayapay`);
    
  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

deployContract().catch(console.error);

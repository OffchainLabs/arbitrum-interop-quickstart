const {utils, providers, Wallet} = require("ethers");
const { Bridge} = require("arb-ts") 
const { expect } = require("chai");
const { parseEther } = utils


require('dotenv').config();

const main = async () => {

    const infuraKey = process.env.INFURA_KEY
    if(!infuraKey) throw new Error("No INFURA_KEY set.")

    const walletPrivateKey = process.env.DEVNET_PRIVKEY
    if(!walletPrivateKey) throw new Error("No DEVNET_PRIVKEY set.")


    const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC)
    const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC)

    
    const preFundedWallet = new Wallet(walletPrivateKey, l1Provider)
    const l2Wallet = new Wallet(walletPrivateKey, l2Provider)
    
    
    const L2initialbalance = await l2Wallet.getBalance()



    const bridge = new Bridge(
        process.env.L1EthErc20BridgeAddress,
        process.env.L2ArbTokenBridgeAddress,
        preFundedWallet,
        l2Wallet
    )
    
    const ethToL2DepositAmount = parseEther('0.0001')
       
    
    const initialInboxBalance = await l1Provider.getBalance(process.env.INBOX_ADDR)
    const tx = await bridge.depositETH(ethToL2DepositAmount)
    const rec = await tx.wait()
    expect(rec.status).to.equal(1)

    const finalInboxBalance = await l1Provider.getBalance(process.env.INBOX_ADDR)
    expect(initialInboxBalance.add(ethToL2DepositAmount).eq(finalInboxBalance))
 

    walletL2EthBalance = await bridge.getAndUpdateL2EthBalance()
    expect(L2initialbalance.add(ethToL2DepositAmount).eq(walletL2EthBalance))
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  }); 
import { connect, disconnect } from 'starknetkit'
import { erc20abi } from '../assets/erc20abi.json'

const ERC20_ABI = erc20abi
// Pragma configs
async function connectWallet() {
    return await connect({ webWalletUrl: "https://web.argent.xyz" })
}

async function disconnectWallet() {
    await disconnect()
}

export const RPC_ENDPOINT = "http://localhost:5050"
export const URLS: any = {
    contract_testnet: "https://testnet.starkscan.co/contract/",
    contract_mainnet: "https://starkscan.co/contract/",
    class_testnet: "https://testnet.starkscan.co/class/",
    clas_mainnet: "https://starkscan.co/class/",
    tx_testnet: "https://testnet.starkscan.co/tx/",
    tx_mainnet: "https://starkscan.co/tx/",
    abi_endpoint: "http://localhost:8000/api/abi",
}

// export {contract, provider, account}
export { disconnectWallet, ERC20_ABI }
export default connectWallet 

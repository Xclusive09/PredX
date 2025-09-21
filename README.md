# 🚀 Hackathon React + BlockDAG DApp Starter

This repository provides a **ready-to-use React app** with **TailwindCSS**, **Lucide Icons**, **Web3.js**, and a sample **MyToken smart contract** integration for the **BlockDAG EVM-compatible network**.  
It is designed to help hackathon participants **quickly build and test DApps** without worrying about setup.

---

## ✨ Features

- ⚡ React 18 + Vite for fast development
- 🎨 TailwindCSS for styling
- 🖼️ Lucide React Icons for UI enhancements
- 🔗 Web3.js for blockchain interaction
- 🦊 MetaMask integration as the primary wallet
- 📄 ABI + contract setup example (`MyToken.sol`)
- 🛠️ Configurable for any **EVM-compatible chain** (including BlockDAG)

---

## 📦 Prerequisites

Before starting, ensure you have installed:

- [Node.js](https://nodejs.org/) (>= 18.x recommended)
- [MetaMask](https://metamask.io/) browser extension
- A BlockDAG **testnet RPC endpoint** (provided by organizers)

---

## 🛠️ Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/<your-org>/blockdag-dapp-starter.git
cd blockdag-dapp-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory and add:

```env
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddressHere
VITE_NETWORK_ID=1234 # Optional: BlockDAG Chain ID
VITE_RPC_URL=https://blockdag-testnet-rpc-url
```

Organizers will provide the deployed test contract address.

---

## 📄 Contract (MyToken)

We included a sample ERC-20 style contract with ERC-2612 Permit support:

```solidity
// contracts/MyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MyToken is ERC20, ERC20Permit {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {}
}
```

This contract is already deployed on the BlockDAG testnet.
Participants can:

- Read token name, symbol, and balance
- Call transfer() and other ERC-20 methods
- Use ERC-2612 permit() for gasless approvals

---

## 🖥️ Running the App

Start the local dev server:

```bash
npm run dev
```

Visit: http://localhost:5173

---

## 📌 Usage Flow

1. Open the app in your browser
2. Click Connect Wallet (MetaMask popup will appear)
3. Ensure you are connected to the BlockDAG Testnet:
   - RPC URL: https://rpc.blockdag.network
   - Chain ID: (to be provided by organizers)
4. Interact with the MyToken contract via UI

---

## 📁 Project Structure

```
src/
 ├─ components/
 │   └─ ConnectWalletButton.jsx   # Wallet connection UI component
 ├─ hooks/
 │   └─ useContract.js            # Custom hook for contract interactions
 ├─ contracts/
 │   ├─ MyToken.json              # ABI file for the contract
 │   └─ MyToken.sol               # Solidity source for reference
 ├─ App.jsx                       # Main application component
 ├─ main.jsx                      # Application entry point
 └─ index.css                     # Tailwind setup and global styles
```

### Component Details

#### App.jsx

The main application component that:

- Manages wallet connection state
- Handles token balance fetching
- Displays the UI for wallet and token information

#### ConnectWalletButton.jsx

A reusable component that:

- Handles MetaMask connection
- Displays connected account info
- Provides copy address and disconnect functionality
- Shows helpful notifications for connection status

#### useContract.js

A custom hook that:

- Creates an interface to the smart contract
- Provides methods for all contract functions
- Includes utility methods for formatting balances

---

## 🔧 Future Extensions

Participants can extend the starter by:

- Adding new contract interactions (e.g., NFT minting, DAO voting)
- Supporting multiple wallets (WalletConnect, Coinbase Wallet)
- Using state management (Zustand/Recoil/Redux) for bigger apps
- Adding transaction status & notifications
- Building a transfer form for token transactions
- Implementing a token swap interface

---

## 📚 Resources

- [BlockDAG Documentation](https://docs.blockdag.network)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## 📝 License

MIT

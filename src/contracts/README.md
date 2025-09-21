# BlockDAG Prediction Market DApp

This repository provides a full-stack DApp template for building on the **BlockDAG network**. It features a complete Prediction Market application where users can bet on the outcomes of sports and gaming events using a custom ERC20 token.

This template is designed to be a robust starting point for developers looking to build their own decentralized applications on BlockDAG.

 <!-- It's recommended to replace this with an actual screenshot of your DApp -->

## ✨ Features

- **Wallet Integration**: Connects to MetaMask (`window.ethereum`).
- **Network Management**: Automatically detects the user's network and prompts them to switch to the BlockDAG Testnet (Chain ID: 1043).
- **Dynamic Market Creation**: The contract owner can create new prediction markets with custom questions, categories, end times, and a variable number of outcomes (2-5).
- **Bet Placement**: Users can approve and spend a custom ERC20 token (`DemoBetToken`) to place bets on their predicted outcomes.
- **Market Resolution**: The contract owner can resolve markets and set the winning outcome.
- **Claim Winnings**: Users can claim their share of the prize pool if they bet on the correct outcome.
- **Real-time Data**: The frontend fetches and displays all market data, including total pools, individual outcome pools, and the user's specific bets.
- **Modern UI/UX**: A clean, responsive interface built with React, Framer Motion for animations, and Lucide for icons.
- **Robust Contract Interaction**: The `useContract` hook provides a resilient and well-structured way to interact with smart contracts, including retries and error handling.

## 🛠️ Tech Stack

- **Frontend**:
  - React
  - Vite - Next-generation frontend tooling
  - Web3.js - Ethereum JavaScript API
  - Framer Motion - Animations in React
  - Lucide React - Icon library

- **Smart Contract**:
  - Solidity
  - OpenZeppelin Contracts - For `Ownable` and `IERC20`.

- **Blockchain**:
  - **BlockDAG Testnet**
    - Chain ID: `1043`
    - RPC URL: `https://rpc.blockdag.network`

## 🚀 Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

- Node.js (v18 or later)
- MetaMask browser extension

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/Blockdag-dapp-template.git
    cd Blockdag-dapp-template
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    *(or `yarn install`, `pnpm install`)*

3.  **Configure your environment:**

    Create a `.env.local` file in the root of the project by copying the example `.env` file. The `.gitignore` file is already configured to ignore `.env.local`.

    ```bash
    cp .env .env.local
    ```

    Your `.env.local` file should look like this:

    ```
    VITE_NETWORK_ID=1043
    VITE_RPC_URL=https://rpc.primordial.bdagscan.com
    VITE_BETTING_CONTRACT_ADDRESS=0x102a22Ef61b260882BEc7CeD34D57F614EA3c77f
    VITE_TOKEN_CONTRACT_ADDRESS=0x204a8FEAac53cf5Ec885feC07d924180B8aCBA46

    # This is only needed for deployment scripts, not for running the DApp frontend.
    # For security, use a burner wallet and never commit this file.
    PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY
    ```

    > **⚠️ Security Warning:**
    > Never commit your `.env.local` file or expose your private keys in a public repository. The `PRIVATE_KEY` is typically used for deployment scripts and is not required for the frontend to function if you are just interacting with already deployed contracts.

### Running the DApp

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open your browser** and navigate to the local URL provided (usually `http://localhost:5173`).

3.  **Connect your MetaMask wallet.** The DApp will prompt you to switch to the BlockDAG Testnet if you are on a different network.

## 📝 Smart Contract Details

The core logic resides in `src/contracts/SportsGamingBetting.sol`.

### Key Components

- **`Market` Struct**: Defines the structure for each prediction market, including its question, end time, outcome pools, and resolution status.
- **`createMarket()`**: An `onlyOwner` function to create new markets.
- **`placeBet()`**: Allows any user to place a bet. It handles the ERC20 token transfer.
- **`resolveMarket()`**: An `onlyOwner` function to resolve a market and set the winning outcome.
- **`claimWinnings()`**: Allows users who bet on the correct outcome to claim their winnings. A 2% fee is deducted from the total pool and presumably goes to the contract owner (though the fee withdrawal mechanism is not implemented in this version).
- **`getAllMarkets()`**: A view function that returns all market data. This is inefficient for a large number of markets and is a good candidate for optimization in a production environment (e.g., using subgraphs or events).

## 📁 Project Structure

```
Blockdag-dapp-template/
├── public/
├── src/
│   ├── components/     # React UI components
│   │   └── CreateMarket.jsx
│   ├── contracts/      # Solidity files and ABIs
│   │   ├── SportsGamingBetting.sol
│   │   ├── SportsGamingBetting.json
│   │   └── DemoBetToken.json
│   ├── hooks/          # Custom React hooks
│   │   └── useContract.js  # Core Web3 logic
│   ├── App.jsx
│   └── main.jsx
├── .env                # Example environment variables
├── .gitignore
└── README.md
```

### Key Files

- **`src/hooks/useContract.js`**: This is the heart of the DApp's frontend logic. It handles:
  - Initializing Web3 and contract instances.
  - Checking for the correct network and prompting a switch.
  - Providing helper functions to read from and write to the smart contracts.
  - Managing loading states for transactions.

- **`src/contracts/SportsGamingBetting.sol`**: The main smart contract that governs the prediction market logic.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
# BlockDAG Prediction Market DApp

A full-stack decentralized application (DApp) template for building on the BlockDAG network. This Prediction Market DApp enables users to bet on outcomes of sports and gaming events using a custom ERC-20 token (DemoBetToken, MTK). Designed as a robust starting point, this template empowers developers to create innovative decentralized applications on BlockDAG.

## ✨ Features

- **Wallet Integration**: Seamlessly connects to MetaMask (`window.ethereum`) for user authentication
- **Network Management**: Automatically detects the user's network and prompts a switch to BlockDAG Testnet (Chain ID: 1043)
- **Dynamic Market Creation**: Contract owners can create markets with custom questions, categories (Sports/Gaming), end times, and 2-5 outcomes
- **Bet Placement**: Users can approve and spend MTK tokens to bet on predicted outcomes, with 1000 MTK automatically distributed as a starter amount on their first bet
- **Market Resolution**: Contract owners can resolve markets and designate the winning outcome
- **Claim Winnings**: Users can claim their share of the prize pool (minus a 2% fee) if they bet correctly
- **Real-time Data**: Frontend fetches and displays market data, including total pools, outcome pools, and user-specific bets
- **Modern UI/UX**: Built with React, enhanced by Framer Motion animations and Lucide icons for a responsive, engaging interface
- **Robust Contract Interaction**: The `useContract` hook provides resilient contract interactions with retries and error handling

## 🛠️ Tech Stack

### Frontend
- **React**: Component-based UI framework
- **Vite**: Next-generation frontend tooling for fast development
- **Web3.js**: Ethereum JavaScript API for blockchain interaction
- **Framer Motion**: Smooth animations in React
- **Lucide React**: Icon library for visual elements

### Smart Contract
- **Solidity**: Language for smart contract development
- **OpenZeppelin Contracts**: Provides `Ownable` and `IERC20` for security and standards

### Blockchain
- **BlockDAG Testnet**: High-throughput network (Chain ID: 1043)
- **RPC URL**: `https://rpc.blockdag.network` (fallback: `https://rpc.primordial.bdagscan.com`)

## 🚀 Getting Started

Follow these steps to set up and run a local copy of the DApp.

### Prerequisites
- **Node.js**: Version 20.19+ or 22.12+ (check with `node -v`)
- **MetaMask**: Browser extension for wallet connectivity

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Blockdag-dapp-template.git
   cd Blockdag-dapp-template
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment**:
    - Copy the example `.env` file to `.env.local`:
      ```bash
      cp .env .env.local
      ```
    - Edit `.env.local` with your settings:
      ```
      VITE_NETWORK_ID=1043
      VITE_RPC_URL=https://rpc.primordial.bdagscan.com
      VITE_BETTING_CONTRACT_ADDRESS=    # Insert SportsGamingBetting contract address here
      VITE_TOKEN_CONTRACT_ADDRESS=      # Insert DemoBetToken contract address here
      
      # Optional for deployment scripts (not required for frontend)
      # Use a burner wallet and never commit this file
      PRIVATE_KEY=                      # Insert deployer private key here
      ```

> **Security Warning**: Never commit `.env.local` or expose private keys in a public repository. The `PRIVATE_KEY` is only for deployment scripts.

### Running the DApp

1. **Start the Development Server**:
   ```bash
   npm run dev
   ```

2. **Access the DApp**:
    - Open your browser to the provided URL (e.g., `http://localhost:5173` or `5174` if port 5173 is in use)
    - Connect your MetaMask wallet and switch to BlockDAG Testnet if prompted

## 📝 Smart Contract Details

The core logic is implemented in `src/contracts/SportsGamingBetting.sol`.

### Key Components

- **Market Struct**: Defines each market with a question, category, end time, outcome pools, resolution status, and user bets
- **createMarket()**: Owner-only function to create new markets with 2-5 outcomes
- **placeBet()**: Allows users to bet with MTK, automatically distributing 1000 MTK as a starter amount on first use
- **resolveMarket()**: Owner-only function to set the winning outcome
- **claimWinnings()**: Enables winners to claim payouts (2% fee deducted, retained by the contract)
- **getAllMarkets()**: View function returning all market data (note: inefficient for large datasets; consider optimization with subgraphs in production)

## 📁 Project Structure

```
Blockdag-dapp-template/
├── public/                  # Static assets
├── src/
│   ├── components/          # React UI components
│   │   └── CreateMarket.jsx
│   ├── contracts/           # Solidity files and ABIs
│   │   ├── SportsGamingBetting.sol
│   │   ├── SportsGamingBetting.json
│   │   └── DemoBetToken.json
│   ├── hooks/               # Custom React hooks
│   │   └── useContract.js   # Web3 interaction logic
│   ├── App.jsx
│   └── main.jsx
├── .env                    # Example environment variables
├── .gitignore
└── README.md
```

### Key Files

- **src/hooks/useContract.js**: Core frontend logic for:
    - Initializing Web3 and contract instances
    - Network detection and switching to Chain ID 1043
    - Helper functions for contract reads/writes with error handling

- **src/contracts/SportsGamingBetting.sol**: Main contract governing prediction market logic

## 📜 License

This project is licensed under the MIT License. See the LICENSE file for details.

---

### Notes
- Update your `.env.local` with deployed contract addresses after redeployment, then test the DApp
- The content reflects the 1000 MTK starter token feature and aligns with your product's current state
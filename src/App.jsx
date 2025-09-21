import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Wallet, Home, TrendingUp, Eye, Trophy, Settings, ChevronRight, Sparkles } from 'lucide-react';
import ConnectWalletButton from './components/ConnectWalletButton';
import Dashboard from './components/Dashboard';
import CreateMarket from './components/CreateMarket';
import ViewMarkets from './components/ViewMarkets';
import LoadingScreen from './components/LoadingScreen';
import Navigation from './components/Navigation';
import ConnectionTest from './components/ConnectionTest';

import { verifyContracts } from './utils/contractVerifier';

const STAGES = {
  LOADING: 'loading',
  WALLET_CONNECT: 'wallet_connect',
  DASHBOARD: 'dashboard',
  CREATE_MARKET: 'create_market',
  VIEW_MARKETS: 'view_markets',
};

// Key for localStorage to track disconnect state
const WALLET_DISCONNECT_KEY = 'wallet_disconnected';

function App() {
  const [currentStage, setCurrentStage] = useState(STAGES.LOADING);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    // Check if wallet was manually disconnected
    const checkWalletConnection = async () => {
      const wasDisconnected = localStorage.getItem(WALLET_DISCONNECT_KEY);

      if (wasDisconnected === 'true') {
        // If user manually disconnected, go straight to wallet connect
        localStorage.removeItem(WALLET_DISCONNECT_KEY);
        setTimeout(() => setCurrentStage(STAGES.WALLET_CONNECT), 2000);
        return;
      }

      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsConnected(true);
            setTimeout(() => setCurrentStage(STAGES.DASHBOARD), 2000);
          } else {
            setTimeout(() => setCurrentStage(STAGES.WALLET_CONNECT), 2000);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          setTimeout(() => setCurrentStage(STAGES.WALLET_CONNECT), 2000);
        }
      } else {
        setTimeout(() => setCurrentStage(STAGES.WALLET_CONNECT), 2000);
      }
    };

    checkWalletConnection();
  }, []);

  const handleWalletConnect = (connectedAccount) => {
    setAccount(connectedAccount);
    setIsConnected(true);
    // Clear disconnect flag when connecting
    localStorage.removeItem(WALLET_DISCONNECT_KEY);
    setTimeout(() => setCurrentStage(STAGES.DASHBOARD), 500);
  };

  const handleWalletDisconnect = async () => {
    try {
      // Mark as manually disconnected
      localStorage.setItem(WALLET_DISCONNECT_KEY, 'true');

      // Clear application state
      setAccount(null);
      setIsConnected(false);

      // Try to disconnect from MetaMask if possible
      if (typeof window.ethereum !== 'undefined' && window.ethereum.selectedAddress) {
        // Some wallets support wallet_requestPermissions to reset permissions
        try {
          // Request permissions again (this can help reset the connection state)
          await window.ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }]
          });
        } catch (permissionError) {
          // If permission request fails, that's okay - we'll still disconnect locally
          console.log('Permission reset not supported or failed:', permissionError);
        }
      }

      // Clear any cached connection data
      if (typeof window.ethereum !== 'undefined') {
        // Remove event listeners to prevent auto-reconnection
        window.ethereum.removeAllListeners();
      }

      // Navigate back to wallet connect stage
      setCurrentStage(STAGES.WALLET_CONNECT);

      // Show disconnect confirmation
      console.log('Wallet disconnected successfully');

    } catch (error) {
      console.error('Error during disconnect:', error);
      // Even if there's an error, still disconnect locally
      setAccount(null);
      setIsConnected(false);
      setCurrentStage(STAGES.WALLET_CONNECT);
    }
  };
  const checkContracts = async () => {
    const isValid = await verifyContracts();
    if (!isValid) {
      console.error('⚠️  Contract verification failed!');
    }
  };

  checkContracts();



  const navigateToStage = (stage) => {
    setCurrentStage(stage);
  };

  const renderContent = () => {
    switch (currentStage) {
      case STAGES.LOADING:
        return <LoadingScreen />;

      case STAGES.WALLET_CONNECT:
        return <WalletConnectStage onConnect={handleWalletConnect} />;

      case STAGES.DASHBOARD:
        return (
            <Dashboard
                account={account}
                onNavigate={navigateToStage}
                onDisconnect={handleWalletDisconnect}
            />
        );

      case STAGES.CREATE_MARKET:
        return <CreateMarket account={account} onBack={() => navigateToStage(STAGES.DASHBOARD)} />;

      case STAGES.VIEW_MARKETS:
        return <ViewMarkets account={account} onBack={() => navigateToStage(STAGES.DASHBOARD)} />;

      default:
        return <LoadingScreen />;
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AnimatePresence mode="wait">
          <motion.div
              key={currentStage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="min-h-screen"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation - only show after wallet connect */}
        {isConnected && currentStage !== STAGES.LOADING && currentStage !== STAGES.WALLET_CONNECT && (
            <Navigation
                currentStage={currentStage}
                onNavigate={navigateToStage}
                onDisconnect={handleWalletDisconnect}
            />
        )}
      </div>
  );
}

// Wallet Connect Stage Component
const WalletConnectStage = ({ onConnect }) => {
  return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-md w-full"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Welcome to PredictDAG
              </h1>
              <p className="text-gray-300 text-lg">
                Connect your wallet to start trading predictions
              </p>
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
            >
              <ConnectWalletButton onConnect={onConnect} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6 text-center"
            >
              <p className="text-sm text-gray-400">
                New to crypto wallets?
                <a href="#" className="text-purple-400 hover:text-purple-300 ml-1 underline">
                  Learn how to get started
                </a>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
  );
};

export default App;
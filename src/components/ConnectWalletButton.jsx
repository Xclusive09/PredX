import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ConnectWalletButton = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            setError('MetaMask is not installed. Please install MetaMask to continue.');
            return;
        }

        setIsConnecting(true);
        setError('');

        try {
            // Clear any existing permissions and force fresh connection
            // First, try to request permissions explicitly to reset connection
            try {
                await window.ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }]
                });
            } catch (permError) {
                // If permission request is not supported, continue with normal flow
                console.log('Permission request not supported, continuing...');
            }

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
            });

            if (accounts.length > 0) {
                onConnect(accounts[0]);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            if (error.code === 4001) {
                setError('Connection rejected by user. Please try again.');
            } else if (error.code === -32002) {
                setError('Connection request already pending. Please check MetaMask.');
            } else {
                setError('Failed to connect wallet. Please try again.');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <motion.button
                onClick={connectWallet}
                disabled={isConnecting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            >
                {isConnecting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connecting...</span>
                    </>
                ) : (
                    <>
                        <Wallet className="w-5 h-5" />
                        <span>Connect MetaMask Wallet</span>
                    </>
                )}
            </motion.button>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300"
                >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </motion.div>
            )}

            <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Secure & Decentralized</span>
                </div>
                <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Non-custodial</span>
                </div>
            </div>
        </div>
    );
};

export default ConnectWalletButton;
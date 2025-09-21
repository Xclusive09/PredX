import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, TrendingUp, Eye, LogOut, AlertTriangle } from 'lucide-react';

const STAGES = {
    DASHBOARD: 'dashboard',
    CREATE_MARKET: 'create_market',
    VIEW_MARKETS: 'view_markets',
};

const Navigation = ({ currentStage, onNavigate, onDisconnect }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const navItems = [
        { id: STAGES.DASHBOARD, icon: Home, label: 'Dashboard' },
        { id: STAGES.CREATE_MARKET, icon: TrendingUp, label: 'Create' },
        { id: STAGES.VIEW_MARKETS, icon: Eye, label: 'Markets' },
    ];

    const handleDisconnectClick = () => {
        setShowConfirmDialog(true);
    };

    const confirmDisconnect = () => {
        setShowConfirmDialog(false);
        onDisconnect();
    };

    const cancelDisconnect = () => {
        setShowConfirmDialog(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 shadow-2xl border border-white/20">
                    <div className="flex items-center space-x-2">
                        {navItems.map((item) => (
                            <motion.button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                whileTap={{ scale: 0.95 }}
                                className={`relative p-3 rounded-xl transition-all duration-200 ${
                                    currentStage === item.id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                            </motion.button>
                        ))}

                        <div className="w-px h-8 bg-white/20 mx-2" />

                        <motion.button
                            onClick={handleDisconnectClick}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                            title="Disconnect Wallet"
                        >
                            <LogOut className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </motion.nav>

            {/* Disconnect Confirmation Dialog */}
            {showConfirmDialog && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 max-w-md w-full"
                    >
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white">Disconnect Wallet?</h3>
                        </div>

                        <p className="text-gray-300 mb-6">
                            This will disconnect your wallet and clear your session. You'll need to reconnect to access your account again.
                        </p>

                        <div className="flex space-x-3">
                            <motion.button
                                onClick={cancelDisconnect}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                onClick={confirmDisconnect}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200"
                            >
                                Disconnect
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </>
    );
};

export default Navigation;
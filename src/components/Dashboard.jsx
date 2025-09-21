import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Eye,
    Wallet,
    DollarSign,
    Trophy,
    Activity,
    Plus,
    ArrowRight,
    Sparkles,
    Clock,
    Gamepad2,
    Users,
    Calendar
} from 'lucide-react';
import { useBettingContract } from '../hooks/useBettingContract.js';

const Dashboard = ({ account, onNavigate, onDisconnect }) => {
    const {
        getAllMarkets,
        getTokenBalance,
        createMarket,
        refreshData,
        markets,
        tokenBalance,
        getActiveMarketsCount,
        isLoading
    } = useBettingContract(account);

    const [recentMarkets, setRecentMarkets] = useState([]);
    const [stats, setStats] = useState({
        balance: '0.00',
        activeMarkets: 0,
        totalPredictions: 0,
        winRate: 0,
    });

    useEffect(() => {
        // Initial load and refresh on account change
        refreshData();

        // Set up interval to refresh data every 30 seconds
        const interval = setInterval(refreshData, 30000);

        return () => clearInterval(interval);
    }, [account]);

    useEffect(() => {
        // Update stats and recent markets when markets or tokenBalance changes
        if (markets && tokenBalance !== undefined) {
            const now = new Date();
            const activeMarkets = getActiveMarketsCount();

            // Count total user predictions and win rate
            let totalPredictions = 0;
            let userWins = 0;
            let resolvedBetsCount = 0;

            markets.forEach(market => {
                market.outcomes.forEach(outcome => {
                    if (parseFloat(outcome.userBet) > 0) {
                        totalPredictions++;
                        if (market.resolved && outcome.id === market.winningOutcome) {
                            userWins++;
                        }
                        if (market.resolved) {
                            resolvedBetsCount++;
                        }
                    }
                });
            });

            const winRate = resolvedBetsCount > 0 ? Math.round((userWins / resolvedBetsCount) * 100) : 0;

            setStats({
                balance: parseFloat(tokenBalance).toFixed(2),
                activeMarkets,
                totalPredictions,
                winRate
            });

            // Sort and limit to latest 3 markets
            const latestMarkets = markets
                .sort((a, b) => b.id - a.id)
                .slice(0, 3);
            setRecentMarkets(latestMarkets);
        }
    }, [markets, tokenBalance, getActiveMarketsCount]);

    const quickActions = [
        {
            id: 'create_market',
            title: 'Create Market',
            description: 'Launch a new prediction market',
            icon: Plus,
            color: 'from-purple-500 to-pink-500',
            onClick: () => onNavigate('create_market')
        },
        {
            id: 'view_markets',
            title: 'Browse Markets',
            description: 'Explore active predictions',
            icon: Eye,
            color: 'from-blue-500 to-cyan-500',
            onClick: () => onNavigate('view_markets')
        }
    ];

    const statCards = [
        { label: 'Token Balance', value: `${stats.balance} MTK`, icon: DollarSign, color: 'text-green-400' },
        { label: 'Active Markets', value: stats.activeMarkets, icon: Activity, color: 'text-blue-400' },
        { label: 'Your Predictions', value: stats.totalPredictions, icon: TrendingUp, color: 'text-purple-400' },
        { label: 'Win Rate', value: `${stats.winRate}%`, icon: Trophy, color: 'text-yellow-400' },
    ];

    const getTimeAgo = (endTime) => {
        const now = new Date();
        const diff = endTime - now;

        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (days > 0) return `Ends in ${days}d`;
            if (hours > 0) return `Ends in ${hours}h`;
            return `Ends soon`;
        }
        return 'Ended';
    };

    const getMarketIcon = (category) => {
        return category === 'Sports' ? Trophy : Gamepad2;
    };

    const getMarketColor = (category) => {
        return category === 'Sports'
            ? 'from-green-500 to-emerald-500'
            : 'from-purple-500 to-pink-500';
    };

    const handleMarketClick = (market) => {
        onNavigate('view_markets');
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Welcome back!
                            </h1>
                            <p className="text-gray-300">
                                Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-sm font-medium">Online</span>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-xl bg-white/10 ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <Sparkles className="w-4 h-4 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                            {stat.label === 'Token Balance' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Sourced from DemoBetToken contract at {import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS}. Updated on refresh or account change.
                                </p>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={action.id}
                                onClick={action.onClick}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                whileHover={{ scale: 1.02, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 text-left"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color}`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{action.title}</h3>
                                <p className="text-gray-400">{action.description}</p>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Latest Markets */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Latest Markets</h2>
                        <motion.button
                            onClick={() => onNavigate('view_markets')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center space-x-1"
                        >
                            <span>View All</span>
                            <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            // Loading skeleton
                            [1, 2, 3].map((_, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl animate-pulse">
                                    <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                                    <div className="flex-1">
                                        <div className="w-3/4 h-4 bg-gray-600 rounded mb-2"></div>
                                        <div className="w-1/2 h-3 bg-gray-600 rounded"></div>
                                    </div>
                                    <div className="w-20 h-6 bg-gray-600 rounded"></div>
                                </div>
                            ))
                        ) : recentMarkets.length > 0 ? (
                            recentMarkets.map((market, index) => {
                                const MarketIcon = getMarketIcon(market.category);
                                const marketColor = getMarketColor(market.category);

                                return (
                                    <motion.div
                                        key={market.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleMarketClick(market)}
                                        className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className={`w-12 h-12 bg-gradient-to-r ${marketColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                                            <MarketIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium mb-1 truncate group-hover:text-purple-300 transition-colors">
                                                {market.question}
                                            </p>
                                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                                                <span className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{market.category}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>{market.totalPool} MTK</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-1">
                                            <span className="text-green-400 font-medium text-sm">
                                                Market #{market.id}
                                            </span>
                                            <span className="text-gray-400 text-xs flex items-center space-x-1">
                                                <Clock className="w-3 h-3" />
                                                <span>{getTimeAgo(market.endTime)}</span>
                                            </span>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            // Empty state
                            <div className="text-center py-8">
                                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-400 text-lg mb-2">No markets created yet</p>
                                <p className="text-gray-500 text-sm mb-4">Be the first to create a prediction market!</p>
                                <motion.button
                                    onClick={() => onNavigate('create_market')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Create Market
                                </motion.button>
                            </div>
                        )}
                    </div>

                    {recentMarkets.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <motion.button
                                onClick={() => onNavigate('view_markets')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-purple-300 rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                            >
                                <Eye className="w-4 h-4" />
                                <span>View All Markets</span>
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
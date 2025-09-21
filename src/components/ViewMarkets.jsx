import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Eye,
    Trophy,
    Gamepad2,
    Clock,
    DollarSign,
    Users,
    TrendingUp,
    Calendar,
    Target,
    Coins,
    AlertTriangle,
    CheckCircle,
    Loader2,
    X,
    Info,
    Filter,
    Search,
    RefreshCcw
} from 'lucide-react';
import { useBettingContract } from '../hooks/useBettingContract.js';

const ViewMarkets = ({ account, onBack }) => {
    const {
        getAllMarkets,
        placeBet,
        getTokenBalance,
        isLoading: contractLoading,
        createMarket,
        markets,
        refreshData,
        tokenBalance
    } = useBettingContract(account);

    const [filteredMarkets, setFilteredMarkets] = useState([]);
    const [localLoading, setLocalLoading] = useState(true); // Local loading state
    const [selectedMarket, setSelectedMarket] = useState(null);
    const [betAmount, setBetAmount] = useState('');
    const [selectedOutcome, setSelectedOutcome] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [showBetModal, setShowBetModal] = useState(false);
    const [betError, setBetError] = useState('');
    const [betSuccess, setBetSuccess] = useState(false);
    const [txHash, setTxHash] = useState('');
    const [loadError, setLoadError] = useState('');

    // Sync filteredMarkets with markets and filters
    useEffect(() => {
        filterMarkets();
        setLocalLoading(false); // Stop local loading once markets are available
    }, [markets, searchQuery, categoryFilter, statusFilter]);

    // Initial load and periodic refresh with timeout
    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            setLocalLoading(true);
            try {
                const timeout = setTimeout(() => {
                    if (mounted) {
                        setLoadError('Data fetch timed out. Please try again.');
                        setLocalLoading(false);
                    }
                }, 10000); // 10-second timeout

                await refreshData();

                clearTimeout(timeout);
                if (mounted) setLoadError(''); // Clear error on success
            } catch (error) {
                console.error('Error refreshing data:', error);
                if (mounted) setLoadError('Failed to refresh markets. Check your connection.');
            } finally {
                if (mounted) setLocalLoading(false);
            }
        };

        if (account) {
            fetchData();
            const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
            return () => {
                mounted = false;
                clearInterval(interval);
            };
        }
    }, [account]);

    const filterMarkets = () => {
        let filtered = markets || [];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(market =>
                market.question.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (categoryFilter !== 'All') {
            filtered = filtered.filter(market => market.category === categoryFilter);
        }

        // Status filter
        const now = new Date();
        if (statusFilter === 'Active') {
            filtered = filtered.filter(market => market.endTime > now && !market.resolved);
        } else if (statusFilter === 'Ended') {
            filtered = filtered.filter(market => market.endTime <= now || market.resolved);
        }

        setFilteredMarkets(filtered);
    };

    const handleMarketClick = (market) => {
        setSelectedMarket(market);
        setShowBetModal(true);
        setBetAmount('');
        setSelectedOutcome(null);
        setBetError('');
    };

    const handlePlaceBet = async () => {
        if (!selectedMarket || selectedOutcome === null || !betAmount) {
            setBetError('Please select an outcome and enter bet amount');
            return;
        }

        const amount = parseFloat(betAmount);
        if (amount <= 0) {
            setBetError('Bet amount must be greater than 0');
            return;
        }

        if (amount > parseFloat(tokenBalance)) {
            setBetError('Insufficient token balance');
            return;
        }

        const now = new Date();
        if (selectedMarket.endTime <= now) {
            setBetError('This market has ended');
            return;
        }

        try {
            setBetError('');
            const tx = await placeBet(selectedMarket.id, selectedOutcome, amount);
            setTxHash(tx.transactionHash);
            setBetSuccess(true);

            // Refresh data after bet
            await refreshData();
        } catch (error) {
            console.error('Error placing bet:', error.stack || error);
            setBetError(error.message || 'Failed to place bet');
        }
    };

    const closeBetModal = () => {
        setShowBetModal(false);
        setBetSuccess(false);
        setSelectedMarket(null);
        setSelectedOutcome(null);
        setBetAmount('');
        setBetError('');
        setTxHash('');
    };

    const getTimeRemaining = (endTime) => {
        const now = new Date();
        const diff = endTime - now;

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const getMarketStatus = (market) => {
        const now = new Date();
        if (market.resolved) return { text: 'Resolved', color: 'bg-green-500' };
        if (market.endTime <= now) return { text: 'Ended', color: 'bg-red-500' };
        return { text: 'Active', color: 'bg-green-500' };
    };

    const calculateOdds = (outcome, totalPool) => {
        if (totalPool === 0) return 'Even';
        const outcomePool = parseFloat(outcome.pool);
        if (outcomePool === 0) return 'High';
        const odds = totalPool / outcomePool;
        return `${odds.toFixed(2)}x`;
    };

    const handleRefresh = () => {
        setLoadError('');
        refreshData();
    };

    if (localLoading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-300">Loading markets...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <motion.button
                        onClick={onBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mb-6 flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </motion.button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Prediction Markets</h1>
                            <p className="text-gray-300">Browse and bet on all markets you create</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-2">
                                    <Coins className="w-5 h-5 text-yellow-400" />
                                    <span className="text-white font-semibold">{parseFloat(tokenBalance).toFixed(2)} MTK</span>
                                </div>
                                <p className="text-gray-400 text-sm">Available Balance</p>
                            </div>
                            <motion.button
                                onClick={handleRefresh}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-xl transition-colors"
                            >
                                <RefreshCcw className="w-5 h-5" />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Error Message */}
                {loadError && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                    >
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span className="text-red-300">{loadError}</span>
                        </div>
                    </motion.div>
                )}

                {/* Filters */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search markets..."
                                className="w-full pl-10 p-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                            />
                        </div>

                        {/* Category Filter */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:outline-none"
                        >
                            <option value="All">All Categories</option>
                            <option value="Sports">Sports</option>
                            <option value="Gaming">Gaming</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:outline-none"
                        >
                            <option value="Active">Active</option>
                            <option value="Ended">Ended</option>
                            <option value="All">All Status</option>
                        </select>

                        {/* Results Count */}
                        <div className="flex items-center justify-center p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                            <span className="text-purple-300 font-semibold">{filteredMarkets.length} Markets</span>
                        </div>
                    </div>
                </motion.div>

                {/* Markets Grid */}
                {filteredMarkets.length === 0 && !loadError ? (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-center py-12"
                    >
                        <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">No Markets Found</h3>
                        <p className="text-gray-400">Try adjusting your filters or check back later for new markets.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredMarkets.map((market, index) => {
                            const status = getMarketStatus(market);
                            const timeRemaining = getTimeRemaining(market.endTime);

                            return (
                                <motion.div
                                    key={market.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    onClick={() => handleMarketClick(market)}
                                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer group"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            {market.category === 'Sports' ? (
                                                <Trophy className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Gamepad2 className="w-5 h-5 text-purple-400" />
                                            )}
                                            <span className="text-sm text-gray-300">{market.category}</span>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${status.color}`}>
                                            {status.text}
                                        </div>
                                    </div>

                                    {/* Question */}
                                    <h3 className="text-lg font-semibold text-white mb-4 line-clamp-2 group-hover:text-purple-300 transition-colors">
                                        {market.question}
                                    </h3>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-white">{market.totalPool}</p>
                                            <p className="text-xs text-gray-400">Total Pool</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-lg">
                                            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                            <p className="text-lg font-bold text-white">{timeRemaining}</p>
                                            <p className="text-xs text-gray-400">Time Left</p>
                                        </div>
                                    </div>

                                    {/* Outcomes Preview */}
                                    <div className="space-y-2">
                                        {market.outcomes.slice(0, 2).map((outcome) => (
                                            <div key={outcome.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                                                <span className="text-sm text-gray-300">Outcome {outcome.id + 1}</span>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-400">{outcome.pool} MTK</span>
                                                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                                        {calculateOdds(outcome, parseFloat(market.totalPool))}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {market.outcomes.length > 2 && (
                                            <p className="text-xs text-gray-400 text-center">+{market.outcomes.length - 2} more outcomes</p>
                                        )}
                                    </div>

                                    {/* Click to bet indicator */}
                                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center text-purple-400 group-hover:text-purple-300 transition-colors">
                                        <Target className="w-4 h-4 mr-2" />
                                        <span className="text-sm font-medium">Click to Place Bet</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Betting Modal */}
            <AnimatePresence>
                {showBetModal && selectedMarket && (
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
                            className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {betSuccess ? (
                                // Success State
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4">Bet Placed Successfully!</h3>
                                    <p className="text-gray-300 mb-6">
                                        Your bet of {betAmount} MTK on outcome {selectedOutcome + 1} has been placed.
                                    </p>
                                    {txHash && (
                                        <div className="mb-6 p-3 bg-white/5 rounded-lg">
                                            <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
                                            <p className="text-sm text-purple-300 font-mono break-all">{txHash}</p>
                                        </div>
                                    )}
                                    <motion.button
                                        onClick={closeBetModal}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full py-3 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-all duration-200"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            ) : (
                                // Betting Interface
                                <div className="p-8">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-2xl font-bold text-white">Place Your Bet</h3>
                                        <motion.button
                                            onClick={closeBetModal}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </motion.button>
                                    </div>

                                    {/* Market Info */}
                                    <div className="mb-6 p-4 bg-white/5 rounded-xl">
                                        <div className="flex items-start space-x-3 mb-3">
                                            {selectedMarket.category === 'Sports' ? (
                                                <Trophy className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            ) : (
                                                <Gamepad2 className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                                            )}
                                            <div>
                                                <h4 className="text-lg font-semibold text-white mb-1">{selectedMarket.question}</h4>
                                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                                    <span>Total Pool: {selectedMarket.totalPool} MTK</span>
                                                    <span>Ends: {getTimeRemaining(selectedMarket.endTime)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Outcome Selection */}
                                    <div className="mb-6">
                                        <label className="block text-white text-lg font-semibold mb-3">
                                            Select Outcome *
                                        </label>
                                        <div className="space-y-3">
                                            {selectedMarket.outcomes.map((outcome) => (
                                                <motion.button
                                                    key={outcome.id}
                                                    type="button"
                                                    onClick={() => setSelectedOutcome(outcome.id)}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                                        selectedOutcome === outcome.id
                                                            ? 'border-purple-400 bg-purple-500/20'
                                                            : 'border-white/20 bg-white/5 hover:border-white/30'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h5 className="text-white font-semibold mb-1">Outcome {outcome.id + 1}</h5>
                                                            <p className="text-gray-400 text-sm">Pool: {outcome.pool} MTK</p>
                                                            {parseFloat(outcome.userBet) > 0 && (
                                                                <p className="text-green-400 text-sm">Your bet: {outcome.userBet} MTK</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg">
                                                                {calculateOdds(outcome, parseFloat(selectedMarket.totalPool))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bet Amount */}
                                    <div className="mb-6">
                                        <label className="block text-white text-lg font-semibold mb-3">
                                            Bet Amount (MTK) *
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={betAmount}
                                                onChange={(e) => setBetAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                step="0.01"
                                                min="0"
                                                max={tokenBalance}
                                                className="w-full pl-12 p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-gray-400 text-sm">Available: {parseFloat(tokenBalance).toFixed(2)} MTK</span>
                                            <div className="space-x-2">
                                                {['0.1', '1', '10'].map((amount) => (
                                                    <button
                                                        key={amount}
                                                        type="button"
                                                        onClick={() => setBetAmount(amount)}
                                                        className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-purple-300 rounded transition-colors"
                                                    >
                                                        {amount}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Potential Payout */}
                                    {betAmount && selectedOutcome !== null && (
                                        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <span className="text-green-300 font-semibold">Potential Payout:</span>
                                                <span className="text-green-300 font-bold text-lg">
                                                    {(parseFloat(betAmount || 0) * parseFloat(calculateOdds(selectedMarket.outcomes[selectedOutcome], parseFloat(selectedMarket.totalPool)).replace('x', ''))).toFixed(2)} MTK
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {betError && (
                                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                            <div className="flex items-center space-x-3">
                                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                                <span className="text-red-300">{betError}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex space-x-3">
                                        <motion.button
                                            onClick={closeBetModal}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="flex-1 py-4 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200"
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            onClick={handlePlaceBet}
                                            disabled={contractLoading || !betAmount || selectedOutcome === null}
                                            whileHover={{ scale: contractLoading ? 1 : 1.02 }}
                                            whileTap={{ scale: contractLoading ? 1 : 0.98 }}
                                            className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                                        >
                                            {contractLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Placing Bet...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Target className="w-5 h-5" />
                                                    <span>Place Bet</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ViewMarkets;
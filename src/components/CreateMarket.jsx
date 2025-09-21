import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Type, Hash, Tag, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useBettingContract } from '../hooks/useBettingContract';

const CreateMarket = ({ account, onBack }) => {
    const { createMarket, isLoading, getTokenBalance } = useBettingContract(account);

    const [formData, setFormData] = useState({
        question: '',
        category: 'Sports',
        endTime: '',
        outcomeCount: 2,
        outcomes: ['Yes', 'No']
    });

    const [tokenBalance, setTokenBalance] = useState('0');
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState('');

    useEffect(() => {
        loadTokenBalance();
    }, [account]);

    const loadTokenBalance = async () => {
        try {
            const balance = await getTokenBalance();
            setTokenBalance(balance);
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validation
        const newErrors = {};
        if (!formData.question.trim()) {
            newErrors.question = 'Question is required';
        }
        if (!formData.endTime) {
            newErrors.endTime = 'End time is required';
        } else {
            const endTime = new Date(formData.endTime);
            if (endTime <= new Date()) {
                newErrors.endTime = 'End time must be in the future';
            }
        }
        if (formData.outcomeCount < 2 || formData.outcomeCount > 5) {
            newErrors.outcomeCount = 'Outcome count must be between 2 and 5';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            console.log('Submitting market creation...');
            console.log('Form data:', formData);

            const endTimestamp = Math.floor(new Date(formData.endTime).getTime() / 1000);
            const categoryValue = formData.category === 'Sports' ? 0 : 1;

            const tx = await createMarket(
                formData.question,
                categoryValue,
                endTimestamp,
                formData.outcomeCount
            );

            console.log('Market created successfully:', tx);
            setTxHash(tx.transactionHash);
            setSuccess(true);

            // Reset form
            setFormData({
                question: '',
                category: 'Sports',
                endTime: '',
                outcomeCount: 2,
                outcomes: ['Yes', 'No']
            });

        } catch (error) {
            console.error('Error creating market:', error);
            setErrors({
                submit: error.message || 'Failed to create market. Please try again.'
            });
        }
    };

    const handleOutcomeCountChange = (count) => {
        const newOutcomes = [];
        for (let i = 0; i < count; i++) {
            newOutcomes.push(formData.outcomes[i] || `Outcome ${i + 1}`);
        }
        setFormData({
            ...formData,
            outcomeCount: count,
            outcomes: newOutcomes
        });
    };

    if (success) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
                    >
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Market Created Successfully!</h2>
                        <p className="text-green-600 mb-4">Your prediction market has been created on the blockchain.</p>

                        {txHash && (
                            <div className="bg-white p-4 rounded-lg mb-6">
                                <p className="text-sm text-gray-600 mb-1">Transaction Hash:</p>
                                <p className="text-xs font-mono text-gray-800 break-all">{txHash}</p>
                            </div>
                        )}

                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setTxHash('');
                                }}
                                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                Create Another
                            </button>
                            <button
                                onClick={onBack}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-8"
                >
                    <button
                        onClick={onBack}
                        className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>

                    <h1 className="text-4xl font-bold text-white mb-2">Create Market</h1>
                    <p className="text-gray-300">Launch a new prediction market</p>

                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-300 text-sm">
                            💰 Your Balance: <span className="font-semibold">{tokenBalance} MTK</span>
                        </p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Question */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                <Type className="w-4 h-4 inline mr-2" />
                                Market Question
                            </label>
                            <input
                                type="text"
                                value={formData.question}
                                onChange={(e) => setFormData({...formData, question: e.target.value})}
                                placeholder="e.g., Will the Chiefs win the next game?"
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
                                disabled={isLoading}
                            />
                            {errors.question && (
                                <p className="text-red-400 text-sm mt-1">{errors.question}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                <Tag className="w-4 h-4 inline mr-2" />
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:outline-none transition-colors"
                                disabled={isLoading}
                            >
                                <option value="Sports">Sports</option>
                                <option value="Gaming">Gaming</option>
                            </select>
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:outline-none transition-colors"
                                disabled={isLoading}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                            {errors.endTime && (
                                <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>
                            )}
                        </div>

                        {/* Outcome Count */}
                        <div>
                            <label className="block text-white font-medium mb-2">
                                <Hash className="w-4 h-4 inline mr-2" />
                                Number of Outcomes
                            </label>
                            <select
                                value={formData.outcomeCount}
                                onChange={(e) => handleOutcomeCountChange(parseInt(e.target.value))}
                                className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:border-purple-400 focus:outline-none transition-colors"
                                disabled={isLoading}
                            >
                                <option value={2}>2 Outcomes</option>
                                <option value={3}>3 Outcomes</option>
                                <option value={4}>4 Outcomes</option>
                                <option value={5}>5 Outcomes</option>
                            </select>
                        </div>

                        {/* Error Display */}
                        {errors.submit && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="flex items-center space-x-2 text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                    <span>{errors.submit}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !account}
                            className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Creating Market...</span>
                                </>
                            ) : (
                                <span>Create Market</span>
                            )}
                        </button>

                        {!account && (
                            <p className="text-red-400 text-center text-sm">
                                Please connect your wallet to create a market
                            </p>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateMarket;
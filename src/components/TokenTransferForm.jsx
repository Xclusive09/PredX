import { useState } from 'react';
import { Send, AlertCircle, Check } from 'lucide-react';

/**
 * TokenTransferForm Component
 * 
 * This component provides a form to transfer tokens to another address:
 * - Input validation for recipient address
 * - Amount validation 
 * - Error handling and transaction status
 * - Success feedback
 * 
 * @param {Object} contractHelpers - Contract helper functions from useContract hook
 * @param {string} account - Current user's account address
 * @param {Function} onSuccess - Callback after successful transfer
 * @returns {JSX.Element} - The token transfer form UI
 */
export default function TokenTransferForm({ contractHelpers, account, onSuccess }) {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [txHash, setTxHash] = useState(null);

    const resetForm = () => {
        setRecipient('');
        setAmount('');
        setError(null);
        setSuccess(false);
        setTxHash(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setTxHash(null);

        // Validation
        if (!recipient || !amount) {
            setError('Please fill in all fields');
            return;
        }

        if (!contractHelpers.isValidAddress(recipient)) {
            setError('Invalid recipient address');
            return;
        }

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        try {
            const tx = await contractHelpers.transfer(recipient, amount, account);
            setSuccess(true);
            setTxHash(tx.transactionHash);

            // Call the onSuccess callback if provided
            if (typeof onSuccess === 'function') {
                onSuccess();
            }
        } catch (err) {
            console.error('Transfer failed:', err);
            if (err.code === 4001) {
                setError('Transaction rejected by user');
            } else if (err.message.includes('insufficient funds')) {
                setError('Insufficient funds for this transfer');
            } else {
                setError('Transfer failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 w-full max-w-md">
            <h3 className="text-lg font-medium text-dapp-primary mb-4">Send Tokens</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start gap-2 text-green-600 text-sm">
                    <Check size={16} className="mt-0.5" />
                    <div>
                        <p>Transfer successful!</p>
                        {txHash && (
                            <p className="text-xs mt-1">
                                Transaction hash: <span className="font-mono">{txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</span>
                            </p>
                        )}
                        <button
                            onClick={resetForm}
                            className="text-green-700 underline text-xs mt-2 hover:text-green-800"
                        >
                            Make another transfer
                        </button>
                    </div>
                </div>
            )}

            {!success && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                            Recipient Address
                        </label>
                        <input
                            type="text"
                            id="recipient"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="0x..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dapp-primary focus:border-transparent"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dapp-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center gap-2 py-2 px-4 rounded-lg text-white font-medium ${loading ? 'bg-gray-400' : 'bg-dapp-primary hover:bg-dapp-secondary'
                            } transition-colors`}
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Send size={16} />
                                Send Tokens
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
}
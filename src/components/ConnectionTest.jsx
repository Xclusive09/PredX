import React, { useState, useEffect } from 'react';
import { useBettingContract } from '../hooks/useBettingContract';

const ConnectionTest = ({ account }) => {
    const {
        contracts,
        getTokenBalance,
        getMarketCount,
        getAllMarkets,
        isLoading
    } = useBettingContract(account);

    const [testResults, setTestResults] = useState({});
    const [testing, setTesting] = useState(false);

    const runConnectionTest = async () => {
        if (!account) return;

        setTesting(true);
        const results = {};

        try {
            // Test 1: Check if contracts are initialized
            results.contractsInitialized = !!contracts;

            // Test 2: Get token balance
            try {
                const balance = await getTokenBalance();
                results.tokenBalance = balance;
                results.tokenBalanceSuccess = true;
            } catch (error) {
                results.tokenBalanceError = error.message;
                results.tokenBalanceSuccess = false;
            }

            // Test 3: Get market count
            try {
                const count = await getMarketCount();
                results.marketCount = count;
                results.marketCountSuccess = true;
            } catch (error) {
                results.marketCountError = error.message;
                results.marketCountSuccess = false;
            }

            // Test 4: Get all markets
            try {
                const markets = await getAllMarkets();
                results.marketsCount = markets.length;
                results.markets = markets;
                results.marketsSuccess = true;
            } catch (error) {
                results.marketsError = error.message;
                results.marketsSuccess = false;
            }

        } catch (error) {
            results.generalError = error.message;
        }

        setTestResults(results);
        setTesting(false);
    };

    useEffect(() => {
        if (account && contracts) {
            runConnectionTest();
        }
    }, [account, contracts]);

    if (!account) {
        return (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                <p className="text-yellow-800">Please connect your wallet to test the connection.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Smart Contract Connection Test</h2>

            <button
                onClick={runConnectionTest}
                disabled={testing}
                className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {testing ? 'Testing...' : 'Run Connection Test'}
            </button>

            {Object.keys(testResults).length > 0 && (
                <div className="space-y-4">
                    <div className={`p-3 rounded ${testResults.contractsInitialized ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
                        <h3 className="font-semibold">Contracts Initialized</h3>
                        <p className={testResults.contractsInitialized ? 'text-green-800' : 'text-red-800'}>
                            {testResults.contractsInitialized ? '✅ Success' : '❌ Failed'}
                        </p>
                    </div>

                    <div className={`p-3 rounded ${testResults.tokenBalanceSuccess ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
                        <h3 className="font-semibold">Token Balance</h3>
                        <p className={testResults.tokenBalanceSuccess ? 'text-green-800' : 'text-red-800'}>
                            {testResults.tokenBalanceSuccess
                                ? `✅ Success: ${testResults.tokenBalance} MTK`
                                : `❌ Failed: ${testResults.tokenBalanceError}`
                            }
                        </p>
                    </div>

                    <div className={`p-3 rounded ${testResults.marketCountSuccess ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
                        <h3 className="font-semibold">Market Count</h3>
                        <p className={testResults.marketCountSuccess ? 'text-green-800' : 'text-red-800'}>
                            {testResults.marketCountSuccess
                                ? `✅ Success: ${testResults.marketCount} markets`
                                : `❌ Failed: ${testResults.marketCountError}`
                            }
                        </p>
                    </div>

                    <div className={`p-3 rounded ${testResults.marketsSuccess ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
                        <h3 className="font-semibold">Markets Data</h3>
                        <p className={testResults.marketsSuccess ? 'text-green-800' : 'text-red-800'}>
                            {testResults.marketsSuccess
                                ? `✅ Success: Loaded ${testResults.marketsCount} markets`
                                : `❌ Failed: ${testResults.marketsError}`
                            }
                        </p>
                        {testResults.marketsSuccess && testResults.markets && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Markets:</p>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify(testResults.markets, null, 2)}
                </pre>
                            </div>
                        )}
                    </div>

                    {testResults.generalError && (
                        <div className="p-3 rounded bg-red-100 border-red-400 border">
                            <h3 className="font-semibold text-red-800">General Error</h3>
                            <p className="text-red-800">{testResults.generalError}</p>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <p><strong>Account:</strong> {account}</p>
                <p><strong>Betting Contract:</strong> {import.meta.env.VITE_BETTING_CONTRACT_ADDRESS}</p>
                <p><strong>Token Contract:</strong> {import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS}</p>
                <p><strong>RPC URL:</strong> {import.meta.env.VITE_RPC_URL}</p>
            </div>
        </div>
    );
};

export default ConnectionTest;
import { useState, useEffect, useCallback } from 'react';
import useContract from './useContract';

export const useBettingContract = (account) => {
    const {
        contracts,
        isLoading: contractLoading,
        createMarket: contractCreateMarket,
        placeBet: contractPlaceBet,
        getAllMarkets: contractGetAllMarkets,
        getTokenBalance: contractGetTokenBalance
    } = useContract(account);

    const [isLoading, setIsLoading] = useState(false);
    const [markets, setMarkets] = useState([]);
    const [tokenBalance, setTokenBalance] = useState('0');
    const [refreshPending, setRefreshPending] = useState(false);

    // Sync markets and balance on account change or when refresh is pending
    useEffect(() => {
        let mounted = true;
        let timeout = null;

        const fetchData = async () => {
            if (!contracts || !account || !refreshPending) return;

            setIsLoading(true);

            try {
                timeout = setTimeout(() => {
                    if (mounted) {
                        console.warn('Fetch timed out after 10 seconds');
                        setIsLoading(false);
                    }
                }, 10000);

                const [fetchedMarkets, balance] = await Promise.all([
                    contractGetAllMarkets(),
                    contractGetTokenBalance()
                ]);
                if (mounted) {
                    setMarkets(fetchedMarkets || []);
                    setTokenBalance(balance || '0');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                if (mounted) {
                    setMarkets([]);
                    setTokenBalance('0');
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    setRefreshPending(false);
                }
                if (timeout) clearTimeout(timeout);
            }
        };

        if (account && contracts && (refreshPending || markets.length === 0)) {
            fetchData();
        }

        return () => {
            mounted = false;
            if (timeout) clearTimeout(timeout);
        };
    }, [account, contracts, refreshPending]); // Removed markets.length

    // Memoized getActiveMarketsCount
    const getActiveMarketsCount = useCallback(() => {
        const now = new Date();
        return markets.filter(market => market.endTime > now && !market.resolved).length;
    }, [markets]);

    // Create market wrapper with controlled refresh
    const createMarket = async (question, category, endTime, outcomeCount, outcomes = []) => {
        if (!contracts || !account) throw new Error('Contracts not initialized');

        setIsLoading(true);
        try {
            let endTimestamp;
            if (typeof endTime === 'string' && endTime) {
                const endTimeMs = Date.parse(endTime);
                if (isNaN(endTimeMs)) {
                    throw new Error('Invalid endTime format');
                }
                endTimestamp = Math.floor(endTimeMs / 1000);
            } else if (typeof endTime === 'number' && !isNaN(endTime)) {
                endTimestamp = endTime;
            } else {
                const currentTimestamp = Math.floor(Date.now() / 1000);
                endTimestamp = currentTimestamp + 86400;
                console.warn('Invalid endTime provided, defaulting to:', endTimestamp);
            }

            const categoryValue = category === 'Sports' ? 0 : 1;
            const tx = await contractCreateMarket(question, categoryValue, endTimestamp, outcomeCount);
            console.log('Market created, tx:', tx);

            setRefreshPending(true);
            return tx;
        } catch (error) {
            console.error('Error creating market:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Place bet wrapper
    const placeBet = async (marketId, outcomeId, amount) => {
        if (!contracts || !account) throw new Error('Contracts not initialized');

        setIsLoading(true);
        try {
            const tx = await contractPlaceBet(marketId, outcomeId, amount);
            setRefreshPending(true);
            return tx;
        } catch (error) {
            console.error('Error placing bet:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get all markets wrapper (returns cached data)
    const getAllMarkets = () => {
        return markets;
    };

    // Get token balance wrapper (returns cached data)
    const getTokenBalance = () => {
        return tokenBalance;
    };

    // Additional convenience methods
    const getMarketCount = async () => {
        if (!contracts) return 0;
        return await contracts.bettingContract.getMarketCount();
    };

    const getMarket = async (marketId) => {
        if (!contracts) return null;
        return await contracts.bettingContract.getMarket(marketId);
    };

    const getOutcomePool = async (marketId, outcomeId) => {
        if (!contracts) return '0';
        return await contracts.bettingContract.getOutcomePool(marketId, outcomeId);
    };

    const getUserBet = async (marketId, outcomeId) => {
        if (!contracts || !account) return '0';
        return await contracts.bettingContract.getUserBet(marketId, account, outcomeId);
    };

    // Manual refresh function
    const refreshData = () => {
        setRefreshPending(true);
    };

    return {
        createMarket,
        placeBet,
        getMarketCount,
        getMarket,
        getOutcomePool,
        getUserBet,
        getTokenBalance,
        getAllMarkets,
        getActiveMarketsCount,
        refreshData,
        isLoading: isLoading || contractLoading,
        contracts,
        markets,
        tokenBalance,
        contract: contracts?.bettingContract,
        tokenContract: contracts?.tokenContract,
        web3: contracts?.web3
    };
};
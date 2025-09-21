import { useState, useEffect } from 'react';
import Web3 from 'web3';
import PredictionMarketABI from '../contracts/SportsGamingBetting.json';
import DemoBetTokenABI from '../contracts/DemoBetToken.json';

const useContract = (account) => {
  const [web3, setWeb3] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkId, setNetworkId] = useState(null);

  const BETTING_CONTRACT_ADDRESS = import.meta.env.VITE_BETTING_CONTRACT_ADDRESS;
  const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
  const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc.blockdag.network';
  const FALLBACK_RPC_URL = 'https://rpc.primordial.bdagscan.com';

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && account) {
      initializeContracts();
    }
  }, [account]);

  const initializeContracts = async () => {
    try {
      let web3Instance;
      try {
        web3Instance = new Web3(window.ethereum);
      } catch (error) {
        console.error('Failed to connect with primary RPC:', error.message);
        web3Instance = new Web3(new Web3.providers.HttpProvider(FALLBACK_RPC_URL));
        console.log('Switched to fallback RPC:', FALLBACK_RPC_URL);
      }
      setWeb3(web3Instance);

      const rawNetworkId = await web3Instance.eth.getChainId();
      const networkIdNum = Number(rawNetworkId);
      setNetworkId(networkIdNum);

      console.log('Detected Network ID:', networkIdNum);
      if (networkIdNum !== 1043) {
        console.error('❌ Wrong network! Switch to BlockDAG Testnet (Chain ID 1043).');
        if (window.ethereum && window.ethereum.request) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: Web3.utils.toHex(1043) }],
            });
            console.log('Attempted network switch to Chain ID 1043. Please reload the page.');
          } catch (switchError) {
            console.error('Failed to switch network:', switchError.message);
          }
        }
        return;
      }
      console.log('Betting Contract Address:', BETTING_CONTRACT_ADDRESS);
      console.log('Token Contract Address:', TOKEN_CONTRACT_ADDRESS);

      const bettingContract = new web3Instance.eth.Contract(
          PredictionMarketABI.abi,
          BETTING_CONTRACT_ADDRESS
      );

      const tokenContract = new web3Instance.eth.Contract(
          DemoBetTokenABI.abi,
          TOKEN_CONTRACT_ADDRESS
      );

      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const marketCount = await bettingContract.methods.marketCount().call();
          console.log(`✅ Betting contract connection successful (Attempt ${attempt}), marketCount:`, marketCount.toString());
          break;
        } catch (error) {
          console.error(`❌ Betting contract connection failed (Attempt ${attempt}):`, {
            message: error.message,
            code: error.code,
            data: error.data || 'No additional data'
          });
          if (attempt === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const symbol = await tokenContract.methods.symbol().call();
          console.log(`✅ Token contract connection successful (Attempt ${attempt}), symbol:`, symbol);
          break;
        } catch (error) {
          console.error(`❌ Token contract connection failed (Attempt ${attempt}):`, error.message);
          if (error.message.includes('Out of Gas') || error.message.includes('not fully synced')) {
            console.warn('Possible node sync issue or invalid ABI/address. Check deployment.');
          }
          if (attempt === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
        }
      }

      const contractHelpers = createContractHelpers(web3Instance, bettingContract, tokenContract);
      setContracts(contractHelpers);

    } catch (error) {
      console.error('Error initializing contracts:', {
        message: error.message,
        code: error.code,
        data: error.data || 'No additional data'
      });
      throw error;
    }
  };

  const createContractHelpers = (web3Instance, bettingContract, tokenContract) => {
    const safeBigIntToString = (value) => (typeof value === 'bigint' ? value.toString() : value.toString());
    const safeBigIntToNumber = (value) => (typeof value === 'bigint' ? Number(value) : parseInt(value));

    const bettingHelpers = {
      async createMarket(question, category, endTime, outcomeCount, from) {
        setIsLoading(true);
        try {
          console.log('Creating market with params:', { question, category, endTime, outcomeCount, from });
          console.log('Caller account:', from);

          const categoryNum = Number(category);
          const endTimeNum = Number(endTime);
          const outcomeCountNum = Number(outcomeCount);

          let gas;
          try {
            const gasEstimate = await bettingContract.methods
                .createMarket(question, categoryNum, endTimeNum, outcomeCountNum)
                .estimateGas({ from });
            gas = Math.floor(Number(gasEstimate) * 1.5);
          } catch (gasError) {
            console.warn('Gas estimation failed, using default:', gasError.message);
            gas = 500000;
          }

          const tx = await bettingContract.methods
              .createMarket(question, categoryNum, endTimeNum, outcomeCountNum)
              .send({ from, gas, gasPrice: await web3Instance.eth.getGasPrice() })
              .on('error', (error) => {
                if (error.receipt && error.receipt.status === false) {
                  console.error('Transaction reverted:', {
                    receipt: error.receipt,
                    message: error.message,
                    data: error.data || 'No additional data'
                  });
                }
              });
          return tx;
        } catch (error) {
          console.error('CreateMarket error:', {
            message: error.message,
            receipt: error.receipt,
            data: error.data || 'No additional data'
          });
          throw error;
        } finally {
          setIsLoading(false);
        }
      },

      async placeBet(marketId, outcomeId, amount, from) {
        setIsLoading(true);
        try {
          // Ensure amount is a string before conversion
          const amountStr = amount.toString();
          const amountWei = web3Instance.utils.toWei(amountStr, 'ether');
          const marketIdNum = Number(marketId);
          const outcomeIdNum = Number(outcomeId);

          console.log('Placing bet:', { marketIdNum, outcomeIdNum, amountWei, from });

          const allowance = await tokenContract.methods
              .allowance(from, BETTING_CONTRACT_ADDRESS)
              .call();
          const allowanceWei = safeBigIntToString(allowance);

          // Safely use toBN with fallback to string comparison
          const toBN = web3Instance.utils.toBN || ((value) => value); // Fallback if toBN is undefined
          const amountBN = toBN(amountWei);
          const allowanceBN = toBN(allowanceWei);

          if (typeof allowanceBN.lt === 'function' ? allowanceBN.lt(amountBN) : parseInt(allowanceWei) < parseInt(amountWei)) {
            console.log('Approving tokens...');
            let approveGas;
            try {
              const approveGasEstimate = await tokenContract.methods
                  .approve(BETTING_CONTRACT_ADDRESS, amountWei)
                  .estimateGas({ from });
              approveGas = Math.floor(Number(approveGasEstimate) * 1.5);
            } catch {
              approveGas = 100000;
            }
            await tokenContract.methods
                .approve(BETTING_CONTRACT_ADDRESS, amountWei)
                .send({ from, gas: approveGas, gasPrice: await web3Instance.eth.getGasPrice() });
          }

          let gas;
          try {
            const gasEstimate = await bettingContract.methods
                .placeBet(marketIdNum, outcomeIdNum, amountWei)
                .estimateGas({ from });
            gas = Math.floor(Number(gasEstimate) * 1.5);
          } catch {
            gas = 300000;
          }

          const tx = await bettingContract.methods
              .placeBet(marketIdNum, outcomeIdNum, amountWei)
              .send({ from, gas, gasPrice: await web3Instance.eth.getGasPrice() });
          return tx;
        } catch (error) {
          console.error('PlaceBet error:', error.message);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },

      async getMarketCount() {
        try {
          const count = await bettingContract.methods.marketCount().call();
          return safeBigIntToNumber(count);
        } catch (error) {
          console.error('Error getting market count:', error.message);
          return 0;
        }
      },

      async getMarket(marketId) {
        try {
          const marketIdNum = Number(marketId);
          const market = await bettingContract.methods.getMarket(marketIdNum).call();
          return {
            id: marketIdNum,
            question: market[0],
            category: safeBigIntToNumber(market[1]) === 0 ? 'Sports' : 'Gaming',
            endTime: new Date(safeBigIntToNumber(market[2]) * 1000),
            outcomeCount: safeBigIntToNumber(market[3]),
            resolved: market[4],
            winningOutcome: safeBigIntToNumber(market[5])
          };
        } catch (error) {
          console.error('Error getting market:', error.message);
          return null;
        }
      },

      async getOutcomePool(marketId, outcomeId) {
        try {
          const marketIdNum = Number(marketId);
          const outcomeIdNum = Number(outcomeId);
          const pool = await bettingContract.methods.getOutcomePool(marketIdNum, outcomeIdNum).call();
          return web3Instance.utils.fromWei(safeBigIntToString(pool), 'ether');
        } catch (error) {
          console.error('Error getting outcome pool:', error.message);
          return '0';
        }
      },

      async getUserBet(marketId, user, outcomeId) {
        try {
          const marketIdNum = Number(marketId);
          const outcomeIdNum = Number(outcomeId);
          const bet = await bettingContract.methods.getUserBet(marketIdNum, user, outcomeIdNum).call();
          return web3Instance.utils.fromWei(safeBigIntToString(bet), 'ether');
        } catch (error) {
          console.error('Error getting user bet:', error.message);
          return '0';
        }
      },

      async getAllMarkets(account) {
        try {
          const rawResult = await bettingContract.methods.getAllMarkets().call();
          console.log("Raw getAllMarkets result:", rawResult);

          const questions = rawResult[0];
          const categories = rawResult[1];
          const endTimes = rawResult[2];
          const outcomeCounts = rawResult[3];
          const resolveds = rawResult[4];
          const winningOutcomes = rawResult[5];

          const marketCount = await bettingContract.methods.marketCount().call();
          console.log("Total markets found:", marketCount);

          if (Number(marketCount) === 0) return [];

          const categoryMap = { 0: "Sports", 1: "Gaming" };
          const markets = [];

          for (let i = 0; i < marketCount; i++) {
            const marketId = i + 1;

            const market = {
              id: marketId,
              question: questions[i],
              category: categoryMap[Number(categories[i])] || "Unknown",
              endTime: new Date(Number(endTimes[i]) * 1000),
              outcomeCount: Number(outcomeCounts[i]),
              resolved: resolveds[i],
              winningOutcome: Number(winningOutcomes[i]),
              outcomes: [],
              totalPool: "0.00",
            };

            const outcomePromises = Array.from({ length: market.outcomeCount }, async (_, j) => {
              const pool = await this.getOutcomePool(marketId, j);
              const userBet = account ? await this.getUserBet(marketId, account, j) : "0";
              return {
                id: j,
                pool: pool.toString(),
                userBet: userBet.toString(),
                name: `Outcome ${j + 1}`,
              };
            });

            market.outcomes = await Promise.all(outcomePromises);

            market.totalPool = market.outcomes
                .reduce((sum, outcome) => sum + parseFloat(outcome.pool), 0)
                .toFixed(2);

            markets.push(market);
          }

          console.log("Formatted markets:", markets);
          return markets;
        } catch (error) {
          console.error("Error getting all markets:", error.message);
          return [];
        }
      }
    };

    const tokenHelpers = {
      async balanceOf(account) {
        try {
          const balance = await tokenContract.methods.balanceOf(account).call();
          return web3Instance.utils.fromWei(safeBigIntToString(balance), 'ether');
        } catch (error) {
          console.error('Error getting balance:', error.message);
          return '0';
        }
      },

      async allowance(owner, spender) {
        try {
          const allowance = await tokenContract.methods.allowance(owner, spender).call();
          return safeBigIntToString(allowance);
        } catch (error) {
          console.error('Error getting allowance:', error.message);
          return '0';
        }
      },

      async symbol() {
        try {
          return await tokenContract.methods.symbol().call();
        } catch (error) {
          console.error('Error getting symbol:', error.message);
          return 'MTK';
        }
      }
    };

    return {
      bettingContract: bettingHelpers,
      tokenContract: tokenHelpers,
      web3: web3Instance,
      addresses: { betting: BETTING_CONTRACT_ADDRESS, token: TOKEN_CONTRACT_ADDRESS }
    };
  };

  const createMarket = async (question, category, endTime, outcomeCount) => {
    if (!contracts || !account) throw new Error('Contracts not initialized');
    return await contracts.bettingContract.createMarket(question, category, endTime, outcomeCount, account);
  };

  const placeBet = async (marketId, outcomeId, amount) => {
    if (!contracts || !account) throw new Error('Contracts not initialized');
    return await contracts.bettingContract.placeBet(marketId, outcomeId, amount, account);
  };

  const getAllMarkets = async () => {
    if (!contracts) return [];
    return await contracts.bettingContract.getAllMarkets();
  };

  const getTokenBalance = async () => {
    if (!contracts || !account) return '0';
    return await contracts.tokenContract.balanceOf(account);
  };

  return {
    web3,
    contracts,
    isLoading,
    networkId,
    createMarket,
    placeBet,
    getAllMarkets,
    getTokenBalance,
    bettingContract: contracts?.bettingContract,
    tokenContract: contracts?.tokenContract,
    addresses: contracts?.addresses
  };
};

export default useContract;
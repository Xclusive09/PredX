import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../config/constants';

const MarketCard = ({ market, bettingContract, tokenContract, account }) => {
  const [odds, setOdds] = useState([]);
  const [userBet, setUserBet] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const newOdds = [];
      const totalPool = market.pools.reduce((a, b) => Number(a) + Number(b), 0);
      for (let i = 0; i < market.outcomeCount; i++) {
        const pool = Number(market.pools[i]);
        newOdds.push(totalPool > 0 ? (totalPool / pool).toFixed(2) : 'N/A');
      }
      setOdds(newOdds);
      if (account && bettingContract) {
        const bet = await bettingContract.getUserBet(market.id, account, market.winningOutcome || 0);
        setUserBet(tokenContract.formatBalance(bet));
      }
    };
    fetchData();
  }, [market, bettingContract, tokenContract, account]);

  const handleBet = async (outcomeId) => {
    if (!tokenContract || !bettingContract) return;
    const amount = prompt('Enter bet amount (in DBT):');
    if (amount && account) {
      try {
        await tokenContract.approve(CONTRACT_ADDRESS, tokenContract.parseAmount(amount), account);
        const tx = await bettingContract.placeBet(market.id, outcomeId, tokenContract.parseAmount(amount), account);
        await tx.wait();
        alert('Bet placed successfully!');
      } catch (err) {
        alert('Error placing bet: ' + err.message);
      }
    }
  };

  const handleClaim = async () => {
    if (market.resolved && userBet && Number(userBet) > 0 && account) {
      try {
        const tx = await bettingContract.claimWinnings(market.id, account);
        await tx.wait();
        alert('Winnings claimed!');
        setUserBet(0); // Reset after claim
      } catch (err) {
        alert('Error claiming winnings: ' + err.message);
      }
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">{market.question}</h3>
      <p>Category: {CATEGORIES[market.category]}</p>
      <p>Ends: {new Date(market.endTime * 1000).toLocaleString()}</p>
      <ul className="mt-2">
        {Array.from({ length: market.outcomeCount }).map((_, i) => (
          <li key={i} className="py-1">
            Outcome {i} ({i === 0 ? 'Win' : i === 1 ? 'Lose' : 'Draw'}): Pool {market.pools[i]} DBT | Odds: {odds[i]}
            <button
              onClick={() => handleBet(i)}
              className="btn-accent ml-2 p-1 rounded disabled:bg-gray-400"
              disabled={market.resolved || market.endTime < Date.now() / 1000}
            >
              Bet
            </button>
          </li>
        ))}
      </ul>
      {market.resolved && (
        <div className="mt-2">
          <p>Winner: Outcome {market.winningOutcome}</p>
          {userBet && Number(userBet) > 0 && (
            <button
              onClick={handleClaim}
              className="btn-primary mt-2 p-1 rounded"
            >
              Claim Winnings ({userBet} DBT)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MarketCard;
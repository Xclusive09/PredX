import React, { useEffect, useState } from 'react';

const Leaderboard = ({ bettingContract, account }) => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      if (bettingContract) {
        const topUsers = [];
        for (let i = 1; i <= 5; i++) {
          try {
            const mkt = await bettingContract.getMarket(i);
            if (mkt.resolved) {
              const users = await bettingContract.getUserBet(i, account, mkt.winningOutcome);
              topUsers.push({ address: account.slice(0, 6) + '...', wins: users.toString() / 10**18 }); // Adjust for 18 decimals
            }
          } catch {}
        }
        setLeaders(topUsers.sort((a, b) => b.wins - a.wins).slice(0, 3));
      }
    };
    fetchLeaders();
  }, [bettingContract, account]);

  return (
    <div className="mt-6 card">
      <h2 className="text-lg font-semibold text-dapp-primary mb-2">Leaderboard</h2>
      <ul className="space-y-2">
        {leaders.map((leader, idx) => (
          <li key={idx} className="flex justify-between">
            <span>{leader.address}</span>
            <span>{leader.wins.toFixed(2)} DBT</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
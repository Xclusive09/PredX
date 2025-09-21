import React from 'react';
import MarketCard from './MarketCard';

const MarketList = ({ markets, bettingContract, tokenContract, account }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {markets.map(market => (
        <MarketCard key={market.id} market={market} bettingContract={bettingContract} tokenContract={tokenContract} account={account} />
      ))}
    </div>
  );
};

export default MarketList;
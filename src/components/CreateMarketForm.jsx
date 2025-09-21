import React, { useState } from 'react';
import { CATEGORIES } from '../config/constants';

const CreateMarketForm = ({ bettingContract, refreshMarkets, account }) => {
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState(0);
  const [endTime, setEndTime] = useState('');
  const [outcomeCount, setOutcomeCount] = useState(2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bettingContract && account) {
      try {
        const tx = await bettingContract.createMarket(question, category, Math.floor(new Date(endTime).getTime() / 1000), outcomeCount, account);
        await tx.wait();
        alert('Market created successfully!');
        setQuestion(''); setEndTime(''); setOutcomeCount(2);
        refreshMarkets();
      } catch (err) {
        alert('Error creating market: ' + err.message);
      }
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h2 className="text-lg font-semibold text-dapp-primary mb-2">Create New Market</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question (e.g., Will Chiefs win?)"
          className="input w-full"
          required
          disabled={!account}
        />
        <select
          value={category}
          onChange={(e) => setCategory(Number(e.target.value))}
          className="input w-full"
          disabled={!account}
        >
          {CATEGORIES.map((c, i) => <option key={i} value={i}>{c}</option>)}
        </select>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="input w-full"
          required
          disabled={!account}
        />
        <input
          type="number"
          value={outcomeCount}
          onChange={(e) => setOutcomeCount(Math.max(2, Math.min(5, e.target.value)))}
          min="2"
          max="5"
          className="input w-full"
          required
          disabled={!account}
        />
        <button
          type="submit"
          className="btn-primary w-full disabled:bg-gray-400"
          disabled={!account}
        >
          Create Market
        </button>
      </form>
    </div>
  );
};

export default CreateMarketForm;
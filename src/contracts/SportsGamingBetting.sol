// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SportsGamingBetting is Ownable {
    enum Category { Sports, Gaming }

    struct Market {
        string question;
        Category category;
        uint256 endTime;
        mapping(uint256 => uint256) outcomePools;
        uint256 totalBets;
        uint256 outcomeCount;
        bool resolved;
        uint256 winningOutcome;
        mapping(address => mapping(uint256 => uint256)) userBets;
    }

    IERC20 public betToken;
    uint256 public marketCount;
    mapping(uint256 => Market) public markets;
    uint256 public feePercent = 2;

    event MarketCreated(uint256 indexed id, string question, Category category, uint256 endTime, uint256 outcomeCount);
    event BetPlaced(uint256 indexed id, address user, uint256 outcomeId, uint256 amount);
    event MarketResolved(uint256 indexed id, uint256 winningOutcome);

    constructor(address _betToken) Ownable(msg.sender) {
        betToken = IERC20(_betToken);
    }

    function createMarket(string memory _question, Category _category, uint256 _endTime, uint256 _outcomeCount) external onlyOwner {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(_outcomeCount >= 2 && _outcomeCount <= 5, "Outcome count must be between 2 and 5");
        marketCount++;
        Market storage m = markets[marketCount];
        m.question = _question;
        m.category = _category;
        m.endTime = _endTime;
        m.outcomeCount = _outcomeCount;
        emit MarketCreated(marketCount, _question, _category, _endTime, _outcomeCount);
    }

    function placeBet(uint256 _marketId, uint256 _outcomeId, uint256 _amount) external {
        Market storage m = markets[_marketId];
        require(block.timestamp < m.endTime, "Market has closed");
        require(!m.resolved, "Market is resolved");
        require(_amount > 0, "Bet amount must be greater than 0");
        require(_outcomeId < m.outcomeCount, "Invalid outcome ID");

        betToken.transferFrom(msg.sender, address(this), _amount);
        m.outcomePools[_outcomeId] += _amount;
        m.userBets[msg.sender][_outcomeId] += _amount;
        m.totalBets += _amount;
        emit BetPlaced(_marketId, msg.sender, _outcomeId, _amount);
    }

    function resolveMarket(uint256 _marketId, uint256 _winningOutcome) external onlyOwner {
        Market storage m = markets[_marketId];
        require(block.timestamp >= m.endTime, "Market has not ended yet");
        require(!m.resolved, "Market is already resolved");
        require(_winningOutcome < m.outcomeCount, "Invalid winning outcome");

        m.resolved = true;
        m.winningOutcome = _winningOutcome;
        emit MarketResolved(_marketId, _winningOutcome);
    }

    function claimWinnings(uint256 _marketId) external {
        Market storage m = markets[_marketId];
        require(m.resolved, "Market is not resolved");
        uint256 userBet = m.userBets[msg.sender][m.winningOutcome];
        require(userBet > 0, "No winning bet placed");

        uint256 fee = (m.totalBets * feePercent) / 100;
        uint256 payoutPool = m.totalBets - fee;
        uint256 winnerPool = m.outcomePools[m.winningOutcome];
        uint256 payout = (userBet * payoutPool) / winnerPool;

        m.userBets[msg.sender][m.winningOutcome] = 0;
        betToken.transfer(msg.sender, payout);
    }

    function getMarket(uint256 _id) external view returns (string memory, Category, uint256, uint256, bool, uint256) {
        Market storage m = markets[_id];
        return (m.question, m.category, m.endTime, m.outcomeCount, m.resolved, m.winningOutcome);
    }

    function getOutcomePool(uint256 _id, uint256 _outcomeId) external view returns (uint256) {
        return markets[_id].outcomePools[_outcomeId];
    }

    function getUserBet(uint256 _id, address _user, uint256 _outcomeId) external view returns (uint256) {
        return markets[_id].userBets[_user][_outcomeId];
    }

    function getAllMarkets() external view returns (
        string[] memory,
        Category[] memory,
        uint256[] memory,
        uint256[] memory,
        bool[] memory,
        uint256[] memory
    ) {
        string[] memory questions = new string[](marketCount);
        Category[] memory categories = new Category[](marketCount);
        uint256[] memory endTimes = new uint256[](marketCount);
        uint256[] memory outcomeCounts = new uint256[](marketCount);
        bool[] memory resolveds = new bool[](marketCount);
        uint256[] memory winningOutcomes = new uint256[](marketCount);

        for (uint256 i = 1; i <= marketCount; i++) {
            Market storage m = markets[i];
            questions[i-1] = m.question;
            categories[i-1] = m.category;
            endTimes[i-1] = m.endTime;
            outcomeCounts[i-1] = m.outcomeCount;
            resolveds[i-1] = m.resolved;
            winningOutcomes[i-1] = m.winningOutcome;
        }

        return (questions, categories, endTimes, outcomeCounts, resolveds, winningOutcomes);
    }

}
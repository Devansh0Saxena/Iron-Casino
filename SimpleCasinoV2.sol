// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleCasinoV2 is ReentrancyGuard, Ownable {
    
    // --- STATE ---
    mapping(address => uint256) public balances;
    uint256 public houseBank;
    
    // Security: Max bet limits
    uint256 public maxBetDice = 10 ether;
    uint256 public maxBetMines = 10 ether;
    
    // Security: Max multipliers to prevent house insolvency
    uint256 public constant MAX_DICE_MULTIPLIER = 200000; // 20x max (multiplier format: 200000 = 20x)
    uint256 public constant MIN_ROLL_UNDER = 5; // Minimum rollUnder to prevent extreme multipliers
    
    event GameResult(address indexed user, string game, uint256 payout, bool won);
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    // --- CONSTRUCTOR ---
    constructor(address initialOwner) Ownable(initialOwner) {
        // Contract initialized with owner
    }

    // --- BANKING ---
    function depositHouse() external payable onlyOwner {
        houseBank += msg.value;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    // Owner functions to adjust limits
    function setMaxBetDice(uint256 _maxBet) external onlyOwner {
        maxBetDice = _maxBet;
    }
    
    function setMaxBetMines(uint256 _maxBet) external onlyOwner {
        maxBetMines = _maxBet;
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient chips");
        balances[msg.sender] -= amount;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdraw(msg.sender, amount);
    }

    // --- GAMES ---

    // 1. DICE 🎲
    function playDice(uint256 betAmount, uint256 rollUnder, uint256 userNonce) external nonReentrant {
        // Security: Max bet limit
        require(betAmount <= maxBetDice, "Bet exceeds maximum");
        require(balances[msg.sender] >= betAmount, "Insufficient balance");
        
        // Security: Minimum rollUnder to prevent extreme multipliers
        require(rollUnder >= MIN_ROLL_UNDER && rollUnder < 99, "Invalid prediction");
        
        // Security: Calculate max possible payout before playing
        // Multiplier = 99 / rollUnder (house edge: 1%)
        uint256 multiplier = (99 * 10000) / rollUnder;
        // Cap multiplier to prevent house insolvency
        if (multiplier > MAX_DICE_MULTIPLIER) {
            multiplier = MAX_DICE_MULTIPLIER;
        }
        uint256 maxPayout = (betAmount * multiplier) / 10000;
        require(houseBank >= maxPayout, "House cannot cover potential win");

        balances[msg.sender] -= betAmount;

        // Security: Enhanced RNG with user-provided entropy to reduce miner manipulation
        // Combine multiple entropy sources: user nonce, sender, block data, transaction data
        uint256 roll = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            msg.sender,
            userNonce,
            tx.origin,
            gasleft()
        ))) % 100;
        
        bool won = roll < rollUnder;
        uint256 payout = 0;

        if (won) {
            payout = (betAmount * multiplier) / 10000;
            
            require(houseBank >= payout, "House cannot cover win");
            houseBank -= payout; // House pays
            balances[msg.sender] += payout + betAmount; // Return bet + win
        } else {
            houseBank += betAmount; // House takes
        }

        emit GameResult(msg.sender, "Dice", won ? payout : 0, won);
    }

    // 2. MINES 💣
    // Proper probability calculation: P(win) = product of (safe tiles remaining / total tiles remaining) for each step
    function playMines(uint256 betAmount, uint256 mineCount, uint256 tileCount, uint256 userNonce) external nonReentrant {
        // Security: Max bet limit
        require(betAmount <= maxBetMines, "Bet exceeds maximum");
        require(balances[msg.sender] >= betAmount, "Insufficient balance");
        require(mineCount > 0 && mineCount < 24, "Invalid mines (1-23)"); // Max 23 mines to ensure at least 2 safe tiles
        require(tileCount > 0 && tileCount <= (25 - mineCount), "Invalid tile count");

        // Security: Calculate proper win probability
        // P(win) = (25-mineCount)/25 * (24-mineCount)/24 * ... for tileCount steps
        // We calculate this as a percentage (0-10000 basis points)
        uint256 winProbability = 10000; // Start at 100%
        uint256 totalTiles = 25;
        uint256 safeTiles = 25 - mineCount;
        
        for (uint256 i = 0; i < tileCount; i++) {
            if (safeTiles == 0) {
                winProbability = 0; // Impossible to win
                break;
            }
            // Multiply by probability of picking safe tile at this step
            winProbability = (winProbability * safeTiles) / totalTiles;
            totalTiles--;
            safeTiles--; // One less safe tile after each successful pick
        }
        
        // Security: Calculate max possible payout before playing
        // Payout multiplier = 1 / winProbability (with house edge)
        // House edge: 2% (multiply by 98/100)
        // winProbability is in basis points (0-10000), where 10000 = 100%
        // Fair multiplier = 100000000 / winProbability (in our format where 10000 = 1x)
        uint256 multiplier;
        if (winProbability > 0) {
            // multiplier = (100000000 * 98) / (winProbability * 100) = 98000000 / winProbability
            multiplier = (98000000) / winProbability; // 98% of fair odds
            // Cap multiplier at 50x (500000) to prevent house insolvency
            if (multiplier > 500000) {
                multiplier = 500000; // 50x max
            }
        } else {
            multiplier = 0; // Impossible to win
        }
        
        uint256 maxPayout = (betAmount * multiplier) / 10000;
        require(houseBank >= maxPayout, "House cannot cover potential win");

        balances[msg.sender] -= betAmount;

        // Security: Enhanced RNG with user-provided entropy
        uint256 rng = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            block.number,
            msg.sender,
            userNonce,
            tx.origin,
            gasleft()
        ))) % 10000; // Use 10000 for better precision

        // Win if RNG is less than win probability
        bool won = rng < winProbability;

        uint256 payout = 0;
        if (won) {
            payout = (betAmount * multiplier) / 10000;
            
            require(houseBank >= payout, "House broke");
            houseBank -= payout;
            balances[msg.sender] += payout + betAmount;
        } else {
            houseBank += betAmount;
        }

        emit GameResult(msg.sender, "Mines", won ? payout : 0, won);
    }
}
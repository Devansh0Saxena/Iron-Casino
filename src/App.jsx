import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

// ------------------------------------------------------
// 1. CONFIGURATION
// ------------------------------------------------------
// ⚠️ PASTE YOUR NEW V2 CONTRACT ADDRESS HERE ⚠️
const CONTRACT_ADDRESS = "0x19A34c0E34b6aC994a41ef3D2C8e9D6835FDb7f8"; 
const ABI = [
	{
		"inputs": [],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "depositHouse",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Deposit",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "game",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "payout",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "won",
				"type": "bool"
			}
		],
		"name": "GameResult",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "rollUnder",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "userNonce",
				"type": "uint256"
			}
		],
		"name": "playDice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "mineCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tileCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "userNonce",
				"type": "uint256"
			}
		],
		"name": "playMines",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "userNonce",
				"type": "uint256"
			}
		],
		"name": "playPlinko",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maxBet",
				"type": "uint256"
			}
		],
		"name": "setMaxBetDice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maxBet",
				"type": "uint256"
			}
		],
		"name": "setMaxBetMines",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_maxBet",
				"type": "uint256"
			}
		],
		"name": "setMaxBetPlinko",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdraw",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balances",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "houseBank",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_DICE_MULTIPLIER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxBetDice",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxBetMines",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "maxBetPlinko",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_ROLL_UNDER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const MUSIC_URL = "/qie_background_music.mp3";

// ------------------------------------------------------
// 2. COMPONENTS
// ------------------------------------------------------

const Navbar = ({ address, connect, balance, setPage, page, toggleMusic, isMuted }) => (
  <nav className="w-full h-20 border-b border-qie-border bg-qie-dark/95 backdrop-blur fixed top-0 z-50 flex items-center justify-between px-8">
    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPage('lobby')}>
      <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-blue-600 rounded-lg shadow-neon group-hover:shadow-[0_0_25px_rgba(176,38,255,0.6)] transition-all"></div>
      <h1 className="text-2xl font-bold tracking-wider font-mono" style={{color: '#FFD700'}}>IRON CASINO</h1>
    </div>
    
    <div className="flex gap-8 text-sm font-bold tracking-widest text-gray-400 font-mono hidden md:flex">
      {['LOBBY', 'ARCADE', 'BETS', 'VAULT'].map((item) => (
        <button key={item} onClick={() => setPage(item.toLowerCase())} className={`${page === item.toLowerCase() ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]' : 'hover:text-white'} transition-all`}>{item}</button>
      ))}
    </div>

    <div className="flex items-center gap-4">
      <button onClick={toggleMusic} className="text-gray-400 hover:text-white">{isMuted ? "🔇" : "🔊"}</button>
      {address ? (
        <div className="flex gap-4 items-center bg-qie-card border border-qie-border rounded-full p-1 pr-6">
          <div className="bg-neon-purple/20 text-neon-purple px-4 py-1.5 rounded-full font-mono text-sm font-bold border border-neon-purple/50">{parseFloat(balance).toFixed(2)} QIE</div>
          <div className="text-xs font-mono text-gray-400">{address.slice(0,6)}...</div>
        </div>
      ) : (
        <button onClick={connect} className="bg-neon-purple text-white px-6 py-2.5 font-bold font-mono rounded shadow-neon hover:bg-purple-600 transition-all">CONNECT WALLET</button>
      )}
    </div>
  </nav>
);

// ------------------------------------------------------
// 3. MAIN APP
// ------------------------------------------------------

export default function App() {
  const [page, setPage] = useState('lobby'); 
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState('0');
  const [signer, setSigner] = useState(null);
  const [activeGame, setActiveGame] = useState('dice');
  
  // Audio
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  // --- GAME STATES ---
  const [betAmount, setBetAmount] = useState("0.1"); // Global Bet Input
  
  // DICE
  const [prediction, setPrediction] = useState(50);
  const [diceRolling, setDiceRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);

  // MINES
  const [minesGrid, setMinesGrid] = useState(Array(25).fill(null)); 
  const [selectedTiles, setSelectedTiles] = useState(0);
  const [mineCount, setMineCount] = useState(3);
  const [minesPlaying, setMinesPlaying] = useState(false);

  // PLINKO
  const [plinkoPlaying, setPlinkoPlaying] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 0, slot: null });
  const [plinkoResult, setPlinkoResult] = useState(null);

  // BANKING
  const [depositAmt, setDepositAmt] = useState("");
  const [withdrawAmt, setWithdrawAmt] = useState("");

  // Music Init - Initialize audio properly with autoplay
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(MUSIC_URL);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.2;
      
      // Handle audio errors
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
      
      // Preload audio
      audioRef.current.load();
      
      // Try to autoplay (may be blocked by browser)
      const tryAutoplay = async () => {
        try {
          await audioRef.current.play();
          setIsMuted(false);
        } catch (error) {
          // Autoplay blocked - user will need to click mute button
          console.log('Autoplay blocked, waiting for user interaction');
          setIsMuted(true);
        }
      };
      
      tryAutoplay();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isMuted) {
        // Play music - handle autoplay policy
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsMuted(false);
        }
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    } catch (error) {
      console.error('Error toggling music:', error);
    }
  };

  // Connect
  async function connectWallet() {
    if (!window.ethereum) return alert("Install Metamask!");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const _signer = await provider.getSigner();
      setSigner(_signer);
      const _addr = await _signer.getAddress();
      setAddress(_addr);
      updateBalance(_signer, _addr);
      // Try to start music after wallet connection (user interaction)
      if(isMuted && audioRef.current) {
        setTimeout(() => toggleMusic(), 500);
      }
    } catch(e) { console.error(e); }
  }

  async function updateBalance(_signer, _addr) {
    if(!_signer) return;
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, _signer);
      const bal = await contract.balances(_addr || address);
      setBalance(ethers.formatEther(bal));
    } catch(e) { 
      console.error("Balance Error", e); 
      // If contract address is not set, show helpful message
      if (CONTRACT_ADDRESS === "YOUR_NEW_V2_ADDRESS_HERE") {
        console.warn("⚠️ Contract address not set! Update CONTRACT_ADDRESS in App.jsx");
      }
    }
  }

  // Auto-refresh balance when address changes
  useEffect(() => {
    if (address && signer) {
      updateBalance(signer, address);
      // Refresh balance every 10 seconds
      const interval = setInterval(() => {
        updateBalance(signer, address);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [address, signer]);

  // --- ACTIONS ---

  // 🎲 DICE
  async function handlePlayDice() {
    if (!signer) return alert("Connect Wallet!");
    setDiceRolling(true);
    setDiceResult(null);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // Generate random nonce for additional entropy (reduces miner manipulation)
      const userNonce = Math.floor(Math.random() * 1000000);
      const tx = await contract.playDice(ethers.parseEther(betAmount), prediction, userNonce);
      
      let counter = 0; // Animation
      const interval = setInterval(() => { setDiceResult(Math.floor(Math.random() * 100)); counter++; if(counter > 20) clearInterval(interval); }, 100);

      await tx.wait(); // Wait for blockchain
      clearInterval(interval);
      setDiceRolling(false);
      updateBalance(signer);
      alert("Round Complete! Check Balance.");
    } catch (e) { setDiceRolling(false); alert("Game Failed: " + (e.reason || "Check console")); }
  }

  // 💣 MINES (Backend Integration)
  const toggleMineTile = (index) => {
    if (minesPlaying) return; // Locked while playing
    const newGrid = [...minesGrid];
    if (newGrid[index] === 'selected') {
        newGrid[index] = null;
        setSelectedTiles(prev => prev - 1);
    } else {
        newGrid[index] = 'selected';
        setSelectedTiles(prev => prev + 1);
    }
    setMinesGrid(newGrid);
  };

  async function handlePlayMines() {
    if (!signer) return alert("Connect Wallet!");
    if (selectedTiles === 0) return alert("Select at least 1 tile!");
    
    setMinesPlaying(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // Generate random nonce for additional entropy (reduces miner manipulation)
      const userNonce = Math.floor(Math.random() * 1000000);
      // We send: Bet, Number of Mines, Number of Tiles Selected, User Nonce
      const tx = await contract.playMines(ethers.parseEther(betAmount), mineCount, selectedTiles, userNonce);
      alert("Submitting Mines Path to Blockchain...");
      
      const receipt = await tx.wait();
      
      // Check logs to see if we won
      const event = receipt.logs.find(log => {
        try { return contract.interface.parseLog(log).name === 'GameResult'; } catch (e) { return false; }
      });
      
      const result = contract.interface.parseLog(event);
      const won = result.args.won;

      // REVEAL BOARD BASED ON RESULT
      const finalGrid = minesGrid.map(status => {
          if (status === 'selected') return won ? 'safe' : 'boom'; // If won, all selected are gems. If lost, they were bombs.
          return status;
      });
      setMinesGrid(finalGrid);
      setMinesPlaying(false);
      updateBalance(signer);
      alert(won ? "YOU SURVIVED! 💎" : "BOOM! You hit a mine. 💣");
      
      // Reset after 3 seconds
      setTimeout(() => { setMinesGrid(Array(25).fill(null)); setSelectedTiles(0); }, 3000);

    } catch (e) { setMinesPlaying(false); alert("Mines Failed: " + (e.reason || "Check console")); }
  }

  // 🎯 PLINKO
  async function handlePlayPlinko() {
    if (!signer) return alert("Connect Wallet!");
    if (!betAmount || parseFloat(betAmount) <= 0) return alert("Enter valid bet amount!");
    
    setPlinkoPlaying(true);
    setPlinkoResult(null);
    // Show ball at top (hovering/pulsing)
    setBallPosition({ x: 50, y: 0, slot: null });
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const userNonce = Math.floor(Math.random() * 1000000);
      const tx = await contract.playPlinko(ethers.parseEther(betAmount), userNonce);
      
      const receipt = await tx.wait();
      
      // Parse GameResult event
      const event = receipt.logs.find(log => {
        try { 
          const parsed = contract.interface.parseLog(log);
          return parsed && parsed.name === 'GameResult' && parsed.args.game === 'Plinko';
        } catch (e) { return false; }
      });
      
      if (!event) {
        throw new Error("Could not find Plinko game result");
      }
      
      const result = contract.interface.parseLog(event);
      const payout = result.args.payout;
      const won = result.args.won;
      
      // Calculate multiplier
      const betAmountWei = ethers.parseEther(betAmount);
      const multiplier = won && payout > 0 ? parseFloat(ethers.formatEther(payout)) / parseFloat(ethers.formatEther(betAmountWei)) : 0;
      
      // Determine target slot based on multiplier
      let targetSlot = 0;
      if (multiplier >= 28.5) {
        // 29x: Slot 0 or 7 (pick randomly)
        targetSlot = Math.random() < 0.5 ? 0 : 7;
      } else if (multiplier >= 3.5 && multiplier < 4.5) {
        // 4x: Slot 1 or 6
        targetSlot = Math.random() < 0.5 ? 1 : 6;
      } else if (multiplier >= 1.4 && multiplier < 1.6) {
        // 1.5x: Slot 2 or 5
        targetSlot = Math.random() < 0.5 ? 2 : 5;
      } else if (multiplier >= 0.25 && multiplier < 0.35) {
        // 0.3x: Slot 3, 4, or 5
        const options = [3, 4, 5];
        targetSlot = options[Math.floor(Math.random() * options.length)];
      } else {
        // Default to middle if multiplier doesn't match
        targetSlot = 4;
      }
      
      setPlinkoResult({ multiplier, won, payout: parseFloat(ethers.formatEther(payout)) });
      
      // Animate ball dropping to target slot
      animatePlinkoBall(targetSlot);
      
      updateBalance(signer);
      
      // Reset after animation
      setTimeout(() => {
        setPlinkoPlaying(false);
        setPlinkoResult(null);
        setBallPosition({ x: 50, y: 0, slot: null });
      }, 3000);
      
    } catch (e) { 
      setPlinkoPlaying(false);
      setBallPosition({ x: 50, y: 0, slot: null });
      alert("Plinko Failed: " + (e.reason || "Check console")); 
    }
  }

  function animatePlinkoBall(targetSlot) {
    // Calculate target x position (slot 0-7, 8 buckets)
    // Buckets are evenly spaced, slot 0 is leftmost, slot 7 is rightmost
    const slotWidth = 100 / 8; // 12.5% per slot
    const targetX = (targetSlot * slotWidth) + (slotWidth / 2); // Center of slot
    
    // Animate ball dropping
    let currentY = 0;
    const targetY = 85; // Bottom position
    const steps = 30;
    const stepY = targetY / steps;
    const stepX = (targetX - 50) / steps; // Move from center (50%) to target
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      currentY += stepY;
      const currentX = 50 + (stepX * step);
      
      setBallPosition({ x: currentX, y: currentY, slot: step === steps ? targetSlot : null });
      
      if (step >= steps) {
        clearInterval(interval);
      }
    }, 50); // 50ms per step = 1.5s total animation
  }

  // 🏦 BANKING
  async function handleTx(type) {
    if (!signer) return alert("Connect Wallet!");
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const val = type === 'deposit' ? depositAmt : withdrawAmt;
      if(!val) return alert("Enter amount");
      
      const tx = type === 'deposit' 
        ? await contract.deposit({ value: ethers.parseEther(val) })
        : await contract.withdraw(ethers.parseEther(val));
      
      alert("Processing...");
      await tx.wait();
      alert("Success!");
      updateBalance(signer);
      setDepositAmt(""); setWithdrawAmt("");
    } catch(e) { alert("Failed: " + e.message); }
  }

  return (
    <div className="min-h-screen font-sans text-white pt-20" style={{backgroundColor: 'transparent'}}>
      {/* Corner Mute Button - Fixed position */}
      <button 
        onClick={toggleMusic} 
        className="fixed bottom-6 right-6 z-50 bg-black/70 hover:bg-black/90 border-2 border-white/30 rounded-full p-4 text-2xl shadow-lg backdrop-blur-sm transition-all hover:scale-110"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
      
      <Navbar address={address} connect={connectWallet} balance={balance} setPage={setPage} page={page} toggleMusic={toggleMusic} isMuted={isMuted} />

      <main className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
        
        {/* ================= LOBBY ================= */}
        {page === 'lobby' && (
          <div className="text-center mt-24">
            <h1 className="text-7xl font-bold mb-8 font-mono tracking-tight">THE CASINO <span className="text-neon-purple">V2</span></h1>
             <p className="text-xl text-gray-400 mb-8 font-mono">Dice. Mines. Bets. <br/>Fully On-Chain.</p>
            <button onClick={() => setPage('arcade')} className="px-12 py-5 bg-white text-black font-black text-lg rounded shadow-neon hover:scale-105 transition-all">START PLAYING ➜</button>
          </div>
        )}

        {/* ================= ARCADE ================= */}
        {page === 'arcade' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            {/* SIDEBAR */}
            <div className="bg-qie-card border border-qie-border p-4 rounded-xl h-fit lg:col-span-1 space-y-2">
              <h3 className="text-gray-400 font-mono mb-4 text-sm">GAMES</h3>
              <button onClick={() => setActiveGame('dice')} className={`w-full text-left px-4 py-3 rounded flex justify-between border font-bold ${activeGame === 'dice' ? 'bg-neon-purple/20 border-neon-purple text-white' : 'bg-qie-dark border-qie-border text-gray-500'}`}>🎲 DICE</button>
              <button onClick={() => setActiveGame('mines')} className={`w-full text-left px-4 py-3 rounded flex justify-between border font-bold ${activeGame === 'mines' ? 'bg-neon-purple/20 border-neon-purple text-white' : 'bg-qie-dark border-qie-border text-gray-500'}`}>💣 MINES</button>
              <button onClick={() => setActiveGame('plinko')} className={`w-full text-left px-4 py-3 rounded flex justify-between border font-bold ${activeGame === 'plinko' ? 'bg-neon-purple/20 border-neon-purple text-white' : 'bg-qie-dark border-qie-border text-gray-500'}`}>🎯 PLINKO</button>
            </div>

            {/* GAME AREA */}
            <div className="lg:col-span-3">
              
              {/* --- DICE --- */}
              {activeGame === 'dice' && (
                <div className="bg-qie-card border border-qie-border p-8 rounded-xl relative overflow-hidden text-center">
                  <h2 className="text-3xl font-bold font-mono mb-8">DICE</h2>
                  <div className="bg-qie-dark rounded-xl p-8 border border-qie-border mb-8">
                    <p className="text-gray-400 mb-2 font-mono text-sm">ROLL UNDER {prediction}</p>
                    <div className={`text-8xl font-black text-white mb-8 transition-all ${diceRolling ? 'scale-110 text-neon-purple blur-sm' : ''}`}>{diceResult !== null ? diceResult : prediction}</div>
                    <input type="range" min="5" max="95" value={prediction} onChange={(e) => setPrediction(e.target.value)} className="w-full h-2 bg-gray-700 rounded-lg accent-neon-purple"/>
                  </div>
                  
                  {/* BET INPUT RESTORED */}
                  <div className="flex gap-4 mb-4 justify-center items-center">
                     <span className="font-mono text-gray-400">BET AMOUNT (QIE):</span>
                     <input type="text" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="bg-qie-dark border border-qie-border p-2 rounded w-32 text-center font-bold text-white focus:border-neon-purple outline-none" />
                  </div>

                  <button onClick={handlePlayDice} disabled={diceRolling} className="w-full py-4 bg-gradient-to-r from-neon-purple to-purple-600 rounded text-xl font-bold hover:scale-[1.02] shadow-neon text-white">
                    {diceRolling ? "ROLLING..." : "ROLL DICE"}
                  </button>
                </div>
              )}

              {/* --- MINES --- */}
              {activeGame === 'mines' && (
                <div className="bg-qie-card border border-qie-border p-8 rounded-xl relative text-center">
                  <h2 className="text-3xl font-bold font-mono mb-4">MINES</h2>
                  <p className="text-gray-400 mb-4">Select tiles to survive. Click 'CASHOUT' to verify on chain.</p>
                  
                  <div className="grid grid-cols-5 gap-3 max-w-sm mx-auto mb-8">
                    {minesGrid.map((status, i) => (
                      <button key={i} onClick={() => toggleMineTile(i)} className={`aspect-square rounded-lg text-2xl font-bold transition-all transform hover:scale-105 ${status === 'selected' ? 'bg-neon-cyan border-2 border-white shadow-neon' : status === 'safe' ? 'bg-green-500/20 border-green-500' : status === 'boom' ? 'bg-red-500/20 border-red-500' : 'bg-qie-dark border-2 border-qie-border'}`}>
                        {status === 'safe' ? '💎' : status === 'boom' ? '💣' : ''}
                      </button>
                    ))}
                  </div>

                  {/* MINES SETTINGS & BET */}
                  <div className="grid grid-cols-2 gap-4 mb-4 max-w-md mx-auto">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">MINES COUNT</p>
                        <input type="number" min="1" max="24" value={mineCount} onChange={(e) => setMineCount(e.target.value)} className="bg-qie-dark border border-qie-border p-2 rounded w-full text-center text-white" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">BET AMOUNT</p>
                        <input type="text" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="bg-qie-dark border border-qie-border p-2 rounded w-full text-center text-white" />
                    </div>
                  </div>

                  <button onClick={handlePlayMines} disabled={minesPlaying} className="w-full py-4 bg-gradient-to-r from-neon-purple to-purple-600 rounded text-xl font-bold hover:scale-[1.02] shadow-neon text-white max-w-md mx-auto block">
                    {minesPlaying ? "VERIFYING..." : `BET & REVEAL (${selectedTiles} TILES)`}
                  </button>
                </div>
              )}

              {/* --- PLINKO --- */}
              {activeGame === 'plinko' && (
                <div className="bg-qie-card border border-qie-border p-8 rounded-xl relative text-center">
                  <h2 className="text-3xl font-bold font-mono mb-4">PLINKO</h2>
                  
                  {/* Plinko Board */}
                  <div className="relative bg-qie-dark rounded-xl p-8 border border-qie-border mb-8" style={{ minHeight: '500px' }}>
                    {/* Pins Grid - 8 rows */}
                    <div className="relative" style={{ height: '400px' }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                        <div key={row} className="flex justify-center mb-2" style={{ marginTop: `${row * 9}px`, gap: '54px' }}>
                          {Array.from({ length: row }).map((_, pinIndex) => (
                            <div
                              key={pinIndex}
                              className="w-3 h-3 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,243,255,0.6)]"
                            />
                          ))}
                        </div>
                      ))}
                      
                      {/* Ball */}
                      {plinkoPlaying && (
                        <div
                          className={`absolute w-6 h-6 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(255,255,0,0.8)] transition-all duration-75 ${ballPosition.slot === null ? 'animate-pulse' : ''}`}
                          style={{
                            left: `${ballPosition.x}%`,
                            top: `${ballPosition.y}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Buckets Row - 8 slots with multipliers */}
                    <div className="flex justify-center gap-2" style={{ marginTop: '40px' }}>
                      {[
                        { slot: 0, mult: '29x' },
                        { slot: 1, mult: '4x' },
                        { slot: 2, mult: '1.5x' },
                        { slot: 3, mult: '0.3x' },
                        { slot: 4, mult: '0.3x' },
                        { slot: 5, mult: '1.5x' },
                        { slot: 6, mult: '4x' },
                        { slot: 7, mult: '29x' },
                      ].map(({ slot, mult }) => (
                        <div
                          key={slot}
                          className={`p-3 rounded border-2 text-xs font-bold transition-all ${
                            ballPosition.slot === slot
                              ? 'bg-green-500/30 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.8)]'
                              : 'bg-qie-dark border-qie-border'
                          }`}
                          style={{ width: '54.6px' }}
                        >
                          <div className="text-neon-cyan font-mono text-center">{mult}</div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Result Display */}
                    {plinkoResult && (
                      <div className="mt-4 p-4 bg-neon-purple/20 border border-neon-purple rounded">
                        <p className="text-lg font-bold">
                          {plinkoResult.won ? (
                            <span className="text-green-400">
                              WIN! {plinkoResult.multiplier.toFixed(2)}x = {plinkoResult.payout.toFixed(4)} QIE
                            </span>
                          ) : (
                            <span className="text-red-400">LOST</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* BET INPUT */}
                  <div className="flex gap-4 mb-4 justify-center items-center">
                    <span className="font-mono text-gray-400">BET AMOUNT (QIE):</span>
                    <input 
                      type="text" 
                      value={betAmount} 
                      onChange={(e) => setBetAmount(e.target.value)} 
                      className="bg-qie-dark border border-qie-border p-2 rounded w-32 text-center font-bold text-white focus:border-neon-purple outline-none" 
                    />
                  </div>

                  <button 
                    onClick={handlePlayPlinko} 
                    disabled={plinkoPlaying} 
                    className="w-full py-4 bg-gradient-to-r from-neon-purple to-purple-600 rounded text-xl font-bold hover:scale-[1.02] shadow-neon text-white"
                  >
                    {plinkoPlaying ? "DROPPING..." : "DROP BALL"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= BETS (ORACLE) ================= */}
        {page === 'bets' && (
           <div className="mt-8 bg-qie-card border border-qie-border p-4 rounded-xl h-[700px] flex flex-col">
              <div className="flex justify-between items-center mb-4 px-4">
                <h2 className="text-3xl font-bold font-mono">BETS / CRYPTO ORACLE</h2>
                <div className="flex gap-2">
                   <button className="bg-green-600 px-6 py-2 rounded font-bold hover:bg-green-500">PREDICT UP</button>
                   <button className="bg-red-600 px-6 py-2 rounded font-bold hover:bg-red-500">PREDICT DOWN</button>
                </div>
              </div>
              <div className="flex-grow bg-black rounded-lg overflow-hidden border border-qie-border">
                <iframe src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=COINBASE%3ABTCUSD&interval=1&hidesidetoolbar=1&symboledit=0&saveimage=0&theme=dark" style={{width: '100%', height: '100%', border: 'none'}}></iframe>
              </div>
            </div>
        )}

        {/* ================= VAULT ================= */}
        {page === 'vault' && (
          <div className="max-w-xl mx-auto mt-20 bg-qie-card border border-qie-border p-8 rounded-xl shadow-neon text-center">
            <h2 className="text-3xl font-bold font-mono mb-8">VAULT</h2>
            <div className="bg-qie-dark p-6 rounded mb-8 border border-qie-border">
              <p className="text-gray-400 text-sm">AVAILABLE BALANCE</p>
              <p className="text-5xl font-bold text-white">{parseFloat(balance).toFixed(2)} <span className="text-neon-cyan text-2xl">QIE</span></p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <input type="text" placeholder="Amount (QIE)" value={depositAmt} onChange={(e) => setDepositAmt(e.target.value)} className="w-full bg-qie-dark border border-qie-border rounded p-3 mb-2 text-white text-center focus:border-green-500 outline-none" />
                    <button onClick={() => handleTx('deposit')} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded">DEPOSIT</button>
                </div>
                <div>
                    <input type="text" placeholder="Amount (QIE)" value={withdrawAmt} onChange={(e) => setWithdrawAmt(e.target.value)} className="w-full bg-qie-dark border border-qie-border rounded p-3 mb-2 text-white text-center focus:border-red-500 outline-none" />
                    <button onClick={() => handleTx('withdraw')} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded">WITHDRAW</button>
                </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
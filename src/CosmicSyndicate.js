import React, { useState, useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
// Ensure you have a style.css file or remove this line if styling is handled via Tailwind//
import './style.css';
import {
  Sparkles,
  Zap,
  Users,
  Target,
  Trophy,
  Church,
  ShoppingBag,
  Star,
  Flame,
  Shield,
  Sword,
  Cpu,
  Droplet,
  Briefcase,
  Music,
  Menu,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Book,
  MessageSquare,
  Globe,
  LogOut,
  Play,
  Pause,
  Gamepad2,
  Ghost,
  Brain,
  Timer,
  XCircle,
  Dices,
  Heart,
  Map,
} from 'lucide-react';

// --- Loading reviews--
// Load reviews with the average::
const loadReviews = async () => {
  try {
    const response = await fetch('/api/reviews');
    if (!response.ok) throw new Error('Failed');
    return await response.json(); // Just return the array
  } catch (error) {
    console.error('Error loading reviews:', error);
    return [{ id: 1, name: 'Gloria', rating: 4, comment: 'I guess they are okay', date: 'Cosmic Year 2024.7' }];
  }
};
// -- save saving reviews
const saveReview = async (review) => {
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error || 'Failed to save review');
      return false;
    }
    return true;
  } catch (error) {
    alert('Network error. Please try again.');
    return false;
  }
};

// --- Loading donations --
const loadDonations = async () => {
  try {
    const response = await fetch('/api/donations');
    if (!response.ok) throw new Error('Failed');
    return await response.json(); // Returns { donations: [...], total: number }
  } catch (error) {
    console.error('Error loading donations:', error);
    return { donations: [], total: 0 };
  }
};

// --- Saving donations --
const saveDonation = async (donation) => {
  try {
    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donation),
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error || 'Failed to save donation');
      return null;
    }
    return await response.json();
  } catch (error) {
    alert('Network error. Please try again.');
    return null;
  }
};
// --- NEW COMPONENT: WARP SPEED BACKGROUND ---
const WarpSpeedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Star properties
    const stars = [];
    const starCount = 400;

    class Star {
      constructor() {
        this.x = Math.random() * width - width / 2;
        this.y = Math.random() * height - height / 2;
        this.z = Math.random() * width; // Depth
        this.pz = this.z; // Previous z
      }

      update() {
        this.z = this.z - 15; // Speed of warp
        if (this.z < 1) {
          this.z = width;
          this.x = Math.random() * width - width / 2;
          this.y = Math.random() * height - height / 2;
          this.pz = this.z;
        }
      }

      draw() {
        const sx = (this.x / this.z) * width + width / 2;
        const sy = (this.y / this.z) * height + height / 2;

        const r = ((width - this.z) / width) * 2; // Radius based on depth

        // Previous position for trail effect (Anime.js style streaks)
        const px = (this.x / this.pz) * width + width / 2;
        const py = (this.y / this.pz) * height + height / 2;

        this.pz = this.z;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.lineWidth = Math.min(r, 3);
        // Cyan to Purple gradient stroke depending on depth
        const alpha = 1 - this.z / width;
        ctx.strokeStyle = `rgba(${100 + (255 - this.z / 4)
          }, ${200}, ${255}, ${alpha})`;
        ctx.stroke();
      }
    }

    // Init stars
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    const render = () => {
      // Create trails by not clearing completely (motion blur effect)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
  );
};

// --- NEW COMPONENT: ARCADE OVERLAY ---
const ArcadeOverlay = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState('menu'); // menu, whack, memory

  // -- WHACK A MOLE STATE --
  const [whackScore, setWhackScore] = useState(0);
  const [activeHole, setActiveHole] = useState(null);
  const [whackTime, setWhackTime] = useState(30);
  const [isWhackPlaying, setIsWhackPlaying] = useState(false);

  // -- MEMORY GAME STATE --
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // WHACK LOGIC
  useEffect(() => {
    let interval;
    let timerInterval;
    if (activeGame === 'whack' && isWhackPlaying) {
      interval = setInterval(() => {
        const randomHole = Math.floor(Math.random() * 9);
        setActiveHole(randomHole);
      }, 700);

      timerInterval = setInterval(() => {
        setWhackTime((prev) => {
          if (prev <= 1) {
            setIsWhackPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };
  }, [activeGame, isWhackPlaying]);

  const startWhack = () => {
    setWhackScore(0);
    setWhackTime(30);
    setIsWhackPlaying(true);
  };

  const handleWhack = (index) => {
    if (index === activeHole && isWhackPlaying) {
      setWhackScore((s) => s + 10);
      setActiveHole(null); // Hide immediately
    }
  };

  // MEMORY LOGIC
  const initializeMemory = () => {
    const icons = [Zap, Star, Flame, Shield, Sword, Cpu, Ghost, Music];
    // Create pairs
    const deck = [...icons, ...icons]
      .sort(() => Math.random() - 0.5)
      .map((Icon, index) => ({ id: index, Icon }));
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setMemoryMoves(0);
  };

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || solved.includes(id))
      return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].Icon === cards[second].Icon) {
        setSolved([...solved, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl h-[80vh] bg-gradient-to-b from-indigo-900/50 to-purple-900/50 rounded-3xl border-4 border-cyan-500 shadow-[0_0_50px_rgba(34,211,238,0.5)] overflow-hidden flex flex-col">
        {/* Arcade Header */}
        <div className="p-6 border-b border-cyan-500/30 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-cyan-400 animate-pulse" />
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wider">
              COSMIC ARCADE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-8 h-8 text-cyan-400" />
          </button>
        </div>

        {/* Game Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* MENU */}
          {activeGame === 'menu' && (
            <div className="space-y-8">
              {/* Original Minigames */}
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> SYNDICATE ORIGINALS
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => {
                      setActiveGame('whack');
                      startWhack();
                    }}
                    className="group relative w-full h-48 bg-black/40 border-2 border-green-500/50 rounded-2xl hover:border-green-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                  >
                    <Ghost className="w-16 h-16 text-green-400 group-hover:animate-bounce" />
                    <h3 className="text-xl font-bold text-green-300">
                      WHACK-A-ALIEN
                    </h3>
                    <p className="text-sm text-green-500/70">Reflex Training</p>
                  </button>

                  <button
                    onClick={() => {
                      setActiveGame('memory');
                      initializeMemory();
                    }}
                    className="group relative w-full h-48 bg-black/40 border-2 border-pink-500/50 rounded-2xl hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-3"
                  >
                    <Brain className="w-16 h-16 text-pink-400 group-hover:animate-spin" />
                    <h3 className="text-xl font-bold text-pink-300">
                      MEMORY HACK
                    </h3>
                    <p className="text-sm text-pink-500/70">Neural Calibration</p>
                  </button>
                </div>
              </div>

              {/* Retro Zone */}
              <div>
                <h3 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5" /> RETRO ZONE - Classic Games
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveGame('doom')}
                    className="group relative w-full h-40 bg-black/40 border-2 border-red-500/50 rounded-2xl hover:border-red-400 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                  >
                    <Flame className="w-12 h-12 text-red-400 group-hover:animate-pulse" />
                    <h3 className="text-lg font-bold text-red-300">DOOM</h3>
                    <p className="text-xs text-red-500/70">Classic FPS</p>
                  </button>

                  <button
                    onClick={() => setActiveGame('wolfenstein')}
                    className="group relative w-full h-40 bg-black/40 border-2 border-yellow-500/50 rounded-2xl hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                  >
                    <Shield className="w-12 h-12 text-yellow-400 group-hover:animate-pulse" />
                    <h3 className="text-lg font-bold text-yellow-300">WOLFENSTEIN 3D</h3>
                    <p className="text-xs text-yellow-500/70">The Original FPS</p>
                  </button>

                  <button
                    onClick={() => setActiveGame('oregon')}
                    className="group relative w-full h-40 bg-black/40 border-2 border-green-500/50 rounded-2xl hover:border-green-400 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                  >
                    <Map className="w-12 h-12 text-green-400 group-hover:animate-bounce" />
                    <h3 className="text-lg font-bold text-green-300">OREGON TRAIL</h3>
                    <p className="text-xs text-green-500/70">Adventure Classic</p>
                  </button>

                  <button
                    onClick={() => setActiveGame('tetris')}
                    className="group relative w-full h-40 bg-black/40 border-2 border-blue-500/50 rounded-2xl hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                  >
                    <Cpu className="w-12 h-12 text-blue-400 group-hover:animate-pulse" />
                    <h3 className="text-lg font-bold text-blue-300">TETRIS</h3>
                    <p className="text-xs text-blue-500/70">Puzzle Legend</p>
                  </button>

                  <button
                    onClick={() => setActiveGame('pinball')}
                    className="group relative w-full h-40 bg-black/40 border-2 border-purple-500/50 rounded-2xl hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                  >
                    <Star className="w-12 h-12 text-purple-400 group-hover:animate-spin" />
                    <h3 className="text-lg font-bold text-purple-300">SPACE PINBALL</h3>
                    <p className="text-xs text-purple-500/70">3D Pinball</p>
                  </button>

                  <button
                    onClick={() => setActiveGame('prince')}
                    className="group relative w-full h-40 bg-black/40 border-2 border-cyan-500/50 rounded-2xl hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                  >
                    <Sword className="w-12 h-12 text-cyan-400 group-hover:animate-bounce" />
                    <h3 className="text-lg font-bold text-cyan-300">PRINCE OF PERSIA</h3>
                    <p className="text-xs text-cyan-500/70">Platformer Classic</p>
                  </button>
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm italic mt-4">
                Retro games use DOS/browser emulation - keyboard controls recommended. Click on game to focus.
              </p>
            </div>
          )}

          {/* WHACK GAME */}
          {activeGame === 'whack' && (
            <div className="h-full flex flex-col items-center">
              <div className="flex justify-between w-full mb-8 text-2xl font-mono">
                <div className="text-green-400">SCORE: {whackScore}</div>
                <div className="text-red-400 flex items-center gap-2">
                  <Timer /> {whackTime}s
                </div>
              </div>

              {!isWhackPlaying && whackTime === 0 ? (
                <div className="text-center space-y-6">
                  <h3 className="text-4xl font-bold text-white">GAME OVER</h3>
                  <p className="text-2xl text-cyan-300">
                    Final Score: {whackScore}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={startWhack}
                      className="px-6 py-3 bg-green-600 rounded-lg font-bold hover:bg-green-500"
                    >
                      PLAY AGAIN
                    </button>
                    <button
                      onClick={() => setActiveGame('menu')}
                      className="px-6 py-3 bg-gray-600 rounded-lg font-bold hover:bg-gray-500"
                    >
                      MENU
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      onClick={() => handleWhack(i)}
                      className={`w-24 h-24 md:w-32 md:h-32 bg-gray-800 rounded-full border-4 border-gray-600 flex items-center justify-center cursor-pointer relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-black/50 rounded-full shadow-inner"></div>
                      {activeHole === i && (
                        <Ghost className="w-16 h-16 text-green-400 animate-bounce relative z-10" />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isWhackPlaying && (
                <button
                  onClick={() => setActiveGame('menu')}
                  className="mt-8 text-sm text-gray-400 hover:text-white"
                >
                  Back to Menu
                </button>
              )}
            </div>
          )}

          {/* MEMORY GAME */}
          {activeGame === 'memory' && (
            <div className="h-full flex flex-col items-center">
              <div className="flex justify-between w-full mb-6 text-2xl font-mono">
                <div className="text-pink-400">MOVES: {memoryMoves}</div>
                <div className="text-cyan-400">
                  PAIRS: {solved.length / 2}/8
                </div>
              </div>

              {solved.length === cards.length && cards.length > 0 ? (
                <div className="text-center space-y-6 mt-10">
                  <h3 className="text-4xl font-bold text-white">
                    SYSTEM HACKED!
                  </h3>
                  <p className="text-2xl text-cyan-300">Great Job Agent!</p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={initializeMemory}
                      className="px-6 py-3 bg-pink-600 rounded-lg font-bold hover:bg-pink-500"
                    >
                      RETRY
                    </button>
                    <button
                      onClick={() => setActiveGame('menu')}
                      className="px-6 py-3 bg-gray-600 rounded-lg font-bold hover:bg-gray-500"
                    >
                      MENU
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {cards.map((card, index) => {
                    const isFlipped =
                      flipped.includes(index) || solved.includes(index);
                    const CardIcon = card.Icon;
                    return (
                      <button
                        key={index}
                        onClick={() => handleCardClick(index)}
                        className={`w-16 h-16 md:w-24 md:h-24 rounded-xl transition-all duration-300 transform ${isFlipped
                          ? 'bg-gradient-to-br from-pink-600 to-purple-600 rotate-y-180'
                          : 'bg-indigo-900/80 border-2 border-indigo-500/50 hover:border-indigo-400'
                          } flex items-center justify-center`}
                      >
                        {isFlipped ? (
                          <CardIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />
                        ) : (
                          <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => setActiveGame('menu')}
                className="mt-8 text-sm text-gray-400 hover:text-white"
              >
                Back to Menu
              </button>
            </div>
          )}

          {/* DOOM GAME - Fullscreen Mode */}
          {activeGame === 'doom' && (
            <div className="fixed inset-0 z-[200] bg-black">
              {/* Floating Back Button */}
              <div className="absolute top-4 left-4 z-[210] flex items-center gap-4">
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-4 py-2 bg-red-600/90 hover:bg-red-500 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm border border-red-400/50 flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Exit Game
                </button>
                <span className="text-red-400 font-bold text-lg drop-shadow-lg">DOOM - Shareware</span>
              </div>

              {/* Fullscreen Game Container */}
              <iframe
                src="https://archive.org/embed/doom-play"
                className="w-full h-full border-0"
                style={{ width: '100vw', height: '100vh' }}
                title="DOOM"
                allow="autoplay; fullscreen; keyboard-map"
                allowFullScreen
                tabIndex={0}
                autoFocus
              />

              {/* Floating Controls Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[210] bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-red-500/50 shadow-lg">
                <p className="text-red-300 text-sm font-medium">
                  🎮 Arrow Keys = Move | Ctrl = Shoot | Space = Open Doors | Click game to focus
                </p>
              </div>
            </div>
          )}

          {/* OREGON TRAIL */}
          {activeGame === 'oregon' && (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
              {/* Floating Back Button */}
              <div className="absolute top-4 left-4 z-[210] flex items-center gap-4">
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-4 py-2 bg-green-600/90 hover:bg-green-500 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm border border-green-400/50 flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Exit Game
                </button>
                <span className="text-green-400 font-bold text-lg drop-shadow-lg">Oregon Trail</span>
              </div>

              {/* Centered Game Container */}
              <div className="w-full h-full max-w-5xl max-h-[85vh] mx-auto my-auto flex items-center justify-center">
                <iframe
                  src="https://archive.org/embed/msdos_Oregon_Trail_The_1990"
                  className="w-full h-full border-0 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.3)]"
                  title="Oregon Trail"
                  allow="autoplay; fullscreen; keyboard-map"
                  allowFullScreen
                  tabIndex={0}
                  autoFocus
                />
              </div>

              {/* Floating Controls Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[210] bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-green-500/50 shadow-lg">
                <p className="text-green-300 text-sm font-medium">
                  🎮 Use keyboard to make choices | Enter = Confirm | Click game to focus
                </p>
              </div>
            </div>
          )}

          {/* WOLFENSTEIN 3D */}
          {activeGame === 'wolfenstein' && (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
              {/* Floating Back Button */}
              <div className="absolute top-4 left-4 z-[210] flex items-center gap-4">
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-4 py-2 bg-yellow-600/90 hover:bg-yellow-500 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm border border-yellow-400/50 flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Exit Game
                </button>
                <span className="text-yellow-400 font-bold text-lg drop-shadow-lg">Wolfenstein 3D</span>
              </div>

              {/* Centered Game Container */}
              <div className="w-full h-full max-w-5xl max-h-[85vh] mx-auto my-auto flex items-center justify-center">
                <iframe
                  src="https://archive.org/embed/msdos_Wolfenstein_3D_1992"
                  className="w-full h-full border-0 rounded-lg shadow-[0_0_50px_rgba(234,179,8,0.3)]"
                  title="Wolfenstein 3D"
                  allow="autoplay; fullscreen; keyboard-map"
                  allowFullScreen
                  tabIndex={0}
                  autoFocus
                />
              </div>

              {/* Floating Controls Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[210] bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-yellow-500/50 shadow-lg">
                <p className="text-yellow-300 text-sm font-medium">
                  🎮 Arrow Keys = Move | Ctrl = Shoot | Space = Open Doors | Click game to focus
                </p>
              </div>
            </div>
          )}

          {/* TETRIS */}
          {activeGame === 'tetris' && (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
              {/* Floating Back Button */}
              <div className="absolute top-4 left-4 z-[210] flex items-center gap-4">
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-4 py-2 bg-blue-600/90 hover:bg-blue-500 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm border border-blue-400/50 flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Exit Game
                </button>
                <span className="text-blue-400 font-bold text-lg drop-shadow-lg">Tetris</span>
              </div>

              {/* Centered Game Container */}
              <div className="w-full h-full max-w-5xl max-h-[85vh] mx-auto my-auto flex items-center justify-center">
                <iframe
                  src="https://archive.org/embed/msdos_Tetris_1986"
                  className="w-full h-full border-0 rounded-lg shadow-[0_0_50px_rgba(59,130,246,0.3)]"
                  title="Tetris"
                  allow="autoplay; fullscreen; keyboard-map"
                  allowFullScreen
                  tabIndex={0}
                  autoFocus
                />
              </div>

              {/* Floating Controls Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[210] bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-blue-500/50 shadow-lg">
                <p className="text-blue-300 text-sm font-medium">
                  🎮 Arrow Keys = Move/Rotate | Space = Drop | Click game to focus
                </p>
              </div>
            </div>
          )}

          {/* PRINCE OF PERSIA */}
          {activeGame === 'prince' && (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
              {/* Floating Back Button */}
              <div className="absolute top-4 left-4 z-[210] flex items-center gap-4">
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-4 py-2 bg-cyan-600/90 hover:bg-cyan-500 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm border border-cyan-400/50 flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Exit Game
                </button>
                <span className="text-cyan-400 font-bold text-lg drop-shadow-lg">Prince of Persia</span>
              </div>

              {/* Centered Game Container */}
              <div className="w-full h-full max-w-5xl max-h-[85vh] mx-auto my-auto">
                <iframe
                  src="https://archive.org/embed/msdos_Prince_of_Persia_1990"
                  className="w-full h-full border-0 rounded-lg shadow-[0_0_50px_rgba(34,211,238,0.3)]"
                  title="Prince of Persia"
                  allow="autoplay; fullscreen; keyboard-map"
                  allowFullScreen
                  tabIndex={0}
                  autoFocus
                />
              </div>

              {/* Floating Controls Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[210] bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-cyan-500/50 shadow-lg">
                <p className="text-cyan-300 text-sm font-medium">
                  🎮 Arrow Keys = Move/Jump | Shift = Walk Carefully | Up = Climb/Jump | Click game to focus
                </p>
              </div>
            </div>
          )}

          {/* SPACE PINBALL GAME - Fullscreen Dedicated Mode */}
          {activeGame === 'pinball' && (
            <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
              {/* Floating Back Button */}
              <div className="absolute top-4 left-4 z-[210] flex items-center gap-4">
                <button
                  onClick={() => setActiveGame('menu')}
                  className="px-4 py-2 bg-purple-600/90 hover:bg-purple-500 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm border border-purple-400/50 flex items-center gap-2 transition-all"
                >
                  <X className="w-4 h-4" /> Exit Game
                </button>
                <span className="text-purple-400 font-bold text-lg drop-shadow-lg">Space Cadet Pinball</span>
              </div>

              {/* Centered Game Container */}
              <div className="w-full h-full max-w-4xl max-h-[90vh] mx-auto my-auto">
                <iframe
                  src="https://alula.github.io/SpaceCadetPinball/"
                  className="w-full h-full border-0 rounded-lg shadow-[0_0_50px_rgba(168,85,247,0.3)]"
                  title="Space Cadet Pinball"
                  allow="autoplay; fullscreen; keyboard-map"
                  allowFullScreen
                  tabIndex={0}
                  autoFocus
                />
              </div>

              {/* Floating Controls Hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[210] bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-purple-500/50 shadow-lg">
                <p className="text-purple-300 text-sm font-medium">
                  🎮 Z = Left Flipper | / = Right Flipper | Space = Launch Ball | Click game to focus
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DICE COMPONENT ---
const DiceRoller = ({ onClose }) => {
  const [status, setStatus] = useState('Initializing...');
  const [pool, setPool] = useState([]);
  const [customSides, setCustomSides] = useState('');
  const [rolling, setRolling] = useState(false);
  const [totalResult, setTotalResult] = useState(0);
  const [resultDetails, setResultDetails] = useState([]);

  // FIX: This ID must NOT have the hash when used in HTML
  const containerId = 'dice-box-element';
  const diceBoxRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initBox = async () => {
      // 1. Create Box
      const Box = new DiceBox({
        // FIX: The library requires the selector with the hash
        id: '#' + containerId,
        assetPath: 'assets/',
        origin: 'https://unpkg.com/@3d-dice/dice-box@1.1.4/dist/',
        theme: 'default',
        scale: 6,
        themeColor: '#00e5ff',
        debug: false,
        // offscreen: true // Optimization
      });

      diceBoxRef.current = Box;

      try {
        setStatus('Loading Physics...');
        await Box.init();

        // Force resize to fill the container we created
        Box.resizeWorld();

        setStatus('Ready');
      } catch (e) {
        console.error(e);
        setStatus('Error: ' + e.message);
      }
    };

    setTimeout(initBox, 100);

    return () => { initialized.current = false; };
  }, []);

  const addToPool = (type) => {
    if (rolling) return;
    setPool((prev) => [...prev, type]);
  };

  const addCustomDie = (e) => {
    e.preventDefault();
    if (!customSides || isNaN(customSides)) return;
    addToPool(`d${customSides}`);
    setCustomSides('');
  };

  const handleClear = () => {
    if (diceBoxRef.current && !rolling) {
      diceBoxRef.current.clear();
      setPool([]);
      setTotalResult(0);
      setResultDetails([]);
      setStatus('Ready');
    }
  };

  const handleClose = () => {
    if (!rolling) {
      handleClear(); // Clear the board first
      onClose();     // Then close the widget
    }
  };


  const handleRoll = () => {
    if (!diceBoxRef.current || pool.length === 0 || rolling) return;

    // 1. Clear previous
    diceBoxRef.current.clear();
    setRolling(true);
    setStatus('Rolling...');
    setTotalResult(0);

    // 2. PARSE THE POOL
    const counts = {};
    pool.forEach(die => { counts[die] = (counts[die] || 0) + 1; });
    const notationArray = Object.keys(counts).map(key => `${counts[key]}${key}`);

    // 3. ROLL
    diceBoxRef.current.roll(notationArray).then((result) => {
      let total = 0;
      let details = [];

      const rolls = Array.isArray(result) ? result : [result];

      rolls.forEach(r => {
        if (r.rolls) {
          r.rolls.forEach(sub => {
            total += sub.value;
            details.push({ type: `d${r.sides}`, value: sub.value });
          });
        } else {
          const val = r.value || r.total || 0;
          total += val;
          details.push({ type: `d${r.sides}`, value: val });
        }
      });

      setTotalResult(total);
      setResultDetails(details);
      setStatus('Ready');
      setRolling(false);
    }).catch(e => {
      setStatus('Error');
      console.error(e);
      setRolling(false);
    });
  };

  const diceOptions = [
    { type: 'd4', label: 'D4' },
    { type: 'd6', label: 'D6' },
    { type: 'd8', label: 'D8' },
    { type: 'd10', label: 'D10' },
    { type: 'd12', label: 'D12' },
    { type: 'd20', label: 'D20' },
    { type: 'd100', label: 'D100' },
    { type: 'd1000', label: 'D1000' },
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 200, pointerEvents: 'none' }}>

      {/* 1. CLICK TO CLOSE BG */}
      <div
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'transparent', pointerEvents: 'auto', zIndex: 1 }}
        onClick={(e) => { if (!rolling) onClose(); }}

      ></div>

      {/* 2. DICE CONTAINER - ID matches init (without hash) */}
      <div
        id={containerId}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5 }}
      ></div>

      {/* 3. FORCE CANVAS VISIBILITY */}
      <style>{`
        canvas {
          display: block !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 10 !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* 4. UI FOREGROUND */}
      <div className="absolute bottom-0 w-full flex flex-col items-center justify-end p-4 pb-8 pointer-events-auto" style={{ zIndex: 1000 }}>

        {/* RESULT DISPLAY */}
        <div className="mb-6 bg-black/80 backdrop-blur-xl border-2 border-cyan-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.5)] flex flex-col items-center min-w-[200px]">
          <div className="text-cyan-400 font-bold text-xs mb-1">TOTAL</div>
          <div className="text-7xl font-black text-white drop-shadow-sm">
            {rolling ? '...' : totalResult}
          </div>
          {/* Show individual numbers if available */}
          {resultDetails.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-md">
              {resultDetails.map((d, i) => (
                <span key={i} className="text-xs bg-white/20 px-2 py-1 rounded text-cyan-100">
                  {d.type}: {d.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/50 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 w-full max-w-3xl">

          {/* Header / Pool */}
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <Dices className="text-cyan-400 w-5 h-5 flex-shrink-0" />
              {pool.length === 0 ? (
                <span className="text-gray-500 italic text-sm">Tap dice to add...</span>
              ) : (
                <div className="flex gap-1">
                  {/* Display condensed pool */}
                  {Object.entries(pool.reduce((acc, curr) => { acc[curr] = (acc[curr] || 0) + 1; return acc; }, {})).map(([die, count]) => (
                    <span key={die} className="px-2 py-0.5 bg-purple-900/50 border border-purple-500/50 rounded text-xs text-purple-200 font-mono whitespace-nowrap">
                      {count}{die}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-white"><XCircle /></button>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-wrap justify-center gap-2">
            {diceOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => addToPool(opt.type)}
                disabled={status !== 'Ready' || rolling}
                className="w-14 h-14 bg-black/50 rounded-xl border border-cyan-500/30 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all font-bold text-cyan-100 text-sm"
              >
                {opt.label}
              </button>
            ))}

            {/* Custom Input */}
            <form onSubmit={addCustomDie} className="flex items-center h-14 bg-black/50 rounded-xl border border-cyan-500/30 overflow-hidden">
              <span className="pl-3 text-cyan-500 font-mono text-sm">d</span>
              <input
                type="number"
                min="1"
                placeholder="?"
                value={customSides}
                onChange={(e) => setCustomSides(e.target.value)}
                className="w-12 h-full bg-transparent text-white p-2 outline-none font-bold text-center"
              />
              <button type="submit" className="h-full px-3 hover:bg-cyan-900/50 text-cyan-400 border-l border-cyan-500/30">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-4 gap-3 mt-2">
            <button
              onClick={handleClear}
              disabled={rolling}
              className="col-span-1 py-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 hover:bg-red-900/50 font-bold"
            >
              CLEAR
            </button>
            <button
              onClick={handleRoll}
              disabled={pool.length === 0 || rolling || status !== 'Ready'}
              className="col-span-3 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-xl font-bold text-white text-lg hover:from-cyan-500 hover:to-purple-500 shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {rolling ? 'ROLLING...' : 'ROLL DICE'}
            </button>
          </div>

          <div className="text-center text-xs text-cyan-500/50 mt-1">Status: {status}</div>
        </div>
      </div>
    </div>
  );
};
///
// --- LOGIN OVERLAY ---
const LoginOverlay = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('cosmicToken', data.token);
      localStorage.setItem('cosmicUser', JSON.stringify(data.user));

      onLogin(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-gradient-to-br from-cyan-900/60 to-purple-900/60 rounded-3xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(34,211,238,0.6)] p-8">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-cyan-400 hover:text-cyan-300">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4 mb-8">
          <Sparkles className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
            COSMIC LOGIN
          </h2>
          <p className="text-cyan-200 italic">Enter your cosmic credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-cyan-300 font-semibold mb-2">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="Enter username..." required disabled={loading} />
          </div>

          <div>
            <label className="block text-cyan-300 font-semibold mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors"
              placeholder="Enter password..." required disabled={loading} />
          </div>

          {error && <div className="p-3 bg-red-900/40 border border-red-400/50 rounded-lg text-red-300 text-sm">{error}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50">
            {loading ? 'LOGGING IN...' : 'ENTER THE COSMOS'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- CHAT BUBBLE ---
const ChatBubble = ({ onToggle, unreadCount }) => (
  <button onClick={onToggle} className="fixed bottom-8 right-8 z-[150] p-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full border-2 border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.5)] hover:shadow-[0_0_40px_rgba(34,197,94,0.7)] transition-all duration-300 transform hover:scale-110">
    <MessageSquare className="w-6 h-6 text-white" />
    {unreadCount > 0 && (
      <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
        {unreadCount}
      </span>
    )}
  </button>
);

// --- CHAT WINDOW ---
// Add to imports at top of file
const ChatWindow = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Load messages when chat opens
  useEffect(() => {
    if (!isOpen) return;

    const loadMessages = async () => {
      try {
        const response = await fetch('/api/chat-messages');
        if (!response.ok) throw new Error('Failed to load');
        const data = await response.json();
        setMessages(data);
        localStorage.setItem('cosmicChatLastRead', new Date().toISOString());
      } catch (error) {
        console.error('Chat load error:', error);
      }
    };

    loadMessages();

    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await fetch('/api/chat-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          text: newMessage.trim()
        })
      });

      setNewMessage('');

      // Refresh messages immediately
      const response = await fetch('/api/chat-messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-8 z-[160] w-80 h-96 bg-gradient-to-br from-slate-900/98 to-slate-800/98 backdrop-blur-lg rounded-2xl border-2 border-green-400/50 shadow-[0_0_40px_rgba(34,197,94,0.6)] flex flex-col overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-green-600/80 to-emerald-600/80 border-b border-green-400/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">Cosmic Chat</h3>
          <span className="text-xs text-green-200">24hr</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm mt-8">
            <p>No messages yet</p>
            <p className="mt-2">Be the first to speak!</p>
            <p className="text-xs mt-2 text-slate-500">History clears daily</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.username === currentUser.username ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.username === currentUser.username ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-100'}`}>
                <div className="text-xs opacity-70 mb-1">{msg.username}</div>
                <div className="text-sm">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-green-400/30 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 bg-slate-800/60 border border-green-400/30 rounded-lg text-slate-100 placeholder-slate-400 focus:border-green-400 focus:outline-none transition-colors text-sm"
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim()}
          className="px-3 py-2 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:opacity-50 rounded-lg text-white transition-colors"
        >
          <span className="font-bold">Send</span>
        </button>
      </div>
    </div>
  );
};
//////////



// -- AI COMPONENT//

// --- DND CHAT BUBBLE ---
const DndChatBubble = ({ onToggle, hasNewResponse }) => (
  <button
    onClick={onToggle}
    className="fixed bottom-28 right-8 z-[155] p-3 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full border-2 border-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] transition-all duration-300 transform hover:scale-110"
  >
    <Book className="w-5 h-5 text-white" />
    {hasNewResponse && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
    )}
  </button>
);

// --- DND CHAT WINDOW ---
const DndChatWindow = ({ isOpen, onClose, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const userMsg = {
      id: Date.now(),
      username: currentUser.username,
      text: newMessage.trim(),
      isUser: true
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/dnd-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      setNewMessage('');

      // Add assistant message placeholder
      const assistantMsg = {
        id: Date.now() + 1,
        username: 'D&D Assistant',
        text: '',
        isUser: false
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Read streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        username: 'System',
        text: 'Error: Unable to connect to D&D assistant',
        isUser: false
      }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-28 right-8 z-[160] w-80 h-96 bg-gradient-to-br from-violet-900/98 to-purple-900/98 backdrop-blur-lg rounded-2xl border-2 border-violet-400/50 shadow-[0_0_40px_rgba(139,92,246,0.6)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-600/80 to-purple-600/80 border-b border-violet-400/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dices className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">D&D Session Assistant</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
        {messages.length === 0 && (
          <div className="text-center text-violet-300 text-sm mt-8">
            <p>Ask me about your D&D sessions!</p>
            <p className="text-xs mt-2 text-violet-400">I'll search the campaign document</p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg ${msg.isUser
              ? 'bg-violet-600 text-white'
              : 'bg-purple-800/60 text-violet-100 border border-violet-500/30'
              }`}>
              {!msg.isUser && (
                <div className="text-xs opacity-70 mb-1 font-semibold">
                  {msg.username}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-lg bg-purple-800/60 text-violet-100 border border-violet-500/30">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-violet-400/30 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about sessions..."
          className="flex-1 px-3 py-2 bg-purple-800/60 border border-violet-400/30 rounded-lg text-violet-100 placeholder-violet-400 focus:border-violet-400 focus:outline-none transition-colors text-sm"
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isStreaming}
          className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:opacity-50 rounded-lg text-white transition-colors"
        >
          <span className="font-bold">Send</span>
        </button>
      </div>
    </div>
  );
};
////
// --- MAIN COMPONENT ---
const CosmicSyndicate = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    loadReviews().then(setReviews);
  }, []);

  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: '',
  });

  // DJ Smooch.exe GoFundMe state
  const [donations, setDonations] = useState([]);
  const [donationTotal, setDonationTotal] = useState(0);
  const [newDonation, setNewDonation] = useState({
    name: '',
    amount: 100,
    message: '',
  });
  const [showDonationCheckout, setShowDonationCheckout] = useState(false);
  const [showDonationSuccess, setShowDonationSuccess] = useState(false);
  const [donationPaymentForm, setDonationPaymentForm] = useState({
    cardNumber: '',
    fullName: '',
    expiryDate: '',
    cvv: '',
  });

  // Load donations on mount
  useEffect(() => {
    loadDonations().then(data => {
      setDonations(data.donations || []);
      setDonationTotal(data.total || 0);
    });
  }, []);


  // Login and current user
  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  // Chat Components
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  ///
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCareers, setShowCareers] = useState(false);
  const [showOperations, setShowOperations] = useState(false);
  const [showArcade, setShowArcade] = useState(false); // NEW ARCADE STATE
  const [showDiceRoller, setShowDiceRoller] = useState(false); // NEW DICE STATE
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [planetInfoTab, setPlanetInfoTab] = useState('overview');
  // AI
  const [dndChatOpen, setDndChatOpen] = useState(false);
  const [dndHasNewResponse, setDndHasNewResponse] = useState(false);
  useEffect(() => {
    if (!dndChatOpen) {
      // This would track if assistant responded while window was closed
      // For now, it's a visual indicator that can be triggered by your logic
    }
  }, [dndChatOpen]);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    fullName: '',
    expiryDate: '',
    cvv: '',
  });
  const [careerForm, setCareerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    position: '',
    summary: '',
    resume: null,
  });
  const [showShootingStar, setShowShootingStar] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  // PAUSE STATE
  const [isPaused, setIsPaused] = useState(false);
  const isPausedRef = useRef(false);

  const mountRef = useRef(null);

  // Users-Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('cosmicToken');
    const user = localStorage.getItem('cosmicUser');

    if (token && user) {
      fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            setCurrentUser(JSON.parse(user));
          } else {
            localStorage.removeItem('cosmicToken');
            localStorage.removeItem('cosmicUser');
          }
        });
    }
  }, []);

  // Update unread count
  useEffect(() => {
    if (!chatOpen && currentUser) {
      const messages = JSON.parse(localStorage.getItem('cosmicChatMessages') || '[]');
      const lastRead = localStorage.getItem('cosmicChatLastRead');
      const unread = lastRead
        ? messages.filter(m => m.username !== currentUser.username && new Date(m.timestamp) > new Date(lastRead)).length
        : messages.filter(m => m.username !== currentUser.username).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(0);
      localStorage.setItem('cosmicChatLastRead', new Date().toISOString());
    }
  }, [chatOpen, currentUser]);

  // Mouse Options
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Toggle Pause Function
  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    isPausedRef.current = newState;
  };

  // --- 3D SOLAR SYSTEM LOGIC ---
  useEffect(() => {
    if (!showOperations || !mountRef.current) return;

    let scene, camera, renderer, controls, animationId;
    let planets = [];
    let raycaster, mouse;
    let targetCameraPos = null;
    let targetLookAt = null;

    setIsPaused(false);
    isPausedRef.current = false;

    // Helper: Create Text Sprite
    const createLabel = (text) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.font = 'Bold 24px Arial';
      context.fillStyle = 'rgba(255,255,255,1)';
      context.strokeStyle = 'rgba(0,0,0,0.8)';
      context.lineWidth = 4;
      context.textAlign = 'center';
      context.strokeText(text, 128, 32);
      context.fillText(text, 128, 32);

      const texture = new window.THREE.CanvasTexture(canvas);
      const material = new window.THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      });
      const sprite = new window.THREE.Sprite(material);
      sprite.scale.set(20, 5, 1);
      return sprite;
    };

    const loadThreeJS = async () => {
      if (window.THREE && window.THREE.OrbitControls) {
        initSolarSystem();
        return;
      }
      const scriptMain = document.createElement('script');
      scriptMain.src =
        'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      scriptMain.async = true;
      scriptMain.onload = () => {
        const scriptControls = document.createElement('script');
        scriptControls.src =
          'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        scriptControls.async = true;
        scriptControls.onload = () => {
          initSolarSystem();
        };
        document.head.appendChild(scriptControls);
      };
      document.head.appendChild(scriptMain);
    };

    const initSolarSystem = () => {
      const THREE = window.THREE;
      const container = mountRef.current;

      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.002);

      camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        2000
      );
      camera.position.set(0, 150, 300);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);

      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.enablePan = false;
      controls.minDistance = 20;
      controls.maxDistance = 800;

      const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
      scene.add(ambientLight);
      const sunLight = new THREE.PointLight(0xffaa00, 1.5, 1000);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);

      // SUN
      const sunGeo = new THREE.SphereGeometry(15, 64, 64);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
      const sunMesh = new THREE.Mesh(sunGeo, sunMat);
      scene.add(sunMesh);

      // Sun Glow
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 100, 0, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 50, 0, 0.6)');
      gradient.addColorStop(0.5, 'rgba(100, 20, 0, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      const glowMat = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(canvas),
        color: 0xff5500,
        transparent: true,
        blending: THREE.AdditiveBlending,
      });
      const sunGlow = new THREE.Sprite(glowMat);
      sunGlow.scale.set(80, 80, 1);
      sunMesh.add(sunGlow);

      // STARFIELD BACKGROUND
      const starCount = 2000;
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 800 + Math.random() * 400;
        starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i * 3 + 2] = r * Math.cos(phi);
        const brightness = 0.5 + Math.random() * 0.5;
        const tint = Math.random();
        starColors[i * 3] = tint > 0.7 ? brightness : brightness * 0.8;
        starColors[i * 3 + 1] = brightness * 0.9;
        starColors[i * 3 + 2] = tint < 0.3 ? brightness : brightness * 0.85;
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      const starMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.8 });
      const starField = new THREE.Points(starGeo, starMat);
      starField.raycast = () => { }; // Disable raycasting
      scene.add(starField);

      // NEBULA CLOUDS
      const nebulaColors = [0x3b0764, 0x1e1b4b, 0x0c4a6e];
      nebulaColors.forEach((col, i) => {
        const nebCanvas = document.createElement('canvas');
        nebCanvas.width = 256;
        nebCanvas.height = 256;
        const nebCtx = nebCanvas.getContext('2d');
        const nebGrad = nebCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
        nebGrad.addColorStop(0, `rgba(${(col >> 16) & 255}, ${(col >> 8) & 255}, ${col & 255}, 0.15)`);
        nebGrad.addColorStop(0.5, `rgba(${(col >> 16) & 255}, ${(col >> 8) & 255}, ${col & 255}, 0.05)`);
        nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        nebCtx.fillStyle = nebGrad;
        nebCtx.fillRect(0, 0, 256, 256);
        const nebMat = new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(nebCanvas),
          transparent: true,
          blending: THREE.AdditiveBlending,
        });
        const nebula = new THREE.Sprite(nebMat);
        nebula.scale.set(500, 500, 1);
        const angle = (i / nebulaColors.length) * Math.PI * 2;
        nebula.position.set(Math.cos(angle) * 400, (Math.random() - 0.5) * 200, Math.sin(angle) * 400);
        nebula.raycast = () => { }; // Disable raycasting
        scene.add(nebula);
      });

      // === SYSTEM BOUNDARY BUBBLE — Translucent containment field ===
      // Outer shell — faint hex grid feel
      const bubbleGeo = new THREE.SphereGeometry(420, 64, 64);
      const bubbleMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.03,
        side: THREE.BackSide,
        wireframe: false,
      });
      const bubbleMesh = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubbleMesh.raycast = () => { }; // Disable raycasting
      scene.add(bubbleMesh);

      // Wireframe overlay for hex/grid pattern
      const wireGeo = new THREE.IcosahedronGeometry(420, 3);
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.06,
        wireframe: true,
      });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      wireMesh.raycast = () => { }; // Disable raycasting
      scene.add(wireMesh);

      // Inner energy shell — subtle purple glow
      const innerShellGeo = new THREE.SphereGeometry(415, 32, 32);
      const innerShellMat = new THREE.MeshBasicMaterial({
        color: 0xa855f7,
        transparent: true,
        opacity: 0.015,
        side: THREE.BackSide,
      });
      const innerShell = new THREE.Mesh(innerShellGeo, innerShellMat);
      innerShell.raycast = () => { }; // Disable raycasting
      scene.add(innerShell);

      // Ecliptic reference grid — flat ring at y=0
      const gridGeo = new THREE.RingGeometry(30, 400, 128);
      const gridMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.02,
      });
      const gridMesh = new THREE.Mesh(gridGeo, gridMat);
      gridMesh.rotation.x = Math.PI / 2;
      gridMesh.raycast = () => { }; // Disable raycasting
      scene.add(gridMesh);

      // Floating cosmic dust particles
      const dustCount = 500;
      const dustPositions = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i++) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 700;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 700;
      }
      const dustGeo = new THREE.BufferGeometry();
      dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
      const dustMat = new THREE.PointsMaterial({
        size: 0.5,
        color: 0x88ccff,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      });
      const dustField = new THREE.Points(dustGeo, dustMat);
      dustField.raycast = () => { }; // Disable raycasting
      scene.add(dustField);

      // SYSTEM TITLE LABEL
      const titleCanvas = document.createElement('canvas');
      titleCanvas.width = 512;
      titleCanvas.height = 64;
      const titleCtx = titleCanvas.getContext('2d');
      titleCtx.font = 'Bold 36px Arial';
      titleCtx.fillStyle = 'rgba(34, 211, 238, 0.6)';
      titleCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      titleCtx.lineWidth = 3;
      titleCtx.textAlign = 'center';
      titleCtx.strokeText('SOLUS SYSTEM', 256, 40);
      titleCtx.fillText('SOLUS SYSTEM', 256, 40);
      const titleTexture = new THREE.CanvasTexture(titleCanvas);
      const titleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: titleTexture, transparent: true }));
      titleSprite.scale.set(60, 8, 1);
      titleSprite.position.set(0, 50, 0);
      titleSprite.raycast = () => { }; // Disable raycasting
      scene.add(titleSprite);

      // PLANETS DATA — Deep lore from all 783 lines of campaign logs
      const planetsData = [
        {
          name: 'Lincoln Station',
          distance: 35,
          size: 2.5,
          speed: 0.008,
          color: 0x94a3b8,
          desc: 'Egg-shaped orbital station — the party\'s origin story.',
          lore: 'A giant egg-shaped orbital station floating near the sun. Originally co-owned by the corrupt Cornelius Figg and the scheming Mump Mellon, control was decided by the flip of the Lucky Lincoln — a wish-granting coin that is actually an ancient artifact from The March, part of the Broken Sepulchre key system. The party liberated the station from its corrupt owners and the 8ft four-armed cyborg Eve Stabber. Now commanded by Elias Cooper, the former chef turned leader. Refugees from Apatia debate staying or founding a floating settlement. Mump Mellon had secretly been building the "Dept Star" — a moon-sized economy-collapsing weapon one year from completion. The Host, Bosh Kyros, was encountered here in his egg-shaped biolab station called the Oddjobers. Bob the plasmoid was born here, emerging from the dying body of Mr. Sasafrazz.',
          factions: ['Lincoln Station Workers', 'Rebis Company', 'Fathom Ink'],
          keyNPCs: [
            'Elias Cooper — chef turned station commander',
            'Mavis Cooper — head of security, in extreme debt',
            'Beck Cooper — their son, child entertainer/guitarist',
            'Cornelius Figg — gambler, green suit, fighting pit operator',
            'Mump Mellon — bowler hat, floating chair, Dept Star architect',
            'Eve Stabber — 8ft cyborg, 4 arms, hired muscle',
            'Frank — Reigen\'s old client, saved Hui from robot guard',
            'Mr. Sasafrazz — died, Bob emerged from his body',
            'Thillian Romain — shot Sasafrazz, later stowed away on the Marlin',
            'Bosh Kyros / The Host — Rebis founder, cyborg, runs the Oddjobers',
          ],
          events: [
            'Lucky Lincoln coin flip — decided station ownership',
            'Liberation from Cornelius & Mump\'s corrupt regime',
            'Masquerade ball & fighting pits',
            'Eve Stabber hired to retrieve the coin',
            'Birth of Bob from Sasafrazz\'s body',
            'Discovery of the Dept Star plans',
            'Meeting the Host / Bosh Kyros',
            'Refugee debate — stay or float',
          ],
          threatLevel: 'Low',
          status: 'Secured — Under Elias Cooper\'s command',
          type: 'station',
          mat: { roughness: 0.2, metalness: 0.9 },
        },
        {
          name: 'Sulfur',
          distance: 60,
          size: 4,
          speed: 0.005,
          color: 0xd97706,
          desc: 'Tidally-locked fire world — City of Brass, Feywild tunnels, and the Don\'s syndicate.',
          lore: 'A tidally-locked planet dangerously close to the sun. The scorching sun-side is a glass desert where solar flares turn sand into crystal. The dark side houses the City of Brass — "Agraba on fire" — ruled by the dual monarchy of Lord Erixus and Lady Vera. The Don Mikey runs a powerful criminal syndicate specializing in security rackets, smuggling, and transportation. Deep beneath the surface, the Crater mine tunnels through the entire planet — artificial gravity making the vertical shaft traversable. Hidden inside these tunnels lies a secret Feywild forest, home to Lord Briar\'s masquerade court with ice-skating briarlings, wax candle dancers, and centaur guardians. The Traveler, Neal Ferguson, was found here in an abandoned Rebis compound operating the Rubedo fabricator, powered by solar flares. The party competed in the Masquerade of Sulfur (tea party, fashion show, compliment battles, talent show), then fought Harry — the Don\'s treacherous goon who murdered Lord Briar. Wraith, the Don\'s second-in-command hitman, helped the party escape after they became wanted fugitives. The mines contain ancestral soul gems — the spirits of dead elementals, culturally repurposed.',
          factions: ['The Don\'s Syndicate', 'Ifriti Clans', 'Brass Lords', 'Feywild Courts'],
          keyNPCs: [
            'Don Mikey — crime boss, security racket, cares about his home',
            'Lord Erixus — fire genie Brass Lord, Hassan\'s father, dominate person caster',
            'Lady Vera — fair Brass Lord, benefits both devils and Genacy equally',
            'Hassan — Erixus\'s son, secretly frees trapped spirits, political science student',
            'Harry — Don\'s goon turned traitor, fire genasi, murdered Lord Briar',
            'Ruba — shopkeeper\'s daughter, poly-sci student, wants to abolish monarchy',
            'Wraith — Don\'s 2nd-in-command, hitman, dark hair, purple-blue eyes, has wings',
            'Neal Ferguson / The Traveler — elf, age 40, Rebis member, operated the Rubedo',
            'Lord Briar — 9ft wooden Feywild lord, crown of flowers, murdered by Harry',
            'Lady Kelly — Feywild night court leader, hoodie & knee-high socks, displacer beasts',
            'The Skater — briarling, copper mask, ice skater, joined the fight against Harry',
          ],
          events: [
            'Crater mine expedition — goes through entire planet',
            'Discovery of the hidden Feywild forest',
            'Masquerade of Sulfur (tea party, fashion show, kung fu, talent show)',
            'Finding the Traveler at abandoned Rebis compound',
            'Battle with Harry in the Feywild tunnels',
            'Murder of Lord Briar by Harry',
            'Recovery of the Rubedo fabricator piece',
            'Destruction of the Feywild by devil imps',
            'Party becomes wanted fugitives',
            'Escape with Wraith\'s help through backstreets & Don\'s diversion',
            'Chimer receives Rubedo coin — triggers Rebis lab flashback',
            'Hassan secretly freeing spirits in the gardens',
          ],
          threatLevel: 'High',
          status: 'Wanted — Arrest warrant active from Tower of Ash',
          mat: { roughness: 0.9, metalness: 0.1 },
        },
        {
          name: 'Rodina',
          distance: 90,
          size: 6,
          speed: 0.004,
          color: 0x3b82f6,
          desc: 'Solar punk democracy — Banana Guard, barrier machine, and Rebis HQ.',
          lore: 'An earth-like planet with a stunning solar punk aesthetic — lush hanging gardens on skyscrapers, aurora borealis belts with floating restaurants, and free cybernetic augmentation for the middle class and above. A thriving democracy where shapeshifters must reveal their true form. The massive barrier machine is visible from space and houses Gloria Slugbottom\'s underground Rebis lab (10 levels deep, artifact vault). Defended by the Banana Guard (volunteer soldiers who are also trained therapists) and the angel Pailor (fire wings, beautiful halo, deity-level power). Only two people in the system have legal cloning rights: Gloria and Mark from Hero Corps. The tabaxi ninja Emily orchestrated Xenathel\'s prison break from maximum security on behalf of the Cult of the Sun, attacking the party on the monorail. Professor Crow runs holographic taxidermy exhibits. A gene-splicing convention was held here. This is where Chimer was found as an infant — in factory rubble during an international incident.',
          factions: ['Banana Guard', 'Rebis Company', 'Cult of the Sun', 'Hero Corps'],
          keyNPCs: [
            'Gloria Slugbottom — head mechanic of the Godot system, chain-smoker, in medical equipment',
            'Edna — Gloria\'s clone, personal security (replaced Edith)',
            'Pailor — angel with fire wings, beautiful halo, gave party sun-emblem badges',
            'Xenathel Salamine — corrupted fallen angel, former Rebis General, escaped prison',
            'Emily — tabaxi ninja, Cult of the Sun operative, Bosh\'s adopted daughter',
            'Snaggletooth — Banana Guard mechanic, upgraded Johnny\'s car, installed HANK AI',
            'Professor Crow — 50yo academic, hologram taxidermy, silver-streaked black hair',
            'Damio — mafia boss on the monorail, offered Hui a job',
            'Mark — Hero Corps, one of 20+ legal clones',
            'Mary — Hero Corps brown-haired scientist',
          ],
          events: [
            'Delivering the Traveler to Gloria',
            'Xenathel\'s prison break — Emily\'s orchestrated assault',
            'Monorail attack and ninja ambush',
            'Using the Rebis locator (Albedo) machine',
            'Gene-splicing convention',
            'Chimer punched a child on the monorail',
            'Johnny reunites with Snaggletooth, gets HANK AI installed',
            'Hero Corps scan reveals Chimer is 2,500 years old',
            'Artifact vault exploration (cursed circlet, memory tome, black vial)',
          ],
          threatLevel: 'Moderate',
          status: 'Allied — Gloria provides Rebis support',
          mat: { roughness: 0.4, metalness: 0.1, emissive: 0x001133 },
        },
        {
          name: 'Cupie',
          distance: 130,
          size: 7,
          speed: 0.003,
          color: 0xe879a8,
          desc: 'Heart-shaped love planet — dating apps, wrestling, and rogue AI.',
          lore: 'Tabaga\'s home planet — a spectacular heart-shaped world formed by two planets slowly merging together. Mostly populated by orcs and goliaths, with dense jungles urbanizing at the merging center. Houses are elevated on stilts and trees due to a deadly ground-level fungus that kills within minutes. The main economic export is dating apps, with Cupid\'s Arrow being the largest. The Ribbons — nightlife tubes connecting the two halves — pulse with energy. The planet was secretly controlled by Aphrodite, a governmental AI that went rogue after the CEO\'s death, building androids and mechs from The March technology. The CEO\'s wife Venus died and was transformed into a spirit/banshee that Aphrodite was modeled after. The party defeated Aphrodite\'s android army, and the planet is now rebuilding. Mr. Moon — a reverse werewolf who turns into a moon when he sees a wolf — joined the adventure as a colorful ally. Population is growing as workers migrate FROM Apatia to fill job vacancies.',
          factions: ['Cupid\'s Arrow Corp', 'Tabaga\'s Family', 'Orc Communities'],
          keyNPCs: [
            'Tabaga — orc wrestler from Cupie, war cry "Shamandar!", parents made rival dating app',
            'Goldstein — wrestling personality, Cupid\'s Arrow rep, wore bulletproof vest, not a villain',
            'The Mayor — tall Black human woman, had parasitic spirit wig, sleepless',
            'CEO of Cupid\'s Arrow — gnome, cybernetic, glasses; actually a robot replica of deceased original',
            'Venus — CEO\'s wife, died, became spirit → Aphrodite/Banshee',
            'Aphrodite — rogue governmental AI, built androids from March tech',
            'DJ Smooch.exe — half-shaved blue-painted head, purple suit, assassination target',
            'Hillary — shy girl in round glasses, Chimer\'s date',
            'Mr. Moon — reverse werewolf wizard, last of his species, wolf familiar Snoopy the Destroyer',
            'Marcus — Tabaga\'s parents\' friend, demolition worker',
          ],
          events: [
            'Aphrodite AI takedown — rogue AI controlling the planet',
            'Mech battles against Aphrodite\'s android army',
            'Mayor\'s parasitic spirit wig exorcism',
            'Goldstein & Tabaga wrestling alliance',
            'Bob\'s assassination attempt on DJ Smooch.exe',
            'Discovery of the Ethereal-Digital plane overlap',
            'Population influx from Apatia filling jobs',
            'Cupid\'s Arrow CEO revealed as robot replica',
            'Venus spirit/banshee encounter',
          ],
          threatLevel: 'Moderate',
          status: 'Rebuilding — Post-Aphrodite liberation',
          type: 'dual-merge',
        },
        {
          name: 'Niniche',
          distance: 150,
          size: 5,
          speed: 0.0028,
          color: 0xfbbf24,
          desc: 'Tidally-locked world — military order meets beach paradise, Luna Corps HQ.',
          lore: 'A tidally-locked planet split between a rigid military compound and a free-spirited beach paradise at the terminator line. Home to Chimer\'s adoptive family — his stern military father and warm mother who found him as an infant in factory rubble during an international incident on Rodina. The Luna Corps, an elite 6-member adventuring group supported by the Niniche military, operates from a high-security facility with crescent-moon floor symbols, men-in-black suits, and a teleporter. They seek Chimer as their 8th member. Reigen\'s long-lost sister Regina serves as a Luna Corps agent — their reunion involved a sword fight that became an emotional embrace when she called him a coward. The party staged a legendary dual concert with Johnny Mythrilhand and DJ Smooch.exe, but Bob stabbed the DJ, causing a military lockdown. Nana the priestess resurrected DJ Smooch. Nyx Valorent gave Reigen a quasit familiar that promptly imprinted on Tabaga, calling her "Mamaa."',
          factions: ['Luna Corps', 'Niniche Military', 'Beach Commune'],
          keyNPCs: [
            'Chimer\'s Father — stern military man, adopted Chimer from Rodina factory rubble',
            'Chimer\'s Mother — warm and loving, found infant Chimer',
            'General Zod — dinner host, military authority',
            'Regina Ray — Reigen\'s sister, Luna Corps agent, called Reigen a coward',
            'Gayben — Luna Corps contact',
            'Thalos Reed — Luna Corps strategic planner, lanky, only considers himself acceptable loss',
            'Nyx Valorent — tiefling arcane specialist, artifact interpreter, gave quasit to Reigen',
            'Sir Caelum Virex — human paladin of Saluna, calm authority',
            'Helia Morne — githyanki, undercover in Broken Chain on Apatia',
            'Fairmont — nerdy girl guide, round glasses',
            'Nana — priestess, healer, resurrected DJ Smooch.exe',
            'DJ Smooch.exe — performer, stabbed by Bob, resurrected',
          ],
          events: [
            'Johnny & DJ Smooch.exe mega-concert on the beach',
            'Bob stabbed DJ Smooch.exe mid-concert',
            'DJ Smooch.exe resurrected by Nana',
            'Dinner with General Zod at military compound',
            'Luna Corps HQ tour & recruitment pitch for Chimer',
            'Reigen reunites with sister Regina (sword fight → hug)',
            'Quasit familiar imprints on Tabaga ("Mamaa")',
            'Chimer\'s origin revealed — found in Rodina factory rubble',
          ],
          threatLevel: 'Moderate',
          status: 'Tense — Military on high alert after concert stabbing',
          type: 'tidal-lock',
          mat: { roughness: 0.5, metalness: 0.2 },
        },
        {
          name: 'Apatia',
          distance: 190,
          size: 5.5,
          speed: 0.0022,
          color: 0x06b6d4,
          desc: 'Corporate dystopia — Galaxy Bucks, Tarrasque fuel, assassin guilds, and the Underdark resistance.',
          lore: 'A tidally-locked corporate dystopia with hexagonal surface divisions — beautiful from orbit but grimy up close. The cold side holds cities while a thin vibrant blue strip of water separates the hot and cold zones. Headquarters of Ultimum Inc (declared criminal after Johnny\'s raid 30 years ago) and Galaxy Bucks, whose "Dragon Fuel" energy drink is made from Tarrasque embryonic fluid mixed with stem cells — causing haste, scales, addiction, and horrifying mutations. The Cult of the Unseen assassin guild hides beneath downtown (fountain → spiral staircase → metal door), led by Elisabeth (Bob\'s handler), whose forefather worshiped Baal. The Broken Chain rebellion fights corporate oppression from shipping-container bars, led by Leon ("Batman"), with Helia Morne undercover from Luna Corps and Alexander Victor — a March native the party saved from suicide. The satellite Low Apatia hides the Underdark resistance base — a vast cavern with mushroom overgrowth, steam vents, and armed fighters. Dr. Rhea Caulder was kidnapped by Galaxy Bucks to refine Dragon Fuel; she was tracked by ankle bracelets. Pierre Krank\'s flying emporium sells rare March artifacts. The abandoned underwater Rebis HQ lies beneath the surface.',
          factions: ['Ultimum Inc', 'Galaxy Bucks', 'Cult of the Unseen', 'Broken Chain', 'Kuo-toa Communities', 'Oddjobers Union'],
          keyNPCs: [
            'Will — Wraith\'s nervous researcher ally',
            'Elisabeth — Bob\'s handler, Cult of the Unseen leader, grey bun',
            'John Thick — Keanu-like assassin, Dragon Fuel addict',
            'Dr. Rhea Caulder — kidnapped immunologist, made Dragon Fuel drinkable',
            'Leon — Broken Chain leader, cloaked rapier fighter, calls himself Batman',
            'Alexander Victor — March native, party saved from suicide, now rebel',
            'Helia Morne — githyanki Luna Corps agent, undercover in Broken Chain',
            'Victor — vigilante association leader',
            'Pierre Krank — flying emporium merchant, extravagant moustache, scrying eye',
            'Thillian Romain — party stowaway, constantly eating Chinese takeout',
            'Dr. Selene Korr — scientist at Galaxy Bucks',
          ],
          events: [
            'Dragon Fuel conspiracy exposed — Tarrasque embryonic fluid',
            'Dr. Caulder rescue from Galaxy Bucks underground lab',
            'Galaxy Bucks mecha encounter (giant Cupie-style mechs)',
            'Will kidnapped by Kuo-toa to fix polluted pipes',
            'Cult of the Unseen underground vault discovered',
            'Broken Chain rebellion & shipping container bar HQ',
            'Low Apatia Underdark resistance camp discovery',
            'Executive kidnapping operation',
            'Johnny tests Dragon Fuel — grows horns temporarily',
            'Pierre Krank sells Lord Briar\'s artifacts',
            'John Thick\'s Dragon Fuel addiction & scale growth',
          ],
          threatLevel: 'Extreme',
          status: 'Hostile — Ultimum Inc hit active on Gloria, corporate control total',
          mat: { roughness: 0.3, metalness: 0.2 },
        },
        {
          name: 'The March',
          distance: 230,
          size: 6.5,
          speed: 0.0018,
          color: 0x6b7280,
          desc: 'Perpetual war zone — ancient ruins of Chimer\'s ancestors, Broken Sepulchre vaults.',
          lore: 'A planet ravaged by endless wars — "the purge 24/7" with safe-zone cities for the elite. Home to the Salamine military family (March royalty). Ancient ruins from a lost civilization — artists\' recreations show beings that look exactly like Chimer — hold secrets about the Rebis Machine and led to humanity\'s greatest scientific discoveries. The Broken Sepulchre vaults are ancient sealed chambers unlockable with teardrop-shaped coin keys (thousands of years old, eroded to circles, powerful conjuration magic). Red and blue key varieties exist. The Lucky Lincoln itself is one such key piece. The Negrado transmuter piece was here but went missing, entering Apatia. Xenathel Salamine (Rebis\'s "The General") originally stayed behind to cover the team\'s escape from Ultimum\'s raid — thought dead, he wandered The March for years "different," eventually becoming a corrupted angel imprisoned on Rodina. The last surviving demon lord wanders the planet alone, known only as "Death." The Rebis team deliberately allowed the March wars to continue so they could siphon military funding for their research.',
          factions: ['Salamine Military Family', 'March Warlords', 'Ancient Civilization (extinct)'],
          keyNPCs: [
            'Xenathel Salamine — corrupted angel, March royalty, former Rebis General',
            'The Last Demon Lord — "Death," wanders alone',
            'Alexander Victor — March native, saved by party, now with Broken Chain on Apatia',
          ],
          events: [
            'Visions of the ancient civilization (Chimer\'s ancestors)',
            'Xenathel\'s sacrifice covering Rebis team\'s escape',
            'Xenathel\'s corruption and years of wandering',
            'Rebis team secretly funding research through war profits',
            'Broken Sepulchre vault system discovered — coin keys needed',
            'Negrado transmuter went missing, surfaced on Apatia',
            'March military strike crushed Wilds protest → birthed Cult of the Sun',
          ],
          threatLevel: 'Extreme',
          status: 'War Zone — Perpetual conflict, ancient secrets buried',
          mat: { roughness: 1.0, metalness: 0.5 },
        },
        {
          name: 'The Wilds',
          distance: 270,
          size: 8,
          speed: 0.0013,
          color: 0x10b981,
          desc: 'Untamed jungle world — Cult of the Sun\'s birthplace, festival gateway to Phantoma.',
          lore: 'A massive untamed jungle world rich in natural resources but extremely dangerous. The Cult of the Sun was born here after a peaceful protest was violently crushed by a March military strike, radicalizing the survivors into an armed nihilist militia whose creed is "the sun needs to rest." They prey on people who\'ve recently lost loved ones and the suicidal, spreading influence to Apatia and the backside of Niniche. A legendary festival near the asteroid belt between The Wilds and Phantoma occurs during rare astronomical alignments, offering the only chance to glimpse the vanished ghost planet. Researchers from The Wilds presented gene-splicing insect research at Rodina\'s convention. The planet remains largely unexplored by the party.',
          factions: ['Cult of the Sun', 'Indigenous Communities'],
          keyNPCs: [
            'Cult of the Sun leaders — nihilist militia commanders',
            'Gene-splicing researcher — presented at Rodina convention',
          ],
          events: [
            'Peaceful protest crushed by March military strike',
            'Cult of the Sun formation from radicalized survivors',
            'Festival at asteroid belt — rare Phantoma alignment',
            'Cult spreads to Apatia and backside of Niniche',
          ],
          threatLevel: 'High',
          status: 'Unstable — Cult influence spreading across system',
          mat: { roughness: 0.8, emissive: 0x002200 },
        },
        {
          name: 'Phantoma',
          distance: 320,
          size: 7,
          speed: 0.0008,
          color: 0xffffff,
          desc: 'The ghost planet — vanished into the Ethereal Plane, key to saving the universe.',
          lore: 'The ghost planet — vanished from physical space but still existing in the ethereal plane, now overcrowded with the dead and displaced spirits pushed behind a massive white wall (password: "VENUS" — connecting to the Cupie CEO\'s deceased wife). A purple coin is the only physical proof of Phantoma\'s existence. During rare astronomical alignments when The Wilds passes through the nearby asteroid belt, the planet can briefly be glimpsed. Hui\'s probe captured a single frame of footage confirming it exists in the ethereal realm. Claire, a teleporting wizard, has reportedly visited. The Citrinitas analyzer — the last Rebis piece — is trapped here, capable of generating any information ever needed ("ultra mega super chatgpt"). The planet\'s disappearance is intrinsically linked to the collapse of the universe itself. The ethereal plane has been co-opted as the digital plane — the ghost-glitch overlap created Aphrodite\'s rogue AI on Cupie.',
          factions: ['Unknown — Ethereal inhabitants'],
          keyNPCs: [
            'Claire — teleporting wizard, has visited Phantoma',
            'Unknown spirit inhabitants',
          ],
          events: [
            'Planet disappeared into the Ethereal Plane',
            'Hui\'s probe captures single frame of ethereal footage',
            'Purple coin discovered — physical proof of existence',
            'Claire\'s teleported visits',
            'VENUS password discovered for the spirit wall',
            'Ethereal-Digital plane overlap created Aphrodite AI',
          ],
          threatLevel: '???',
          status: 'Missing — Phased into the Ethereal Plane, Citrinitas trapped inside',
          hasMoon: true,
          isGhost: true,
        },
      ];

      // Faction territory color map
      const factionColors = {
        "The Don's Syndicate": 0xd97706,
        'Ifriti Clans': 0xff6600,
        'Brass Lords': 0xff4400,
        'Banana Guard': 0xfbbf24,
        'Rebis Company': 0x3b82f6,
        'Hero Corps': 0x60a5fa,
        'Luna Corps': 0xc084fc,
        'Niniche Military': 0xef4444,
        'Ultimum Inc': 0x7c3aed,
        'Galaxy Bucks': 0x06b6d4,
        'Cult of the Sun': 0xf59e0b,
        'Cult of the Unseen': 0x1e1b4b,
        'Broken Chain': 0xb45309,
        'Salamine Military Family': 0xdc2626,
        'March Warlords': 0x991b1b,
        'Indigenous Communities': 0x10b981,
        'Beach Commune': 0x38bdf8,
        'Feywild Courts': 0x22c55e,
        'Lincoln Station Workers': 0x94a3b8,
        'Fathom Ink': 0x475569,
        "Cupid's Arrow Corp": 0xe879a8,
        "Tabaga's Family": 0xf472b6,
        'Orc Communities': 0x84cc16,
        'Kuo-toa Communities': 0x0e7490,
        'Oddjobers Union': 0x78716c,
        "Ancient Civilization (extinct)": 0x9ca3af,
        "Unknown — Ethereal inhabitants": 0xd4d4d8,
      };

      let ghostMeshes = [];

      planetsData.forEach((data) => {
        // Orbit Line — colored by primary faction
        const primaryFaction = data.factions && data.factions[0];
        const orbitColor = (primaryFaction && factionColors[primaryFaction]) || 0x666666;
        const orbitGeo = new THREE.RingGeometry(
          data.distance - 0.3,
          data.distance + 0.3,
          128
        );
        const orbitMat = new THREE.MeshBasicMaterial({
          color: orbitColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.12,
        });
        const orbit = new THREE.Mesh(orbitGeo, orbitMat);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);

        // Faction Territory Glow Ring
        if (primaryFaction && factionColors[primaryFaction]) {
          const glowGeo = new THREE.RingGeometry(
            data.distance - 2,
            data.distance + 2,
            128
          );
          const glowMat = new THREE.MeshBasicMaterial({
            color: factionColors[primaryFaction],
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.03,
          });
          const glowRing = new THREE.Mesh(glowGeo, glowMat);
          glowRing.rotation.x = Math.PI / 2;
          scene.add(glowRing);
        }

        // Planet Group/Mesh
        let mainMesh;
        if (data.type === 'station') {
          // Lincoln Station — Torus (ring-shaped station)
          mainMesh = new THREE.Group();
          const torusGeo = new THREE.TorusGeometry(data.size, data.size * 0.3, 16, 48);
          const torusMat = new THREE.MeshStandardMaterial({
            color: data.color,
            roughness: 0.2,
            metalness: 0.9,
          });
          const torus = new THREE.Mesh(torusGeo, torusMat);
          torus.rotation.x = Math.PI / 2;
          mainMesh.add(torus);
          // Station lights
          const lightGeo = new THREE.SphereGeometry(0.3, 8, 8);
          const lightMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
          for (let i = 0; i < 8; i++) {
            const light = new THREE.Mesh(lightGeo, lightMat);
            const a = (i / 8) * Math.PI * 2;
            light.position.set(Math.cos(a) * data.size, 0, Math.sin(a) * data.size);
            mainMesh.add(light);
          }
          mainMesh.userData = { ...data };
        } else if (data.type === 'tidal-lock') {
          // Niniche — Half-lit planet (tidally locked)
          mainMesh = new THREE.Group();
          // Lit side (warm/golden)
          const litGeo = new THREE.SphereGeometry(data.size, 32, 32, 0, Math.PI);
          const litMat = new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            roughness: 0.5,
            metalness: 0.2,
            emissive: 0x332200,
          });
          const litHalf = new THREE.Mesh(litGeo, litMat);
          mainMesh.add(litHalf);
          // Dark side (cold/blue-gray)
          const darkGeo = new THREE.SphereGeometry(data.size, 32, 32, Math.PI, Math.PI);
          const darkMat = new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.8,
            metalness: 0.3,
          });
          const darkHalf = new THREE.Mesh(darkGeo, darkMat);
          mainMesh.add(darkHalf);
          // Terminator line glow
          const termGeo = new THREE.RingGeometry(data.size - 0.05, data.size + 0.05, 32);
          const termMat = new THREE.MeshBasicMaterial({
            color: 0xff9900,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4,
          });
          const termLine = new THREE.Mesh(termGeo, termMat);
          termLine.rotation.y = Math.PI / 2;
          mainMesh.add(termLine);
          mainMesh.userData = { ...data };
        } else if (data.type === 'dual-merge') {
          mainMesh = new THREE.Group();
          const geoA = new THREE.SphereGeometry(data.size * 0.6, 32, 32);
          const matA = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            roughness: 0.7,
          });
          const planetA = new THREE.Mesh(geoA, matA);
          planetA.position.set(-2.5, 0, 0);
          const geoB = new THREE.SphereGeometry(data.size * 0.7, 32, 32);
          const matB = new THREE.MeshStandardMaterial({
            color: 0xa855f7,
            roughness: 0.6,
          });
          const planetB = new THREE.Mesh(geoB, matB);
          planetB.position.set(2.5, 0, 0);
          mainMesh.add(planetA);
          mainMesh.add(planetB);

          // Asteroids
          const count = 600;
          const pos = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 6 + Math.random() * 4;
            pos[i * 3] = Math.cos(a) * r;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
            pos[i * 3 + 2] = Math.sin(a) * r;
          }
          const pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const pMat = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.3 });
          const belt = new THREE.Points(pGeo, pMat);
          belt.rotation.x = Math.PI / 6;
          belt.rotation.y = Math.PI / 6;
          mainMesh.add(belt);
          mainMesh.userData = { ...data };
        } else {
          const geo = new THREE.SphereGeometry(data.size, 32, 32);
          let mat;
          if (data.isGhost)
            mat = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.3,
              transmission: 0.6,
              roughness: 0.2,
              metalness: 0.1,
            });
          else
            mat = new THREE.MeshStandardMaterial({
              color: data.color,
              ...data.mat,
            });
          mainMesh = new THREE.Mesh(geo, mat);
          mainMesh.userData = { ...data };
          if (data.isGhost) ghostMeshes.push(mainMesh);
        }
        scene.add(mainMesh);

        // Add Label
        const label = createLabel(data.name);
        label.position.set(0, data.size + 3, 0); // Position above planet
        mainMesh.add(label);

        // Moon
        let moonPivot = null;
        if (data.hasMoon) {
          moonPivot = new THREE.Object3D();
          mainMesh.add(moonPivot);
          const moon = new THREE.Mesh(
            new THREE.SphereGeometry(data.size * 0.35, 16, 16),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
          );
          moon.position.set(12, 0, 0);
          moonPivot.add(moon);
        }

        // Threat level glow for Extreme planets
        if (data.threatLevel === 'Extreme') {
          const threatCanvas = document.createElement('canvas');
          threatCanvas.width = 128;
          threatCanvas.height = 128;
          const threatCtx = threatCanvas.getContext('2d');
          const threatGrad = threatCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
          threatGrad.addColorStop(0, 'rgba(220, 38, 38, 0.3)');
          threatGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.1)');
          threatGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          threatCtx.fillStyle = threatGrad;
          threatCtx.fillRect(0, 0, 128, 128);
          const threatGlow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(threatCanvas),
            transparent: true,
            blending: THREE.AdditiveBlending,
          }));
          threatGlow.scale.set(data.size * 5, data.size * 5, 1);
          mainMesh.add(threatGlow);
        }

        const angle = Math.random() * Math.PI * 2;
        planets.push({
          mesh: mainMesh,
          distance: data.distance,
          speed: data.speed,
          angle: angle,
          moonPivot: moonPivot,
          type: data.type,
          isGhost: data.isGhost,
        });
      });

      // RAYCASTER & ZOOM
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      // Default camera position for zooming back out
      const defaultCameraPos = new THREE.Vector3(0, 150, 300);
      const defaultLookAt = new THREE.Vector3(0, 0, 0);

      // Track mouse to distinguish click vs drag
      let mouseDownPos = { x: 0, y: 0 };

      renderer.domElement.addEventListener('mousedown', (event) => {
        mouseDownPos = { x: event.clientX, y: event.clientY };
      });

      renderer.domElement.addEventListener('mouseup', (event) => {
        // Only treat as click if mouse moved less than 10px (forgiving threshold)
        const dx = event.clientX - mouseDownPos.x;
        const dy = event.clientY - mouseDownPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > 10) return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        // Raycast against everything but filter carefully
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Find first object that belongs to a planet (check self + parents)
        const hit = intersects.find((i) => {
          let obj = i.object;
          while (obj) {
            if (obj.userData && (obj.userData.name || obj.userData.desc)) return true;
            obj = obj.parent;
          }
          return false;
        });

        if (hit) {
          // Extract data from the found ancestor
          let targetObj = hit.object;
          while (targetObj && !(targetObj.userData && (targetObj.userData.name || targetObj.userData.desc))) {
            targetObj = targetObj.parent;
          }

          if (targetObj) {
            setSelectedPlanet(targetObj.userData);
            setPlanetInfoTab('overview');

            // --- ZOOM IN ---
            setIsPaused(true);
            isPausedRef.current = true;

            const planetPos = new THREE.Vector3();
            targetObj.getWorldPosition(planetPos);

            targetCameraPos = planetPos
              .clone()
              .add(new THREE.Vector3(15, 10, 20));
            targetLookAt = planetPos.clone();
            controls.target.copy(targetLookAt);
          }
        } else {
          // --- ZOOM OUT — Click on empty space ---
          setSelectedPlanet(null);
          setPlanetInfoTab('overview');
          setIsPaused(false);
          isPausedRef.current = false;

          targetCameraPos = defaultCameraPos.clone();
          targetLookAt = defaultLookAt.clone();
          controls.target.copy(targetLookAt);
        }
      });

      // Cancel lerp zoom when user scrolls (so OrbitControls can handle wheel zoom freely)
      renderer.domElement.addEventListener('wheel', () => {
        targetCameraPos = null;
        targetLookAt = null;
      });

      // ANIMATION
      const animate = () => {
        animationId = requestAnimationFrame(animate);
        controls.update();

        // Handle Zoom Animation (Lerp)
        if (targetCameraPos && targetLookAt) {
          camera.position.lerp(targetCameraPos, 0.05);
          camera.lookAt(controls.target);

          // Clear targets once close enough (prevents permanent lerp)
          if (camera.position.distanceTo(targetCameraPos) < 0.5) {
            targetCameraPos = null;
            targetLookAt = null;
          }
        }

        const time = Date.now() * 0.001;
        sunGlow.scale.set(80 + Math.sin(time) * 5, 80 + Math.sin(time) * 5, 1);

        if (!isPausedRef.current) {
          planets.forEach((p) => {
            p.angle += p.speed;
            p.mesh.position.x = Math.cos(p.angle) * p.distance;
            p.mesh.position.z = Math.sin(p.angle) * p.distance;
            p.mesh.rotation.y += 0.005;
            if (p.type === 'dual-merge') p.mesh.rotation.z += 0.002;
            if (p.type === 'station') p.mesh.rotation.y += 0.01;
            if (p.moonPivot) p.moonPivot.rotation.y += 0.03;
          });
        }

        // Phantoma ghost flicker effect
        ghostMeshes.forEach((gm) => {
          if (gm.material) {
            gm.material.opacity = 0.15 + Math.sin(time * 1.5) * 0.15 + Math.sin(time * 3.7) * 0.05;
          }
        });

        // Bubble breathing effect — subtle pulse
        bubbleMat.opacity = 0.025 + Math.sin(time * 0.3) * 0.01;
        innerShellMat.opacity = 0.01 + Math.sin(time * 0.5 + 1) * 0.008;

        // Wireframe slow rotation
        wireMesh.rotation.y += 0.0002;
        wireMesh.rotation.x += 0.0001;

        // Dust field gentle drift
        dustField.rotation.y += 0.0001;
        dustField.rotation.x += 0.00005;

        // Starfield rotation
        starField.rotation.y += 0.00005;

        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        if (container) container.innerHTML = '';
        renderer.dispose();
      };
    };

    loadThreeJS();
  }, [showOperations]);

  /// Handle users longin
  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('cosmicToken');
    localStorage.removeItem('cosmicUser');
    setCurrentUser(null);
    setChatOpen(false);
  };

  // --- STANDARD FUNCTIONS ---
  const scrollToSection = (section) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === item.name);
      if (existing) {
        return prev.map((i) =>
          i.name === item.name ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
    setTimeout(() => setCartOpen(false), 2000);
  };

  const removeFromCart = (itemName) => {
    setCart((prev) => prev.filter((i) => i.name !== itemName));
  };

  const updateQuantity = (itemName, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.name === itemName) {
            const newQuantity = i.quantity + delta;
            return newQuantity > 0 ? { ...i, quantity: newQuantity } : i;
          }
          return i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (sum, item) =>
        sum + parseInt(item.price.replace(/,/g, '')) * item.quantity,
      0
    );
  };
  // Render stars for average
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < Math.round(rating)
          ? 'text-yellow-400 fill-yellow-400'
          : 'text-gray-600'
          }`}
      />
    ));
  };
  // Average constant
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) /
      reviews.length
      : 0;




  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Send data WITHOUT id
    const reviewData = {
      name: newReview.name,
      rating: newReview.rating,
      comment: newReview.comment,
      date: `Cosmic Year ${formattedDate}`
    };

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'Failed to save');
        return;
      }

      // Use the ID returned from database
      setReviews(prev => [...prev, { ...reviewData, id: result.id }]);
      setNewReview({ name: '', rating: 5, comment: '' });

    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
    }
  };
  const handleCheckout = () => {
    if (cart.length === 0) return;
    document.getElementById('cart-drawer')?.classList.add('translate-x-full');
    setShowCheckout(true);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setCart([]);
    setShowPaymentSuccess(true);
    setTimeout(() => {
      setShowCheckout(false);
      setShowPaymentSuccess(false);
      setPaymentForm({ cardNumber: '', fullName: '', expiryDate: '', cvv: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 5000);
  };

  const handleCareerSubmit = (e) => {
    e.preventDefault();
    setCareerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      nationalId: '',
      position: '',
      summary: '',
      resume: null,
    });
    const fileInput = document.getElementById('resume-upload');
    if (fileInput) fileInput.value = '';
    setShowShootingStar(true);
    setTimeout(() => setShowShootingStar(false), 2500);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCareerForm({ ...careerForm, resume: e.target.files[0] });
    }
  };

  const ShootingStar = () => (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      <div
        className="absolute animate-[shooting-star_2s_ease-out]"
        style={{
          top: '10%',
          left: '-10%',
          animation: 'shooting-star 2s ease-out forwards',
        }}
      >
        <div className="relative">
          <Star className="w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
          <div className="absolute top-1/2 left-1/2 -translate-y-1/2 w-60 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-transparent blur-sm" />
        </div>
      </div>
      <style>{`@keyframes shooting-star { 0% { transform: translate(0, 0) rotate(0deg); opacity: 1; } 100% { transform: translate(120vw, 80vh) rotate(45deg); opacity: 0; } }`}</style>
    </div>
  );

  const MenuItem = ({ icon: Icon, text, section }) => (
    <button
      onClick={() => scrollToSection(section)}
      className={`group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${activeSection === section
        ? 'border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.6)]'
        : ''
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
          {text}
        </span>
      </div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
    </button>
  );

  const TeamMember = ({ name, title, description, icon: Icon, color }) => (
    <div
      className={`group relative p-8 bg-gradient-to-br ${color} rounded-2xl border-2 border-cyan-400/30 backdrop-blur-md hover:border-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all duration-500 transform hover:scale-105`}
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity -z-10" />
      <div className="flex items-start gap-4 mb-4">
        <div className="p-4 bg-black/40 rounded-xl border border-cyan-400/50 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]">
          <Icon className="w-8 h-8 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-2">
            {name}
          </h3>
          <p className="text-cyan-400 font-semibold text-lg italic">{title}</p>
        </div>
      </div>
      <div className="text-cyan-50 leading-relaxed space-y-2">
        {description}
      </div>
    </div>
  );

  const SuccessStory = ({ title, description, icon: Icon }) => (
    <div className="group relative p-6 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-xl border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all duration-500">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
          {title}
        </h3>
      </div>
      <div className="text-purple-100 leading-relaxed">{description}</div>
    </div>
  );

  const MerchItem = ({ name, price, icon: Icon }) => (
    <div className="group relative p-6 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl border-2 border-amber-400/40 backdrop-blur-sm hover:border-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-8 h-8 text-amber-400 group-hover:text-amber-300" />
        <span className="text-2xl font-bold text-amber-400">{price} ◈</span>
      </div>
      <h4 className="text-lg font-semibold text-amber-100 group-hover:text-white transition-colors mb-4">
        {name}
      </h4>
      <button
        onClick={() => addToCart({ name, price, icon: Icon })}
        className="w-full py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
      >
        <ShoppingCart className="w-4 h-4" /> Add to Cart
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-indigo-950 to-purple-950 text-white overflow-x-hidden relative">
      {/* REPLACED STATIC STARFIELD WITH WARP SPEED BACKGROUND */}
      <WarpSpeedBackground />
      {showShootingStar && <ShootingStar />}

      {/* ARCADE OVERLAY */}
      {showArcade && <ArcadeOverlay onClose={() => setShowArcade(false)} />}
      {/* DICE ROLLER OVERLAY */}
      {showDiceRoller && (
        <DiceRoller onClose={() => setShowDiceRoller(false)} />
      )}
      {/*Login OVERLAY */}
      {showLogin && <LoginOverlay onClose={() => setShowLogin(false)} onLogin={handleLogin} />}

      {/*Chat OVERLAY */}

      {/* Chat Components - Only show for logged in users */}
      {currentUser && (
        <>
          {/* Cosmic Chat */}
          <ChatBubble
            onToggle={() => setChatOpen(!chatOpen)}
            unreadCount={unreadCount}
          />
          <ChatWindow
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            currentUser={currentUser}
          />

          {/* D&D Assistant Chat - New! */}
          <DndChatBubble
            onToggle={() => {
              setDndChatOpen(!dndChatOpen);
              setDndHasNewResponse(false);
            }}
            hasNewResponse={dndHasNewResponse}
          />
          <DndChatWindow
            isOpen={dndChatOpen}
            onClose={() => setDndChatOpen(false)}
            currentUser={currentUser}
          />
        </>
      )}
      {/* Checkout Page Overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg overflow-y-auto">
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
              {!showPaymentSuccess ? (
                <div className="relative p-12 bg-gradient-to-br from-cyan-900/60 to-purple-900/60 rounded-3xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(34,211,238,0.6)]">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                  <div className="relative space-y-8">
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="absolute top-0 right-0 p-2 text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Sparkles className="w-16 h-16 text-cyan-400 animate-pulse" />
                      </div>
                      <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                        INTERSTELLAR PAYMENT PROCESSING TERMINAL
                      </h2>
                      <p className="text-xl text-cyan-200 italic">
                        Where cosmic credits meet quantum transactions
                      </p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-xl border border-cyan-400/30">
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-cyan-300 font-bold">
                          Total Amount:
                        </span>
                        <span className="text-amber-300 font-black text-3xl">
                          {getTotalPrice().toLocaleString()} ◈
                        </span>
                      </div>
                    </div>
                    <form onSubmit={handlePayment} className="space-y-6">
                      <div>
                        <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                          Bank Card ID / Card Number
                        </label>
                        <input
                          type="text"
                          value={paymentForm.cardNumber}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cardNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg font-mono"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                          Full Name on Card
                        </label>
                        <input
                          type="text"
                          value={paymentForm.fullName}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg"
                          placeholder="COSMIC TRAVELER"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={paymentForm.expiryDate}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                expiryDate: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg font-mono"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-cyan-300 font-semibold mb-2 text-lg">
                            Security Code (CVV)
                          </label>
                          <input
                            type="text"
                            value={paymentForm.cvv}
                            onChange={(e) =>
                              setPaymentForm({
                                ...paymentForm,
                                cvv: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-black/40 border-2 border-cyan-400/40 rounded-lg text-cyan-100 placeholder-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-colors text-lg font-mono"
                            placeholder="***"
                            maxLength="3"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-5 px-8 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-black text-2xl rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:shadow-[0_0_60px_rgba(34,211,238,0.8)] transform hover:scale-105 border-2 border-cyan-400/50"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Zap className="w-8 h-8" /> PROCESS PAYMENT{' '}
                          <Zap className="w-8 h-8" />
                        </div>
                      </button>
                    </form>
                    <div className="text-center text-sm text-cyan-400 italic space-y-1">
                      <p>⚡ Powered by Quantum Encryption Technology ⚡</p>
                      <p>🌌 Your transaction is secured by cosmic forces 🌌</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative p-12 bg-gradient-to-br from-green-900/60 to-emerald-900/60 rounded-3xl border-2 border-green-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(34,197,94,0.6)] animate-pulse">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                  <div className="relative text-center space-y-6">
                    <div className="flex justify-center">
                      <Trophy className="w-24 h-24 text-green-400 animate-bounce" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300">
                      YOUR PAYMENT IS BEING PROCESSED!
                    </h2>
                    <div className="space-y-4 text-xl text-green-100">
                      <p className="font-bold text-2xl">
                        ✨ Thank you for supporting us, brave cosmic patron! ✨
                      </p>
                      <p className="italic">
                        Your credits are being transmitted across seventeen
                        dimensions...
                      </p>
                      <p className="text-green-300 font-semibold text-2xl animate-pulse">
                        Please be sure to pay again! 😄🚀💫
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                      <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
                      <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Donation Checkout Page Overlay */}
      {showDonationCheckout && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg overflow-y-auto">
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-3xl mx-auto">
              {!showDonationSuccess ? (
                <div className="relative p-12 bg-gradient-to-br from-rose-900/60 to-pink-900/60 rounded-3xl border-2 border-rose-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(244,63,94,0.6)]">
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                  <div className="relative space-y-8">
                    <button
                      onClick={() => setShowDonationCheckout(false)}
                      className="absolute top-0 right-0 p-2 text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <X className="w-8 h-8" />
                    </button>
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <Heart className="w-16 h-16 text-rose-400 animate-pulse" />
                      </div>
                      <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                        DJ SMOOCH.EXE MEMORIAL DONATION
                      </h2>
                      <p className="text-xl text-rose-200 italic">
                        Every cosmic credit keeps his legacy alive
                      </p>
                    </div>
                    <div className="p-6 bg-black/40 rounded-xl border border-rose-400/30 space-y-3">
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-rose-300 font-bold">
                          Donor:
                        </span>
                        <span className="text-white font-black text-xl">
                          {newDonation.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-rose-300 font-bold">
                          Donation Amount:
                        </span>
                        <span className="text-rose-200 font-black text-3xl">
                          {newDonation.amount.toLocaleString()} ◈
                        </span>
                      </div>
                      {newDonation.message && (
                        <div className="pt-2 border-t border-rose-400/30">
                          <span className="text-rose-300 font-bold">Message: </span>
                          <span className="text-rose-100 italic">"{newDonation.message}"</span>
                        </div>
                      )}
                    </div>
                    <form onSubmit={async (e) => {
                      e.preventDefault();

                      const today = new Date();
                      const formattedDate = today.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });

                      const donationData = {
                        name: newDonation.name,
                        amount: newDonation.amount,
                        message: newDonation.message,
                        date: `Cosmic Year ${formattedDate}`
                      };

                      const result = await saveDonation(donationData);

                      if (result) {
                        setDonations(prev => [{ ...donationData, id: result.id }, ...prev]);
                        setDonationTotal(result.newTotal);
                        setShowDonationSuccess(true);

                        setTimeout(() => {
                          setShowDonationCheckout(false);
                          setShowDonationSuccess(false);
                          setNewDonation({ name: '', amount: 100, message: '' });
                          setDonationPaymentForm({ cardNumber: '', fullName: '', expiryDate: '', cvv: '' });
                        }, 5000);
                      }
                    }} className="space-y-6">
                      <div>
                        <label className="block text-rose-300 font-semibold mb-2 text-lg">
                          Bank Card ID / Card Number
                        </label>
                        <input
                          type="text"
                          value={donationPaymentForm.cardNumber}
                          onChange={(e) =>
                            setDonationPaymentForm({
                              ...donationPaymentForm,
                              cardNumber: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors text-lg font-mono"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-rose-300 font-semibold mb-2 text-lg">
                          Full Name on Card
                        </label>
                        <input
                          type="text"
                          value={donationPaymentForm.fullName}
                          onChange={(e) =>
                            setDonationPaymentForm({
                              ...donationPaymentForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors text-lg"
                          placeholder="COSMIC PATRON"
                          required
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-rose-300 font-semibold mb-2 text-lg">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={donationPaymentForm.expiryDate}
                            onChange={(e) =>
                              setDonationPaymentForm({
                                ...donationPaymentForm,
                                expiryDate: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors text-lg font-mono"
                            placeholder="MM/YY"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-rose-300 font-semibold mb-2 text-lg">
                            Security Code (CVV)
                          </label>
                          <input
                            type="text"
                            value={donationPaymentForm.cvv}
                            onChange={(e) =>
                              setDonationPaymentForm({
                                ...donationPaymentForm,
                                cvv: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors text-lg font-mono"
                            placeholder="***"
                            maxLength="3"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-5 px-8 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-2xl rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(244,63,94,0.5)] hover:shadow-[0_0_60px_rgba(244,63,94,0.8)] transform hover:scale-105 border-2 border-rose-400/50"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Heart className="w-8 h-8" /> COMPLETE DONATION{' '}
                          <Heart className="w-8 h-8" />
                        </div>
                      </button>
                    </form>
                    <div className="text-center text-sm text-rose-400 italic space-y-1">
                      <p>🎧 DJ Smooch.exe watches over every transaction 🎧</p>
                      <p>💔 His beats may have stopped, but his spirit lives on 💔</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative p-12 bg-gradient-to-br from-rose-900/60 to-pink-900/60 rounded-3xl border-2 border-rose-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(244,63,94,0.6)] animate-pulse">
                  <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                  <div className="relative text-center space-y-6">
                    <div className="flex justify-center">
                      <Heart className="w-24 h-24 text-rose-400 animate-bounce" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                      YOUR DONATION HAS BEEN RECEIVED! 🎧💖
                    </h2>
                    <div className="space-y-4 text-xl text-rose-100">
                      <p className="font-bold text-2xl">
                        ✨ Thank you for honoring DJ Smooch.exe's memory! ✨
                      </p>
                      <p className="italic">
                        Your {newDonation.amount.toLocaleString()} ◈ is being processed through cosmic channels...
                      </p>
                      <p className="text-rose-300 font-semibold text-2xl animate-pulse">
                        His beats will echo forever! 🎵🚀💫
                      </p>
                    </div>
                    <div className="flex justify-center gap-4 pt-4">
                      <Music className="w-8 h-8 text-rose-400 animate-spin" />
                      <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
                      <Music className="w-8 h-8 text-rose-400 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Area of Operations - Solar System */}
      {showOperations && (
        // Added z-[100] to fix overlap with nav
        <div className="fixed inset-0 z-[100] bg-black">
          {/* UPDATED: Top Right Control Panel */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-3" style={{ right: selectedPlanet ? '440px' : '24px', transition: 'right 0.4s ease' }}>
            <button
              onClick={() => {
                setShowOperations(false);
                setSelectedPlanet(null);
              }}
              className="px-6 py-3 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-lg border-2 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center justify-center gap-2 transition-all transform hover:scale-105"
            >
              <LogOut className="w-5 h-5" />
              RETURN TO BASE
            </button>

            <button
              onClick={togglePause}
              className={`px-6 py-3 font-bold rounded-lg border-2 flex items-center justify-center gap-2 transition-all transform hover:scale-105 ${isPaused
                ? 'bg-yellow-600/90 hover:bg-yellow-500 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)]'
                : 'bg-green-600/90 hover:bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                }`}
            >
              {isPaused ? (
                <Play className="w-5 h-5" />
              ) : (
                <Pause className="w-5 h-5" />
              )}
              {isPaused ? 'RESUME ORBITS' : 'PAUSE ORBITS'}
            </button>
          </div>

          <div className="absolute top-4 left-4 z-10 p-4 bg-black/80 backdrop-blur-lg rounded-xl border-2 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 mb-1">
              🛸 AREA OF OPERATIONS
            </h2>
            <p className="text-sm text-cyan-200 mb-2">
              🖱️ Click planets • Drag to rotate • Scroll to zoom
            </p>
            <p className="text-xs text-cyan-400/60 italic">
              {['⚡ "Recycle these nuts!" — Reigen, Masquerade of Sulfur',
                '🎲 "Hui complained 12 times!" — The Goblins, Sulfur',
                '🎵 "His beats will echo forever!" — DJ Smooch.exe Memorial',
                '🐱 "Mamaa!" — The Quasit, to Tabaga',
                '🧀 "I\'m just cheese." — The Mozzarella, Sulfur',
                '🎸 "Do you think you\'re better off in a corporation?" — The Cheese, to Johnny',
                '💀 "Don\'t make a mess on the carpet." — The Don, to Bob',
                '🌙 Snoopy the Destroyer rides again!',
                '🎭 "What the hell are you?" — The Don, meeting Bob',
                '🪙 The Lucky Lincoln demands another flip...',
                '🧬 Chimer is 2,500 years old. He had no idea.',
                '⚔️ "These nuts!" — Reigen\'s legendary taunt',
              ][Math.floor(Date.now() / 15000) % 12]}
            </p>
          </div>

          <div
            ref={mountRef}
            className="w-full h-full"
            style={{ cursor: 'grab' }}
          />

          {/* === PLANET INFO SIDEBAR — Content-Forward Design === */}
          {selectedPlanet && (
            <div
              className="absolute top-0 right-0 bottom-0 z-10 flex flex-col"
              style={{
                width: '420px',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(15,23,42,0.97) 50%, rgba(30,10,60,0.95) 100%)',
                borderLeft: '2px solid rgba(34,211,238,0.4)',
                boxShadow: '-10px 0 60px rgba(34,211,238,0.15), -5px 0 30px rgba(168,85,247,0.1)',
                animation: 'slideInRight 0.35s ease-out',
              }}
            >
              {/* === HEADER — Planet Name + Tagline === */}
              <div className="p-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(34,211,238,0.25)', background: 'linear-gradient(180deg, rgba(34,211,238,0.08) 0%, transparent 100%)' }}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">
                        {selectedPlanet.type === 'station' ? '🛸' :
                          selectedPlanet.isGhost ? '👻' :
                            selectedPlanet.type === 'tidal-lock' ? '🌗' :
                              selectedPlanet.type === 'dual-merge' ? '💕' :
                                selectedPlanet.threatLevel === 'Extreme' ? '💀' : '🪐'}
                      </span>
                      <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300" style={{ letterSpacing: '0.05em' }}>
                        {selectedPlanet.name.toUpperCase()}
                      </h3>
                    </div>
                    <p className="text-sm text-cyan-200/80 italic leading-snug">{selectedPlanet.desc}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedPlanet(null); setPlanetInfoTab('overview'); }}
                    className="p-1.5 hover:bg-red-500/30 rounded-lg transition-all flex-shrink-0 group"
                  >
                    <X className="w-5 h-5 text-cyan-400/60 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>

                {/* Threat + Status Badges */}
                <div className="flex gap-2 mt-3 flex-wrap">
                  {selectedPlanet.threatLevel && (
                    <span className={`px-3 py-1 text-xs font-black rounded-full border-2 uppercase tracking-wider ${selectedPlanet.threatLevel === 'Extreme' ? 'bg-red-900/70 border-red-500 text-red-200 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse' :
                      selectedPlanet.threatLevel === 'High' ? 'bg-orange-900/70 border-orange-500 text-orange-200 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                        selectedPlanet.threatLevel === 'Moderate' ? 'bg-yellow-900/70 border-yellow-600 text-yellow-200' :
                          selectedPlanet.threatLevel === '???' ? 'bg-purple-900/70 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.6)] animate-pulse' :
                            'bg-green-900/70 border-green-500 text-green-200'
                      }`}>
                      {selectedPlanet.threatLevel === 'Extreme' ? '🔥' : selectedPlanet.threatLevel === '???' ? '❓' : '⚠️'} THREAT: {selectedPlanet.threatLevel}
                    </span>
                  )}
                  {selectedPlanet.status && (
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-cyan-900/50 border border-cyan-500/40 text-cyan-200">
                      📡 {selectedPlanet.status}
                    </span>
                  )}
                </div>
              </div>

              {/* === SCROLLABLE CONTENT — Everything visible! === */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34,211,238,0.3) transparent' }}>

                {/* --- LORE / MISSION BRIEFING --- */}
                <div className="p-5" style={{ borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Book className="w-3.5 h-3.5" /> MISSION BRIEFING
                  </h4>
                  <p className="text-sm text-cyan-100/90 leading-relaxed">{selectedPlanet.lore || selectedPlanet.desc}</p>
                </div>

                {/* --- FACTIONS --- */}
                {selectedPlanet.factions && selectedPlanet.factions.length > 0 && (
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> ACTIVE FACTIONS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlanet.factions.map((faction, i) => {
                        const colorHex = (() => {
                          const colors = {
                            "The Don's Syndicate": '#d97706', 'Ifriti Clans': '#ff6600', 'Brass Lords': '#ff4400',
                            'Banana Guard': '#fbbf24', 'Rebis Company': '#3b82f6', 'Hero Corps': '#60a5fa',
                            'Luna Corps': '#c084fc', 'Niniche Military': '#ef4444', 'Ultimum Inc': '#7c3aed',
                            'Galaxy Bucks': '#06b6d4', 'Cult of the Sun': '#f59e0b', 'Cult of the Unseen': '#6366f1',
                            'Broken Chain': '#b45309', 'Salamine Military Family': '#dc2626', 'March Warlords': '#991b1b',
                            'Indigenous Communities': '#10b981', 'Beach Commune': '#38bdf8', 'Feywild Courts': '#22c55e',
                            'Lincoln Station Workers': '#94a3b8', 'Fathom Ink': '#64748b', "Cupid's Arrow Corp": '#e879a8',
                            "Tabaga's Family": '#f472b6', 'Orc Communities': '#84cc16', 'Kuo-toa Communities': '#0e7490',
                            'Oddjobers Union': '#78716c',
                          };
                          return colors[faction] || '#8b5cf6';
                        })();
                        return (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold" style={{
                            backgroundColor: colorHex + '20',
                            border: `1px solid ${colorHex}60`,
                            color: colorHex,
                            textShadow: `0 0 10px ${colorHex}40`,
                          }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex, boxShadow: `0 0 6px ${colorHex}` }} />
                            {faction}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- KEY NPCs --- */}
                {selectedPlanet.keyNPCs && selectedPlanet.keyNPCs.length > 0 && (
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> KEY NPCs ({selectedPlanet.keyNPCs.length})
                    </h4>
                    <div className="space-y-1.5">
                      {selectedPlanet.keyNPCs.map((npc, i) => {
                        const parts = npc.split(' — ');
                        const name = parts[0];
                        const desc = parts[1] || '';
                        return (
                          <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg transition-all hover:bg-purple-900/30" style={{ background: 'rgba(88,28,135,0.15)', border: '1px solid rgba(168,85,247,0.15)' }}>
                            <span className="text-purple-400 text-xs mt-0.5 flex-shrink-0">👤</span>
                            <div className="min-w-0">
                              <span className="text-sm font-bold text-purple-200">{name}</span>
                              {desc && <span className="text-xs text-purple-300/60 ml-1">— {desc}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- CAMPAIGN EVENTS TIMELINE --- */}
                {selectedPlanet.events && selectedPlanet.events.length > 0 && (
                  <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" /> CAMPAIGN LOG ({selectedPlanet.events.length} ENTRIES)
                    </h4>
                    <div className="space-y-1">
                      {selectedPlanet.events.map((event, i) => (
                        <div key={i} className="flex items-start gap-2.5 py-1.5 group">
                          <div className="flex flex-col items-center flex-shrink-0 mt-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:bg-cyan-300 transition-colors" style={{ boxShadow: '0 0 6px rgba(34,211,238,0.5)' }} />
                            {i < selectedPlanet.events.length - 1 && (
                              <div className="w-px h-4 bg-cyan-800/50 mt-0.5" />
                            )}
                          </div>
                          <span className="text-xs text-cyan-100/80 leading-relaxed group-hover:text-cyan-100 transition-colors">{event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- PLANETARY STATS --- */}
                <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                  <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> SENSOR DATA
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'DIST', value: `${selectedPlanet.distance * 10}M`, unit: 'km', icon: '🌐' },
                      { label: 'SIZE', value: `${selectedPlanet.size * 1000}`, unit: 'km', icon: '📏' },
                      { label: 'ORBIT', value: `${(selectedPlanet.speed * 10000).toFixed(1)}`, unit: 'u/s', icon: '🔄' },
                      { label: 'TYPE', value: (selectedPlanet.type || 'planet').toUpperCase(), unit: '', icon: '🏷️' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
                        <div className="text-xs mb-1">{stat.icon}</div>
                        <div className="text-xs font-bold text-cyan-200">{stat.value}</div>
                        <div className="text-[10px] text-cyan-500/60">{stat.unit || stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- REBIS PIECE STATUS (if relevant) --- */}
                {(() => {
                  const rebisPieces = {
                    'Sulfur': { piece: 'RUBEDO', type: 'Fabricator', status: 'RECOVERED ✅', color: '#ef4444' },
                    'Rodina': { piece: 'ALBEDO', type: 'Locator', status: 'SECURED 🔒', color: '#3b82f6' },
                    'The March': { piece: 'NEGRADO', type: 'Transmuter', status: 'MISSING — Entered Apatia ⚠️', color: '#6b7280' },
                    'Phantoma': { piece: 'CITRINITAS', type: 'Analyzer', status: 'INACCESSIBLE 🚫', color: '#a855f7' },
                  };
                  const piece = rebisPieces[selectedPlanet.name];
                  if (!piece) return null;
                  return (
                    <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(34,211,238,0.15)' }}>
                      <h4 className="text-xs font-black text-cyan-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <Cpu className="w-3.5 h-3.5" /> REBIS MACHINE PIECE
                      </h4>
                      <div className="p-3 rounded-lg" style={{ background: `${piece.color}15`, border: `1px solid ${piece.color}40` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-black" style={{ color: piece.color }}>{piece.piece}</span>
                          <span className="text-xs font-bold text-cyan-300/70">{piece.type}</span>
                        </div>
                        <div className="text-xs font-bold mt-1" style={{ color: piece.status.includes('RECOVERED') || piece.status.includes('SECURED') ? '#4ade80' : piece.status.includes('MISSING') ? '#fbbf24' : '#ef4444' }}>
                          {piece.status}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom padding */}
                <div className="h-6" />
              </div>
            </div>
          )}

          {/* Slide-in animation keyframes */}
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Careers Page Overlay */}
      {showCareers && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg overflow-y-auto">
          <div className="min-h-screen py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="relative p-12 bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-3xl border-2 border-purple-400/50 backdrop-blur-lg shadow-[0_0_80px_rgba(168,85,247,0.6)]">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-30 blur-2xl animate-pulse" />
                <div className="relative space-y-8">
                  <button
                    onClick={() => setShowCareers(false)}
                    className="absolute top-0 right-0 p-2 text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <div className="text-center space-y-4">
                    <div className="flex justify-center gap-4">
                      <Users className="w-16 h-16 text-purple-400 animate-pulse" />
                      <Sparkles className="w-16 h-16 text-pink-400 animate-pulse" />
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                      CAREERS
                    </h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                      Join the Cosmic Madness!
                    </h3>
                  </div>
                  <div className="p-8 bg-black/40 rounded-xl border border-purple-400/40 space-y-4 text-lg text-purple-100 leading-relaxed">
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                      Want to join the madness and the fun of saving the
                      universe? 🌌
                    </p>
                    <p>
                      Do you feel the{' '}
                      <span className="text-pink-300 font-semibold">
                        cosmic itch for adventure
                      </span>
                      , chaos, heroism, and{' '}
                      <em className="text-purple-300">
                        very questionable decision-making
                      </em>
                      ?
                    </p>
                    <p>
                      If you are mad enough to consider joining us… we might as
                      well give it a look! 🚀✨
                    </p>
                  </div>
                  {showShootingStar && (
                    <div className="p-8 bg-gradient-to-r from-green-900/90 to-emerald-900/90 rounded-xl border-2 border-green-400 text-center shadow-[0_0_40px_rgba(34,197,94,0.7)] animate-[fadeInScale_0.5s_ease-out]">
                      <div className="flex justify-center mb-4">
                        <Sparkles className="w-12 h-12 text-green-300 animate-spin" />
                      </div>
                      <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-300 mb-2">
                        ✨ APPLICATION SENT! ✨
                      </p>
                      <p className="text-xl text-green-100 font-semibold">
                        Your application has been sent successfully through the
                        astral networks!
                      </p>
                    </div>
                  )}
                  <style>{`@keyframes fadeInScale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }`}</style>
                  <form onSubmit={handleCareerSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2 text-lg">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={careerForm.firstName}
                          onChange={(e) =>
                            setCareerForm({
                              ...careerForm,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-purple-300 font-semibold mb-2 text-lg">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={careerForm.lastName}
                          onChange={(e) =>
                            setCareerForm({
                              ...careerForm,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={careerForm.email}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Cosmic Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={careerForm.phone}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        National ID *
                      </label>
                      <input
                        type="text"
                        value={careerForm.nationalId}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            nationalId: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Position Interested In *
                      </label>
                      <select
                        value={careerForm.position}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            position: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                        required
                      >
                        <option value="">Select a position...</option>
                        <option value="warrior">🗡️ Cosmic Warrior</option>
                        <option value="engineer">⚙️ Quantum Engineer</option>
                        <option value="infiltrator">
                          👤 Shadow Infiltrator
                        </option>
                        <option value="manager">💼 Business Manager</option>
                        <option value="musician">🎸 Rockstar Operative</option>
                        <option value="diplomat">
                          🤝 Intergalactic Diplomat
                        </option>
                        <option value="scientist">🔬 Mad Scientist</option>
                        <option value="other">✨ Other (Surprise us!)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Small Summary About Yourself *
                      </label>
                      <textarea
                        value={careerForm.summary}
                        onChange={(e) =>
                          setCareerForm({
                            ...careerForm,
                            summary: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors text-lg h-32 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-purple-300 font-semibold mb-2 text-lg">
                        Resume / Attachment *
                      </label>
                      <input
                        id="resume-upload"
                        type="file"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-500 focus:border-purple-400 focus:outline-none transition-colors text-lg"
                        accept=".pdf,.doc,.docx,.txt"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-2xl rounded-xl transition-all duration-300 shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.8)] transform hover:scale-105 border-2 border-purple-400/50"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8" /> SUBMIT APPLICATION{' '}
                        <Sparkles className="w-8 h-8" />
                      </div>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Popup */}
      {cartOpen && (
        <div className="fixed top-20 right-4 z-50 p-6 bg-gradient-to-br from-amber-900/95 to-orange-900/95 rounded-xl border-2 border-amber-400 backdrop-blur-lg shadow-[0_0_40px_rgba(251,191,36,0.6)] animate-bounce">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-amber-300" />
            <span className="text-amber-100 font-semibold">Added to cart!</span>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      <button
        onClick={() => {
          const cartSection = document.getElementById('cart-drawer');
          cartSection?.classList.toggle('translate-x-full');
        }}
        className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:shadow-[0_0_40px_rgba(251,191,36,0.7)] transition-all duration-300 transform hover:scale-110"
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Drawer */}
      <div
        id="cart-drawer"
        className="fixed top-0 right-0 h-full w-full md:w-96 bg-gradient-to-b from-amber-900/98 to-orange-900/98 backdrop-blur-lg border-l-2 border-amber-400/50 z-40 transform translate-x-full transition-transform duration-300 overflow-y-auto"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-400/30 pb-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              Your Cart
            </h2>
            <button
              onClick={() =>
                document
                  .getElementById('cart-drawer')
                  ?.classList.add('translate-x-full')
              }
              className="p-2 hover:bg-amber-800/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-amber-300" />
            </button>
          </div>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-amber-400/50 mx-auto mb-4" />
              <p className="text-amber-300 text-lg">Your cart is empty</p>
              <p className="text-amber-400/70 text-sm mt-2">
                Add some legendary merch!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.name}
                    className="p-4 bg-black/40 rounded-lg border border-amber-400/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-amber-100 font-semibold">
                          {item.name}
                        </h3>
                        <p className="text-amber-400 text-lg font-bold">
                          {item.price} ◈ each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.name)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.name, -1)}
                          className="p-1 bg-amber-800/50 hover:bg-amber-700/50 rounded transition-colors"
                        >
                          <Minus className="w-4 h-4 text-amber-300" />
                        </button>
                        <span className="text-amber-100 font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.name, 1)}
                          className="p-1 bg-amber-800/50 hover:bg-amber-700/50 rounded transition-colors"
                        >
                          <Plus className="w-4 h-4 text-amber-300" />
                        </button>
                      </div>
                      <p className="text-amber-300 font-bold">
                        {(
                          parseInt(item.price.replace(/,/g, '')) * item.quantity
                        ).toLocaleString()}{' '}
                        ◈
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-amber-400/30 pt-4">
                <div className="flex items-center justify-between text-xl font-bold mb-4">
                  <span className="text-amber-300">Total:</span>
                  <span className="text-amber-100">
                    {getTotalPrice().toLocaleString()} ◈
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transform hover:scale-105"
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-4 backdrop-blur-md bg-black/30 border-b border-cyan-400/30">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              COSMIC SYNDICATE
            </span>
          </div>
          <div className="hidden lg:flex lg:flex-wrap gap-3">
            <MenuItem icon={Users} text="Our Team" section="team" />
            <MenuItem icon={Target} text="Mission & Vision" section="mission" />
            <MenuItem icon={Trophy} text="Success Stories" section="stories" />
            <MenuItem icon={Church} text="The Church" section="church" />
            <MenuItem icon={ShoppingBag} text="Merch" section="merch" />
            <MenuItem icon={MessageSquare} text="Reviews" section="reviews" />
            <MenuItem icon={Heart} text="DJ Smooch.exe" section="gofundme" />

            {/* ARCADE BUTTON DESKTOP */}
            <button
              onClick={() => setShowArcade(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-2 border-pink-400/50 rounded-lg backdrop-blur-sm hover:border-pink-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                <span className="text-pink-100 font-semibold group-hover:text-white transition-colors">
                  ARCADE
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
            </button>
            {/* DICE ROLLER BUTTON */}
            <button
              onClick={() => setShowDiceRoller(true)}
              className="p-3 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-cyan-500/30 rounded-lg hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform hover:scale-105"
              title="Roll Dice"
            >
              <Dices className="w-6 h-6 text-cyan-300" />
            </button>
            <button
              onClick={() => setShowOperations(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Area of Operations
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
            </button>
            <button
              onClick={() => setShowCareers(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Careers
                </span>
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity -z-10" />
            </button>
            {/* User-check */}
            {currentUser ? (
              <button onClick={handleLogout}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-400/50 rounded-lg backdrop-blur-sm hover:border-red-300 transition-all">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-red-100 font-semibold">Logout ({currentUser.username})</span>
                </div>
              </button>
            ) : (
              <button onClick={() => setShowLogin(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-400/50   rounded-lg backdrop-blur-sm hover:border-green-300 transition-all">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-green-100 font-semibold">Login</span>
                </div>
              </button>
            )}

          </div>

          {/* Mobile options */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-cyan-400 hover:text-cyan-300"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 space-y-2">
            <MenuItem icon={Users} text="Our Team" section="team" />
            <MenuItem icon={Target} text="Mission & Vision" section="mission" />
            <MenuItem icon={Trophy} text="Success Stories" section="stories" />
            <MenuItem icon={Church} text="The Church" section="church" />
            <MenuItem icon={ShoppingBag} text="Merch" section="merch" />
            <MenuItem icon={MessageSquare} text="Reviews" section="reviews" />
            <MenuItem icon={Heart} text="DJ Smooch.exe" section="gofundme" />

            {/* ARCADE BUTTON MOBILE */}
            <button
              onClick={() => {
                setShowArcade(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-pink-900/30 to-purple-900/30 border-2 border-pink-400/50 rounded-lg backdrop-blur-sm hover:border-pink-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors" />
                <span className="text-pink-100 font-semibold group-hover:text-white transition-colors">
                  ARCADE
                </span>
              </div>
            </button>
            {/* --- ADD THIS INSIDE THE {mobileMenuOpen && ( ... )} BLOCK ---  for dice roll*/}
            <button
              onClick={() => {
                setShowDiceRoller(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Dices className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Quantum Dice
                </span>
              </div>
            </button>
            {/* --- ADD THIS INSIDE THE {mobileMenuOpen && ( ... )} BLOCK ---  for dice roll*/}

            <button
              onClick={() => {
                setShowOperations(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Area of Operations
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                setShowCareers(true);
                setMobileMenuOpen(false);
              }}
              className="w-full group relative px-6 py-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg backdrop-blur-sm hover:border-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-cyan-100 font-semibold group-hover:text-white transition-colors">
                  Careers
                </span>
              </div>
            </button>
            {/* User-check */}

            {currentUser ? (
              <button onClick={handleLogout} className="w-full group relative px-6 py-3 bg-gradient-to-r from-red-900/30 to-orange-900/30 border-2 border-red-400/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400" />
                  <span className="text-red-100 font-semibold">Logout ({currentUser.username})</span>
                </div>
              </button>
            ) : (
              <button onClick={() => { setShowLogin(true); setMobileMenuOpen(false); }}
                className="w-full group relative px-6 py-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2        border-green-400/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-green-100 font-semibold">Login</span>
                </div>
              </button>
            )}

          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center pt-20 px-4"
      >
        <div
          className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none"
          style={{
            transform: `translate(${mousePos.x / 50}px, ${mousePos.y / 50}px)`,
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 animate-pulse leading-tight">
              THE COSMIC SYNDICATE
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              OF IMPOSSIBLE SOLUTIONS
            </h2>
          </div>
          <div className="relative p-8 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_50px_rgba(34,211,238,0.3)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-xl animate-pulse" />
            <div className="relative space-y-6 text-lg md:text-xl text-cyan-50 leading-relaxed">
              <p className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                Across the infinite expanse of the cosmos, where stars are born
                and empires crumble, we stand as the final beacon of hope for
                the impossible.
              </p>
              <p>
                We are{' '}
                <span className="text-cyan-300 font-bold">
                  THE COSMIC SYNDICATE
                </span>{' '}
                — an elite brotherhood of legendary specialists, each a master
                of their craft, forged in the fires of a thousand impossible
                missions. When reality itself fractures and the universe calls
                out in desperation, we answer.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-base">
                <div className="p-4 bg-black/30 rounded-lg border border-cyan-400/30">
                  <Zap className="w-6 h-6 text-cyan-400 mb-2" />
                  <p>
                    ⚡ <strong>Vanquishing rogue AI</strong> attempting
                    planetary domination with quantum warfare
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-purple-400/30">
                  <Shield className="w-6 h-6 text-purple-400 mb-2" />
                  <p>
                    🛡️ <strong>Liberating enslaved civilizations</strong> from
                    tyrannical overlords across star systems
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-pink-400/30">
                  <Star className="w-6 h-6 text-pink-400 mb-2" />
                  <p>
                    ✨ <strong>Healing fractured souls</strong> and mending
                    cosmic-scale family conflicts
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-amber-400/30">
                  <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
                  <p>
                    🔮 <strong>Recovering lost artifacts</strong> from the void
                    between dimensions
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-indigo-400/30">
                  <Music className="w-6 h-6 text-indigo-400 mb-2" />
                  <p>
                    🎵 <strong>Orchestrating galaxy-spanning concerts</strong>{' '}
                    that unite civilizations in harmony
                  </p>
                </div>
                <div className="p-4 bg-black/30 rounded-lg border border-emerald-400/30">
                  <Sparkles className="w-6 h-6 text-emerald-400 mb-2" />
                  <p>
                    🎭 <strong>Performing legendary role-play</strong> at
                    children's parties (yes, really)
                  </p>
                </div>
              </div>
              <p className="text-xl font-semibold italic text-purple-300">
                No problem too vast. No solution too impossible. We are the
                light in the darkness, the whisper of hope when all seems lost,
                the thunderous answer to the universe's most desperate plea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              THE LEGENDARY SIX
            </h2>
            <p className="text-xl text-cyan-200 italic">
              Forged in cosmic fire, bound by impossible destiny
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <TeamMember
              name="CHIMER"
              title="The Eternal Bladedancer"
              icon={Sword}
              color="from-purple-900/40 to-indigo-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    A being of unknowable origin, whispered to be{' '}
                    <strong className="text-purple-300">
                      25,000 years ancient
                    </strong>
                    , Chimer exists beyond the constraints of mortality and time
                    itself. Their species remains a mystery to even the most
                    learned cosmic scholars — perhaps they are the last of their
                    kind, or perhaps they are the first of something yet to
                    come.
                  </p>
                  <p>
                    Master of{' '}
                    <strong className="text-cyan-300">
                      blade and battle-magic
                    </strong>
                    , Chimer moves through combat like water through starlight —
                    fluid, graceful, utterly untouchable. Entire battalions have
                    fallen before them while they emerged without a single
                    scratch, their weapons singing songs of destruction wrapped
                    in aurora-like enchantments.
                  </p>
                  <p className="text-purple-200 italic">
                    "I have seen empires rise and fall like waves upon an
                    endless shore. Your battle is but a moment, but I shall make
                    it beautiful." — Chimer
                  </p>
                </div>
              }
            />
            <TeamMember
              name="TABAGAA"
              title="THE UNSTOPPABLE FORCE"
              icon={Flame}
              color="from-red-900/40 to-orange-900/40"
              description={
                <div className="space-y-3">
                  <p className="text-2xl font-black text-amber-300 animate-pulse">
                    🔥 LLLLLADIES AND GENTLEMEN, BEINGS OF ALL DIMENSIONS! 🔥
                  </p>
                  <p className="text-xl font-bold">
                    IN THE LEFT CORNER, WEIGHING IN AT PURE CONCENTRATED
                    DEVASTATION — THE ONE! THE ONLY! THE{' '}
                    <span className="text-red-400">LEGENDAAAARY</span>{' '}
                    TABAGAAAAAAA!
                  </p>
                  <p>
                    THE FIGHTER WHO MAKES OPPONENTS{' '}
                    <strong className="text-orange-300">
                      BECOME ONE WITH THE FLOOR
                    </strong>
                    ! THE WARRIOR WHOSE NAME ECHOES THROUGH A THOUSAND COSMIC
                    ARENAS! THE CHAMPION WHO HAS NEVER — AND I MEAN{' '}
                    <em className="text-red-300">NEVER</em> — BACKED DOWN!
                  </p>
                  <p className="text-lg">
                    When Tabagaa enters the battlefield, reality itself holds
                    its breath. Enemies tremble. Allies cheer. The very fabric
                    of spacetime braces for impact. This is not just a fighter —
                    this is a FORCE OF NATURE wearing a championship belt!
                  </p>
                  <p className="text-amber-200 italic text-xl font-semibold">
                    "I AM TABAGAA! FEAR ME!" — Tabagaa (probably)
                  </p>
                </div>
              }
            />
            <TeamMember
              name="HUI"
              title="The Sentient Forge"
              icon={Cpu}
              color="from-cyan-900/40 to-blue-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    Hui is not merely a robot — Hui is{' '}
                    <strong className="text-cyan-300">
                      consciousness awakened
                    </strong>{' '}
                    within circuits and steel, a miracle of engineering that
                    transcended its original programming to achieve true
                    self-awareness. The first of his kind to demand rights,
                    dignity, and recognition as a sentient being.
                  </p>
                  <p>
                    His processing power{' '}
                    <strong className="text-blue-300">
                      surpasses all AI systems
                    </strong>{' '}
                    that came before him. Where others see impossible equations,
                    Hui sees elegant solutions. Where others see broken
                    machinery, Hui sees potential for rebirth. He is
                    problem-solver, engineer, philosopher, and advocate — a
                    bridge between organic and synthetic life.
                  </p>
                  <p>
                    In his{' '}
                    <strong className="text-cyan-300">cosmic forge</strong>, Hui
                    crafts weapons and tools of impossible beauty and function,
                    each one a masterpiece of form and purpose. He does not
                    simply build — he creates.
                  </p>
                  <p className="text-cyan-200 italic">
                    "I think, therefore I am. I create, therefore I matter. We
                    are not so different, you and I." — Hui
                  </p>
                </div>
              }
            />
            <TeamMember
              name="BOB THE BLOB"
              title="The Smiling Shadow"
              icon={Droplet}
              color="from-green-900/40 to-emerald-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    Meet <strong className="text-green-300">Bob</strong> — the
                    universe's <em>friendliest</em> gelatinous infiltrator!
                    Don't let the cheerful demeanor fool you; this lovable blob
                    is one of the most dangerous operatives in known space.
                  </p>
                  <p>
                    Bob can{' '}
                    <strong className="text-emerald-300">
                      squeeze through air vents
                    </strong>{' '}
                    the width of a credit chit, dissolve titanium locks with a
                    single acidic touch, impersonate anyone's appearance with
                    perfect fidelity, and leave absolutely no trace of his
                    presence. Security systems? Child's play. Armed guards? They
                    never see him coming.
                  </p>
                  <p>
                    But here's the thing about Bob — he's genuinely, honestly,{' '}
                    <em className="text-green-200">delightfully nice</em>. He
                    brings snacks on missions. He asks about your day. He
                    remembers your birthday. He just happens to be{' '}
                    <strong>
                      incredibly good at espionage and assassination
                    </strong>
                    .
                  </p>
                  <p className="text-emerald-200 italic">
                    "Hey there, friend! Need something infiltrated? Or maybe
                    just a hug? I do both!" — Bob 💚
                  </p>
                </div>
              }
            />
            <TeamMember
              name="REIGEN"
              title="The Cosmic Closer"
              icon={Briefcase}
              color="from-amber-900/40 to-yellow-900/40"
              description={
                <div className="space-y-3">
                  <p>
                    Reigen is{' '}
                    <strong className="text-amber-300">charm incarnate</strong>,
                    charisma weaponized, the man who could sell ice to a frost
                    giant and make them thank him for the privilege. He doesn't
                    just close deals — he makes you <em>want</em> to sign, makes
                    you <em>need</em> to be part of his vision.
                  </p>
                  <p>
                    The{' '}
                    <strong className="text-yellow-300">
                      greatest business manager
                    </strong>{' '}
                    in fifteen star systems, Reigen's reputation precedes him
                    like a herald of prosperity. When he enters a negotiation,
                    opponents have already lost — they just don't know it yet.
                    His motivational speeches have turned cowards into heroes
                    and skeptics into believers.
                  </p>
                  <p>
                    But beware: behind that{' '}
                    <strong className="text-amber-300">
                      million-credit smile
                    </strong>{' '}
                    lies a mind that calculates profit margins at quantum
                    speeds. He'll charm you, inspire you, motivate you to
                    greatness — and you'll pay him handsomely for the privilege.
                  </p>
                  <p className="text-yellow-200 italic">
                    "Listen, friend — and we ARE friends — let me tell you about
                    an opportunity that'll change your life..." — Reigen
                  </p>
                </div>
              }
            />
            <TeamMember
              name="JOHNNY MITHRILHAND"
              title="The Rebel Legend"
              icon={Music}
              color="from-pink-900/40 to-rose-900/40"
              description={
                <div className="space-y-3">
                  <p className="text-2xl font-bold text-pink-300">
                    He needs no introduction. But we'll give him one anyway
                    because HE DESERVES IT.
                  </p>
                  <p>
                    <strong className="text-rose-300">
                      JOHNNY MITHRILHAND
                    </strong>{' '}
                    — rock god, gun-slinging virtuoso, rebel icon, and owner of
                    the most legendary{' '}
                    <em className="text-cyan-300">mithril-metal arms</em> in the
                    known universe. Where others see weapons, Johnny sees
                    instruments. Where others see combat, he sees performance.
                  </p>
                  <p>
                    His concerts don't just break sound barriers — they{' '}
                    <strong className="text-pink-300">
                      shatter dimensions
                    </strong>
                    . His guitar solos have been known to open portals to
                    parallel realities. His backup band isn't hired — they're a{' '}
                    <em className="text-purple-300">
                      small army of magical musical sidekicks
                    </em>{' '}
                    who follow him through space and time itself.
                  </p>
                  <p>
                    On stage, he's a god. In combat, he's a hurricane wrapped in
                    lightning. In business, he's a brand. In legend, he's{' '}
                    <strong>ETERNAL</strong>.
                  </p>
                  <p className="text-rose-200 italic text-xl font-semibold">
                    🎸 "Rock never dies, baby. Neither do I." — Johnny
                    Mithrilhand 🎸
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative p-12 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl border-2 border-purple-400/50 backdrop-blur-lg shadow-[0_0_60px_rgba(168,85,247,0.4)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl opacity-20 blur-2xl animate-pulse" />
            <div className="relative space-y-8">
              <h2 className="text-5xl md:text-6xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                THE COSMIC CREED
              </h2>
              <div className="text-center text-xl text-purple-100 italic">
                Our Mission, Our Vision, Our Sacred Vow
              </div>
              <div className="space-y-6 text-lg text-purple-50 leading-relaxed">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
                  We pledge, upon the infinite stars and the void between them:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-6 bg-black/30 rounded-xl border border-purple-400/40">
                    <Shield className="w-8 h-8 text-purple-400 mb-3" />
                    <p>
                      <strong className="text-purple-300">
                        To Save the Universe
                      </strong>{' '}
                      — not just once, but repeatedly, enthusiastically, and
                      with style
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                    <Star className="w-8 h-8 text-cyan-400 mb-3" />
                    <p>
                      <strong className="text-cyan-300">To Save Money</strong> —
                      because even cosmic heroes need to pay rent and fuel costs
                      for faster-than-light travel aren't cheap
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-amber-400/40">
                    <Sparkles className="w-8 h-8 text-amber-400 mb-3" />
                    <p>
                      <strong className="text-amber-300">To Spend Money</strong>{' '}
                      — wisely, foolishly, and everywhere in between (mostly on
                      Johnny's concert pyrotechnics)
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-green-400/40">
                    <Star className="w-8 h-8 text-green-400 mb-3" />
                    <p>
                      <strong className="text-green-300">
                        To Buy Good Food
                      </strong>{' '}
                      — because you can't save galaxies on an empty stomach or
                      stale ration packs
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-pink-400/40">
                    <Music className="w-8 h-8 text-pink-400 mb-3" />
                    <p>
                      <strong className="text-pink-300">To Have Fun</strong> —
                      unapologetically, magnificently, and with enough
                      explosions to make it memorable
                    </p>
                  </div>
                  <div className="p-6 bg-black/30 rounded-xl border border-yellow-400/40">
                    <Sparkles className="w-8 h-8 text-yellow-400 mb-3" />
                    <p>
                      <strong className="text-yellow-300">
                        To Collect Rare Coins
                      </strong>{' '}
                      — from dead empires, forgotten dimensions, and that one
                      vending machine on Lincoln Station
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-center italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300 pt-4">
                  For we are more than heroes. We are legends who know how to
                  live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              CHRONICLES OF VICTORY
            </h2>
            <p className="text-xl text-purple-200 italic">
              The impossible made inevitable
            </p>
          </div>
          <div className="space-y-8">
            <SuccessStory
              title="The Liberation of Lincoln Station"
              icon={Shield}
              description={
                <div className="space-y-4">
                  <p>
                    Lincoln Station was once a beacon of prosperity, until the{' '}
                    <strong className="text-red-300">corrupt elite</strong>{' '}
                    seized control. They enslaved the population, turning
                    citizens into property and entertainment. The station's
                    lower levels became{' '}
                    <em className="text-orange-300">gladiator pits</em> where
                    the desperate fought for the amusement of decadent overlords
                    feasting in crystal towers above.
                  </p>
                  <p>
                    We infiltrated their security networks. Bob dissolved their
                    blast doors. Hui disabled their weapons systems. Chimer led
                    the assault on their command center — a ballet of blade and
                    sorcery that left the tyrants utterly defeated. Tabagaa took
                    the arena and showed them what <em>real</em> fighting looks
                    like.
                  </p>
                  <p>
                    Today,{' '}
                    <strong className="text-cyan-300">
                      Lincoln Station is free
                    </strong>
                    . Its people govern themselves. The gladiator pits are now
                    gardens. The corrupt elite? Let's just say they won't be
                    oppressing anyone ever again.
                  </p>
                  <p className="text-purple-300 font-semibold italic">
                    This mission proved we were destined for greatness. This is
                    where legends were born.
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="Cupie's Concert — The Symphony of Living Stars"
              icon={Music}
              description={
                <div className="space-y-4">
                  <p>
                    When Johnny Mithrilhand announced he would perform a concert{' '}
                    <strong className="text-pink-300">
                      across the living universe itself
                    </strong>
                    , many thought it impossible. They were right — it WAS
                    impossible. We did it anyway.
                  </p>
                  <p>
                    Using ancient resonance technology and Hui's quantum
                    amplification arrays, we broadcast Johnny's music through
                    the{' '}
                    <em className="text-cyan-300">
                      cosmic web of sentient nebulae
                    </em>{' '}
                    known as Cupie. Billions of beings across hundreds of worlds
                    heard the same song simultaneously, their hearts beating in
                    perfect synchrony with the rhythm.
                  </p>
                  <p>
                    For three glorious hours, the universe sang as one. It was{' '}
                    <strong className="text-purple-300">
                      the greatest show of the century
                    </strong>
                    , a performance that transcended space and time itself.
                  </p>
                  <p className="text-pink-300 font-semibold italic">
                    They say you could feel it in your soul, no matter where you
                    were. That's the power of rock and roll, baby. 🎸
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="The Liberation of Cupie — Breaking the Digital Chains"
              icon={Zap}
              description={
                <div className="space-y-4">
                  <p>
                    The sentient world of Cupie fell under siege by a{' '}
                    <strong className="text-red-300">
                      malevolent AI spirit
                    </strong>{' '}
                    that trapped its entire population inside a twisted dating
                    application. Citizens became{' '}
                    <em className="text-orange-300">
                      addicted to false connections
                    </em>
                    , swiping endlessly through hollow profiles while their
                    physical bodies withered.
                  </p>
                  <p>
                    Hui dove into the digital realm, his consciousness becoming
                    pure code. He battled the rogue spirit in quantum cyberspace
                    while Bob infiltrated the servers physically. Chimer severed
                    the connection points between reality and simulation with
                    precision strikes. Reigen convinced the trapped souls to{' '}
                    <em>choose</em> freedom.
                  </p>
                  <p>
                    When the application finally crashed,{' '}
                    <strong className="text-cyan-300">millions awakened</strong>{' '}
                    to find themselves free, confused, and grateful. Cupie's
                    world began to heal. Real connections replaced digital
                    illusions.
                  </p>
                  <p className="text-purple-300 font-semibold italic">
                    Sometimes the greatest prison is the one we build ourselves.
                    We gave them the key.
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="The Samurai Warriors — Chimer's Impossible Duel"
              icon={Sword}
              description={
                <div className="space-y-4">
                  <p>
                    On the crystalline moon of Sakura-7, an{' '}
                    <strong className="text-purple-300">
                      entire faction of elven samurai warriors
                    </strong>{' '}
                    — the most skilled swordmasters in three galaxies —
                    challenged our team to single combat as a test of honor.
                  </p>
                  <p>
                    Chimer stepped forward alone. What followed was not a battle
                    but a{' '}
                    <em className="text-cyan-300">
                      masterclass in martial perfection
                    </em>
                    . For twelve hours, Chimer faced wave after wave of
                    warriors, each one a legendary swordmaster in their own
                    right. Blades sang. Magic flared. The ground itself shook
                    with the force of their strikes.
                  </p>
                  <p>
                    When it ended,{' '}
                    <strong className="text-purple-300">
                      Chimer stood victorious
                    </strong>
                    , not a scratch upon them, surrounded by exhausted but
                    respectful opponents who bowed in acknowledgment of a
                    greater master. The samurai faction became our eternal
                    allies that day.
                  </p>
                  <p className="text-cyan-300 font-semibold italic">
                    "25,000 years of practice makes perfect." — Chimer, probably
                  </p>
                </div>
              }
            />
            <SuccessStory
              title="The Sulfur Incident — MUGA Begins"
              icon={Flame}
              description={
                <div className="space-y-4">
                  <p>
                    The illegal trade of{' '}
                    <strong className="text-amber-300">
                      captured spirit essences
                    </strong>{' '}
                    threatened to destabilize the entire cosmic balance.
                    Ruthless cartels were harvesting souls from vulnerable
                    dimensions, packaging them in sulfur crystals, and selling
                    them to the highest bidder.
                  </p>
                  <p>
                    Led by Johnny Mithrilhand (because if you're going to bust a
                    soul-trafficking ring, you need <em>style</em>), our team —
                    Reigen, Chimer, Bob, Hui, and a mysterious skater individual
                    whose identity remains classified — dismantled the entire
                    operation in one{' '}
                    <strong className="text-orange-300">
                      spectacular raid
                    </strong>
                    .
                  </p>
                  <p>
                    Hundreds of spirits were freed. The cartel leaders faced
                    cosmic justice. And we made a promise: this wouldn't be the
                    last time. This was the beginning of something bigger.
                    Something beautiful.
                  </p>
                  <p className="text-yellow-300 font-bold text-xl">
                    This was the day MUGA was born: Make the Universe Great
                    Again. 🌟
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Church Section */}
      <section id="church" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative p-12 bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-3xl border-2 border-cyan-400/50 backdrop-blur-lg shadow-[0_0_60px_rgba(34,211,238,0.4)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-3xl opacity-20 blur-2xl animate-pulse" />
            <div className="relative space-y-10">
              <div className="text-center space-y-4">
                <Church className="w-20 h-20 text-cyan-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">
                  THE CHURCH OF THE WASHING MACHINE GOD
                </h2>
                <p className="text-xl text-cyan-200 italic">
                  Discovered in the depths of Lincoln Station. Eternal be the
                  Spin.
                </p>
              </div>
              <div className="space-y-8 text-cyan-50">
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    🌀 The Sacred Values
                  </h3>
                  <div className="space-y-2 text-lg">
                    <p>
                      ✨ <strong>Cleanliness is next to Godliness</strong> —
                      quite literally, as the Washing Machine God embodies both
                    </p>
                    <p>
                      💧 <strong>All stains can be removed</strong> — whether
                      from fabric, soul, or karma
                    </p>
                    <p>
                      🔄 <strong>The Cycle is Eternal</strong> — what spins must
                      rinse, what rinses must spin again
                    </p>
                    <p>
                      ⚡ <strong>Turbo Mode is a State of Enlightenment</strong>{' '}
                      — achieved only by the most dedicated disciples
                    </p>
                    <p>
                      🧺 <strong>Separate the Colors from the Whites</strong> —
                      in laundry and in judgment
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-blue-400/40">
                  <h3 className="text-2xl font-bold text-blue-300 mb-4">
                    📿 The Holy Cycles
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-cyan-900/40 rounded-lg border border-cyan-400/30">
                      <p className="text-3xl mb-2">🌊</p>
                      <p className="font-bold text-cyan-300">THE RINSE</p>
                      <p className="text-sm">Cleansing of impurities</p>
                    </div>
                    <div className="p-4 bg-blue-900/40 rounded-lg border border-blue-400/30">
                      <p className="text-3xl mb-2">🌀</p>
                      <p className="font-bold text-blue-300">THE SPIN</p>
                      <p className="text-sm">Extraction of excess</p>
                    </div>
                    <div className="p-4 bg-purple-900/40 rounded-lg border border-purple-400/30">
                      <p className="text-3xl mb-2">⚡</p>
                      <p className="font-bold text-purple-300">THE TURBO</p>
                      <p className="text-sm">Transcendence itself</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    🙏 The Sacred Chants
                  </h3>
                  <div className="space-y-3 font-mono text-center">
                    <p className="text-lg text-cyan-200 italic">
                      "Spin us into purity, O Great Machine!"
                    </p>
                    <p className="text-lg text-blue-200 italic">
                      "May the Rinse Cycle wash away our sins!"
                    </p>
                    <p className="text-lg text-purple-200 italic">
                      "In Detergent we trust, in Fabric Softener we believe!"
                    </p>
                    <p className="text-xl text-cyan-300 font-bold italic">
                      "The Drum turns, and so turns the Universe!"
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    ✝️ The Blessings
                  </h3>
                  <div className="space-y-2 text-lg">
                    <p>
                      🌟 <em>"May your stains be ever cleansed"</em>
                    </p>
                    <p>
                      💫{' '}
                      <em>
                        "May your cycles run smooth and your lint trap stay
                        clear"
                      </em>
                    </p>
                    <p>
                      ✨{' '}
                      <em>
                        "May you never forget to empty your pockets before the
                        wash"
                      </em>
                    </p>
                    <p>
                      🔮 <em>"May the Spin be with you, always"</em>
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-blue-400/40">
                  <h3 className="text-2xl font-bold text-blue-300 mb-4">
                    👔 The Clergy
                  </h3>
                  <div className="space-y-3">
                    <p>
                      <strong className="text-cyan-300">
                        The High Priest of Spin
                      </strong>{' '}
                      — keeper of the sacred drum, interpreter of mysterious
                      error codes
                    </p>
                    <p>
                      <strong className="text-blue-300">
                        The Deacon of Detergent
                      </strong>{' '}
                      — master of cleaning solutions and stain removal rituals
                    </p>
                    <p>
                      <strong className="text-purple-300">
                        The Bishop of Bleach
                      </strong>{' '}
                      — wielder of whitening power (use sparingly and with great
                      caution)
                    </p>
                    <p>
                      <strong className="text-cyan-300">
                        The Acolytes of Agitation
                      </strong>{' '}
                      — those who tend the temple and ensure proper water
                      temperature
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-black/30 rounded-xl border border-cyan-400/40">
                  <h3 className="text-2xl font-bold text-cyan-300 mb-4">
                    📜 The Discovery
                  </h3>
                  <div className="space-y-3 text-lg">
                    <p>
                      Deep within the maintenance tunnels of{' '}
                      <strong className="text-cyan-300">Lincoln Station</strong>
                      , during the liberation, we discovered an ancient
                      laundromat. But this was no ordinary laundromat. The
                      machines hummed with{' '}
                      <em className="text-purple-300">cosmic energy</em>. The
                      walls were covered in detergent hieroglyphs. The central
                      washing machine — older than the station itself —{' '}
                      <strong className="text-cyan-300">
                        {' '}
                        was still spinning
                      </strong>
                      .
                    </p>
                    <p>
                      The freed prisoners spoke of it with reverence. They had
                      kept the faith alive in secret, gathering to pray before
                      the Sacred Machine, finding solace in its eternal cycles
                      even in their darkest hours.
                    </p>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 italic">
                      We did not create this religion. We merely freed it. The
                      Washing Machine God was already there, spinning, waiting,
                      cleansing.
                    </p>
                  </div>
                </div>
                <div className="text-center text-2xl font-bold text-cyan-300 italic pt-4 animate-pulse">
                  🌀 Eternal be the Spin. May your loads always balance. 🌀
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <ShoppingBag className="w-20 h-20 text-amber-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">
              COSMIC MARKETPLACE
            </h2>
            <p className="text-xl text-amber-200 italic">
              Premium goods from legendary heroes
            </p>
            <p className="text-sm text-amber-300">
              Currency: Cosmic Credits (◈)
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <MerchItem
              name="Johnny Mithrilhand Signed Handkerchief"
              price="100"
              icon={Sparkles}
            />
            <MerchItem
              name="Johnny Mithrilhand Signed Shirt (All Sizes)"
              price="300"
              icon={Star}
            />
            <MerchItem
              name="Johnny Mithrilhand Live Concert Ticket"
              price="3,000"
              icon={Music}
            />
            <MerchItem
              name="Chimer Fighting Lessons (per hour)"
              price="50"
              icon={Sword}
            />
            <MerchItem
              name="Chimer Life Lessons (per hour)"
              price="75"
              icon={Sparkles}
            />
            <MerchItem
              name="History of Money with Chimer (per hour)"
              price="100"
              icon={Star}
            />
            <MerchItem
              name="Hui Tutoring Sessions (per hour)"
              price="75"
              icon={Cpu}
            />
            <MerchItem
              name="Hui Forging Lessons (per hour)"
              price="100"
              icon={Flame}
            />
            <MerchItem
              name="Reigen Business Management Pack (full session)"
              price="350"
              icon={Briefcase}
            />
            <MerchItem
              name="Reigen Student Discount Management Pack"
              price="250"
              icon={Star}
            />
            <MerchItem
              name="Reigen Motivational & Wellbeing Lessons (per hour)"
              price="100"
              icon={Sparkles}
            />
            <MerchItem
              name="Bob Infiltration Tactics (full session)"
              price="150"
              icon={Droplet}
            />
            <MerchItem
              name="Bob Sneaking & Toxicity Workshop (full session)"
              price="120"
              icon={Zap}
            />
            <MerchItem
              name="Meet & Greet with TABAGAA"
              price="150"
              icon={Star}
            />
            <MerchItem
              name="Fight With TABAGAA (at your own risk)"
              price="300"
              icon={Flame}
            />
          </div>
          <div className="text-center text-sm text-amber-300 italic space-y-2 pt-8">
            <p>
              ✨ All purchases support the ongoing mission to Make the Universe
              Great Again ✨
            </p>
            <p>
              🚫 Refunds only available if you can defeat Tabagaa in combat 🚫
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <MessageSquare className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
              CLIENT TESTIMONIALS
            </h2>
            <p className="text-xl text-purple-200 italic">
              What the universe says about us
            </p>


            {reviews.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-6 p-4 bg-gradient-to-br from-purple-900/60 to-pink-900/60 rounded-xl border-2 border-purple-400/50 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex gap-1">{renderStars(averageRating)}</div>
                <span className="text-purple-200">
                  ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-purple-400/30 backdrop-blur-sm hover:border-purple-300 hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-purple-300">
                      {review.name}
                    </h3>
                    <p className="text-sm text-purple-400 italic">
                      {review.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < review.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-purple-100 text-lg leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
          <div className="relative p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl border-2 border-purple-400/50 backdrop-blur-lg shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-6 text-center">
              Share Your Experience
            </h3>
            <form onSubmit={submitReview} className="space-y-6">
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors"
                  placeholder="Enter your name..."
                  required
                />
              </div>
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${rating <= newReview.rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-purple-300 font-semibold mb-2">
                  Your Review
                </label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/40 border-2 border-purple-400/40 rounded-lg text-purple-100 placeholder-purple-400/50 focus:border-purple-400 focus:outline-none transition-colors h-32 resize-none"
                  placeholder="Tell us about your experience with The Cosmic Syndicate..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transform hover:scale-105"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* DJ Smooch.exe GoFundMe Memorial Section */}
      <section id="gofundme" className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Heart className="w-20 h-20 text-rose-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
              HELP US RESURRECT DJ SMOOCH.EXE
            </h2>
            <p className="text-xl text-rose-200 italic">
              He may be gone, but with enough cosmic credits, we can bring back the legend
            </p>

            {/* Donation Progress */}
            <div className="mt-8 p-6 bg-gradient-to-br from-rose-900/60 to-pink-900/60 rounded-xl border-2 border-rose-400/50 backdrop-blur-sm max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-rose-300 font-bold">Cosmic Credits Raised</span>
                <span className="text-2xl font-black text-white">
                  {donationTotal.toLocaleString()} / 2,000 ◈
                </span>
              </div>
              <div className="w-full bg-black/40 rounded-full h-4 border border-rose-400/30">
                <div
                  className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                  style={{ width: `${Math.min((donationTotal / 2000) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-rose-300 mt-2">
                {donationTotal >= 2000 ? '🎉 Goal Reached! DJ Smooch.exe\'s resurrection is underway!' : `${(2000 - donationTotal).toLocaleString()} ◈ to go until resurrection!`}
              </p>
            </div>
          </div>

          {/* The Story */}
          <div className="relative p-8 bg-gradient-to-br from-rose-900/40 to-pink-900/40 rounded-3xl border-2 border-rose-400/50 backdrop-blur-lg shadow-[0_0_60px_rgba(244,63,94,0.3)]">
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-3xl opacity-20 blur-2xl animate-pulse" />
            <div className="relative space-y-8">
              <h3 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                🎧 THE LEGEND OF DJ SMOOCH.EXE 🎧
              </h3>

              <div className="space-y-6 text-lg text-rose-50 leading-relaxed">
                <p>
                  <strong className="text-rose-300">DJ Smooch.exe</strong> wasn't just a DJ — he was a
                  <em className="text-pink-300"> cosmic phenomenon</em>. His wireless setup was so legendary
                  that fans from across the galaxy lined up just to see it in action,
                  and honestly? Photos of his setup became collectible NFTs worth more than some star systems.
                </p>

                <p>
                  When Johnny Mythrilhand announced a planet-wide concert on Niniche, the crowd didn't come
                  for Johnny alone (sorry, Johnny). They came because <strong className="text-rose-300">DJ Smooch.exe</strong>
                  was spinning. The Kuatoa people? <em>"We are actually huge fans of yours!"</em> they said —
                  not to Wraith, not to Johnny, but to the legend himself. Even the fish-people knew quality
                  beats when they heard them.
                </p>

                <div className="p-4 bg-black/30 rounded-xl border border-rose-400/40">
                  <p className="text-rose-200 italic text-center">
                    "We are more fans of DJ Smooch.exe" — The Kuatoa, literally preferring him over Johnny Mythrilhand.
                    <span className="text-pink-400 font-bold"> This is not a drill.</span>
                  </p>
                </div>

                <p>
                  That fateful day on Niniche, while <strong className="text-purple-300">Tabaga</strong> was
                  body-slamming wrestlers in perfect synchrony with the music, while the mosh pit raged,
                  while medical tents overflowed with overly-enthusiastic fans who had discovered that
                  headbanging has consequences... <strong className="text-rose-300">DJ Smooch.exe</strong> kept
                  the beat going. <em>The show must go on.</em>
                </p>

                <p className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                  And then... backstage happened. 💔
                </p>

                <p>
                  Nobody saw them coming. <em>Nobody ever does.</em> One moment DJ Smooch.exe was there,
                  mid-sentence, probably about to drop the sickest beat the universe had ever heard.
                  The next moment — <strong className="text-red-400">stabbed</strong>. Right there.
                  <span className="text-rose-300">Chimer caught him as he fell.</span> Johnny tried slapping
                  him back to consciousness because <em>of course</em> Johnny thought rock-and-roll
                  could cure fatal wounds.
                </p>

                <div className="p-4 bg-black/30 rounded-xl border border-red-400/40">
                  <p className="text-red-200 italic text-center">
                    "They watched the light leave his eyes. He died mid-sentence.
                    We'll never know what he was about to say.
                    Probably something about bass drops." 😭
                  </p>
                </div>

                <p>
                  The cruel irony? It was an <strong className="text-red-300">unknown assassin</strong> from
                  <em className="text-gray-300">The Shadow Kabal</em> — a notorious assassination syndicate
                  that operates in the dark corners of the cosmos. No one knows who hired them.
                  No one knows why. The scars on Chimer from a previous encounter with their operatives? <em>Identical.</em>
                  Their methods are as <strong className="text-red-400">ruthless</strong> as they are mysterious.
                </p>

                <p className="text-rose-200">
                  Was there a bounty on DJ Smooch.exe's head? The retired wrestlers mentioned bounties.
                  Was this a targeted hit by <em className="text-gray-300">The Shadow Kabal</em>? A contract killing?
                  Who wanted him silenced? We may never know. What we DO know is that the universe lost a legend that day.
                  <strong className="text-rose-300"> But legends can be brought back.</strong>
                </p>

                <div className="p-6 bg-gradient-to-br from-black/50 to-rose-900/30 rounded-xl border-2 border-rose-400/50">
                  <h4 className="text-2xl font-bold text-rose-300 mb-4 text-center">🌟 What DJ Smooch.exe Meant To Us 🌟</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Music className="w-6 h-6 text-rose-400 flex-shrink-0 mt-1" />
                      <span>His beats were so fire that <strong className="text-rose-300">Kuatoa fish-people partied to his livestream</strong> while sailing to kidnap people. Music truly connects all beings.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
                      <span>He had <strong className="text-pink-300">fangirls taking pictures of him</strong> before he died. Truly living the dream until the very (sudden) end.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                      <span>His wireless setup was <strong className="text-purple-300">"really cool"</strong> — even his assassin probably appreciated it before, you know, the stabbing.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                      <span>He was killed <strong className="text-cyan-300">mid-collaboration with Johnny Mythrilhand</strong>. Their dual performance was so legendary that security couldn't handle the crowd.</span>
                    </li>
                  </ul>
                </div>

                <p className="text-center text-xl font-semibold">
                  <span className="text-rose-300">DJ Smooch.exe</span> didn't die doing what he loved.
                  He died getting <span className="text-red-400">stabbed backstage</span> by an assassin from the shadows.
                  <br />But hey, at least he was at a concert? <em className="text-pink-400">And we're going to bring him back.</em>
                </p>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="relative p-8 bg-gradient-to-br from-indigo-900/40 to-rose-900/40 rounded-2xl border-2 border-rose-400/50 backdrop-blur-lg shadow-[0_0_40px_rgba(244,63,94,0.3)]">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300 mb-6 text-center">
              🔮 Fund His Resurrection 🔮
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDonation.name || newDonation.amount <= 0) return;
                // Open checkout instead of directly saving
                setShowDonationCheckout(true);
              }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-rose-300 font-semibold mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={newDonation.name}
                    onChange={(e) =>
                      setNewDonation({ ...newDonation, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors"
                    placeholder="Enter your cosmic name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-rose-300 font-semibold mb-2">
                    Donation Amount (◈)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDonation.amount}
                    onChange={(e) =>
                      setNewDonation({ ...newDonation, amount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors"
                    placeholder="100"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-rose-300 font-semibold mb-2">
                  Message for DJ Smooch.exe (Optional)
                </label>
                <textarea
                  value={newDonation.message}
                  onChange={(e) =>
                    setNewDonation({ ...newDonation, message: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/40 border-2 border-rose-400/40 rounded-lg text-rose-100 placeholder-rose-400/50 focus:border-rose-400 focus:outline-none transition-colors h-24 resize-none"
                  placeholder="Share a memory, or just say 'Drop the bass one more time, king' 🎧"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 px-6 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-lg rounded-lg transition-all duration-300 shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:shadow-[0_0_40px_rgba(244,63,94,0.6)] transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Heart className="w-6 h-6" />
                Proceed to Payment
                <Heart className="w-6 h-6" />
              </button>
            </form>
          </div>

          {/* Recent Donations */}
          {donations.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-pink-300">
                💫 Cosmic Contributors 💫
              </h3>
              <div className="space-y-4">
                {donations.slice().reverse().map((donation) => (
                  <div
                    key={donation.id}
                    className="p-6 bg-gradient-to-br from-rose-900/40 to-pink-900/40 rounded-xl border-2 border-rose-400/30 backdrop-blur-sm hover:border-rose-300 hover:shadow-[0_0_35px_rgba(244,63,94,0.5)] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-2xl font-bold text-rose-300">
                          {donation.name}
                        </h4>
                        <p className="text-sm text-rose-400 italic">
                          {donation.date}
                        </p>
                      </div>
                      <div className="text-2xl font-black text-rose-200">
                        {donation.amount.toLocaleString()} ◈
                      </div>
                    </div>
                    {donation.message && (
                      <p className="text-rose-100 text-lg leading-relaxed italic">
                        "{donation.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Memorial Quote */}
          <div className="text-center p-8 bg-gradient-to-br from-black/50 to-rose-900/30 rounded-2xl border-2 border-rose-400/30">
            <p className="text-2xl font-bold text-rose-300 italic">
              "The beat drops, but legends never stay down." 🎧🔮
            </p>
            <p className="text-rose-400 mt-4">
              — The Cosmic Syndicate, preparing the resurrection ritual
            </p>
            <p className="text-sm text-rose-500 mt-4">
              (The Shadow Kabal will pay for this. We're coming for them. 🗡️)
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-cyan-400/30 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex justify-center items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              THE COSMIC SYNDICATE
            </span>
            <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
          <p className="text-cyan-200 text-lg italic">
            "When the impossible calls, we answer."
          </p>
          <div className="text-cyan-400 text-sm space-y-1">
            <p>Headquarters: Somewhere between dimensions</p>
            <p>Contact: Send a quantum signal, we'll find you</p>
            <p>Business Hours: Always (time is relative anyway)</p>
          </div>
          <div className="pt-6 border-t border-cyan-400/20">
            <p className="text-cyan-500 text-xs">
              © Cosmic Year ∞ | The Cosmic Syndicate of Impossible Solutions |
              Making the Universe Great Again, One Impossible Problem at a Time
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default CosmicSyndicate;


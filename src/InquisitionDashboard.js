import React, { useState, useEffect, useRef } from 'react';
import DiceBox from '@3d-dice/dice-box';
import { useNavigate } from 'react-router-dom'; // For redirection
import {
  Skull,
  Scroll,
  Crosshair,
  Flame,
  Book,
  Cpu,
  ShieldAlert,
  Terminal,
  Activity,
  X,
  Dices,
  MessageSquare,
  Users,
  Briefcase,
  Lock,
  ChevronRight
} from 'lucide-react';

// --- STYLES FOR THE 40K THEME ---
// You can add these to your CSS file, or rely on the Tailwind classes used below.
// The aesthetic is "Grimdark Gothic Interface"

// --- COMPONENTS (Reskinned for 40k) ---

// 1. COGITATOR LOGIN (Login Overlay)
const CogitatorLogin = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating API call
    setTimeout(() => {
        const user = { username: username, clearance: 'Magenta' };
        localStorage.setItem('imperialUser', JSON.stringify(user));
        onLogin(user);
        setLoading(false);
        onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md bg-zinc-900 border-4 border-yellow-700 outline outline-2 outline-black p-8 relative shadow-[0_0_50px_rgba(161,98,7,0.3)]">
        {/* Decorative Bolts */}
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-yellow-700 shadow-inner"></div>
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-700 shadow-inner"></div>
        <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-yellow-700 shadow-inner"></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-yellow-700 shadow-inner"></div>

        <button onClick={onClose} className="absolute top-4 right-4 text-red-500 hover:text-red-400">
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8 space-y-2">
            <Skull className="w-16 h-16 text-yellow-600 mx-auto animate-pulse" />
            <h2 className="text-2xl font-bold text-yellow-600 tracking-widest uppercase border-b-2 border-yellow-800 pb-2">
                Identity Clearance
            </h2>
            <p className="text-green-500 text-xs animate-pulse">:: CONNECTING TO NOOSPHERE ::</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-yellow-700 text-xs font-bold mb-1 uppercase tracking-widest">Operative Name</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} 
              className="w-full bg-black border border-yellow-800 text-green-500 p-3 focus:outline-none focus:border-green-500 font-mono"
              placeholder="Identification..." required />
          </div>
          <div>
            <label className="block text-yellow-700 text-xs font-bold mb-1 uppercase tracking-widest">Access Code</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} 
              className="w-full bg-black border border-yellow-800 text-green-500 p-3 focus:outline-none focus:border-green-500 font-mono"
              placeholder="Runes..." required />
          </div>

          <button type="submit" disabled={loading} 
            className="w-full py-3 bg-red-900 hover:bg-red-800 border-2 border-red-950 text-yellow-500 font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            {loading ? 'COMMUNING...' : 'INITIATE UPLINK'}
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. VOX CASTER (Chat)
const VoxCaster = ({ isOpen, onClose, currentUser }) => {
    const [messages, setMessages] = useState([
        { id: 1, username: 'Servo-Skull', text: 'Praise the Omnissiah. Systems Nominal.', type: 'system' }
    ]);
    const [input, setInput] = useState('');

    const sendVox = () => {
        if(!input.trim()) return;
        setMessages([...messages, { id: Date.now(), username: currentUser?.username || 'Unknown', text: input, type: 'user' }]);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-24 right-8 z-[150] w-80 h-96 bg-black border-4 border-slate-700 shadow-2xl flex flex-col font-mono">
            <div className="bg-slate-800 p-2 border-b border-slate-600 flex justify-between items-center">
                <span className="text-green-500 text-xs font-bold uppercase blink">:: Vox Channel Open ::</span>
                <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                {messages.map(m => (
                    <div key={m.id} className="text-xs">
                        <span className="text-yellow-600 font-bold">[{m.username}]:</span> <span className="text-green-400">{m.text}</span>
                    </div>
                ))}
            </div>
            <div className="p-2 bg-slate-800 border-t border-slate-600 flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} 
                    className="flex-1 bg-black border border-slate-600 text-green-500 px-2 text-xs focus:outline-none" 
                    placeholder="Transmit..."
                />
                <button onClick={sendVox} className="bg-green-900 px-3 text-green-200 text-xs uppercase hover:bg-green-800">Send</button>
            </div>
        </div>
    );
};

// 3. TACTICAL AUSPEX (Dice Roller - Reskinned)
const TacticalAuspex = ({ onClose }) => {
    const containerId = 'auspex-dice-box';
    const diceBoxRef = useRef(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const Box = new DiceBox({
            id: '#' + containerId,
            assetPath: '/assets/', // Ensure you have assets or change origin
            origin: 'https://unpkg.com/@3d-dice/dice-box@1.1.4/dist/',
            theme: 'rust', // Rusty theme for 40k
            themeColor: '#800000',
            scale: 6
        });
        diceBoxRef.current = Box;
        Box.init();
    }, []);

    const roll = () => {
        diceBoxRef.current.roll('2d20').then(res => {
            let total = 0;
             res.forEach(r => total += r.value);
             setResult(total);
        });
    };

    return (
        <div className="fixed inset-0 z-[190] bg-black/80 flex items-center justify-center">
             <div className="relative w-full max-w-3xl h-[80vh] bg-zinc-900 border-4 border-yellow-700 flex flex-col">
                <div className="bg-red-900 p-4 flex justify-between items-center border-b-4 border-yellow-700">
                    <h3 className="text-yellow-500 font-serif font-bold text-xl uppercase">Fate Weaver Auspex</h3>
                    <button onClick={onClose}><X className="w-8 h-8 text-yellow-500"/></button>
                </div>
                <div id={containerId} className="flex-1 bg-black relative">
                    {/* Dice render here */}
                    {result && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 border border-green-500 text-green-500 px-6 py-2 font-mono text-2xl font-bold animate-pulse">
                            OUTCOME: {result}
                        </div>
                    )}
                </div>
                <div className="p-6 bg-zinc-800 border-t-4 border-yellow-700 flex justify-center gap-4">
                    <button onClick={roll} className="px-8 py-4 bg-yellow-700 hover:bg-yellow-600 text-black font-bold text-xl font-serif uppercase tracking-widest shadow-lg border-2 border-yellow-500">
                        Cast the Runes
                    </button>
                </div>
             </div>
        </div>
    );
};

// 4. ADEPTUS ADMINISTRATUM CAREERS
const AdministratumCareers = ({ onClose }) => {
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-zinc-900 overflow-y-auto">
            <div className="max-w-4xl mx-auto py-12 px-4">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <Scroll className="w-12 h-12 text-yellow-600" />
                        <div>
                            <h1 className="text-4xl font-serif font-bold text-yellow-600 uppercase">Enlistment Protocol</h1>
                            <p className="text-gray-400 font-mono text-sm">Form 77-B: Request for Service within the Holy Ordos</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 border border-red-800 text-red-500 hover:bg-red-900/20">
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {submitted ? (
                     <div className="p-12 border-4 border-green-700 bg-green-900/20 text-center">
                        <ShieldAlert className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-green-500 uppercase mb-2">Application Received</h2>
                        <p className="text-green-300 font-mono">Your life is now the Emperor's currency. Spend it well.</p>
                     </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-black border border-yellow-800/50 p-8 space-y-6 font-mono">
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-yellow-700 mb-2 uppercase text-xs">Citizen Name</label>
                                <input className="w-full bg-zinc-900 border border-zinc-700 p-3 text-gray-300 focus:border-yellow-600 outline-none" required />
                            </div>
                            <div>
                                <label className="block text-yellow-700 mb-2 uppercase text-xs">Hive World Origin</label>
                                <input className="w-full bg-zinc-900 border border-zinc-700 p-3 text-gray-300 focus:border-yellow-600 outline-none" required />
                            </div>
                         </div>
                         <div>
                            <label className="block text-yellow-700 mb-2 uppercase text-xs">Previous Crimes against the Imperium</label>
                            <textarea className="w-full h-32 bg-zinc-900 border border-zinc-700 p-3 text-gray-300 focus:border-yellow-600 outline-none" placeholder="None (Lying is heresy...)" />
                         </div>
                         <button className="w-full py-4 bg-red-900 text-white uppercase font-bold tracking-[0.2em] hover:bg-red-800 border border-red-500">
                            Submit Soul for Judgment
                         </button>
                    </form>
                )}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const InquisitionDashboard = () => {
    const navigate = useNavigate();
    
    // State
    const [showLogin, setShowLogin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showDice, setShowDice] = useState(false);
    const [showCareers, setShowCareers] = useState(false);

    // Authentication Check
    useEffect(() => {
        const user = localStorage.getItem('imperialUser');
        if(user) setCurrentUser(JSON.parse(user));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('imperialUser');
        setCurrentUser(null);
    };

    // The Team Data
    const retinue = [
        {
            name: "KQ-234",
            role: "Magos Biologis",
            faction: "Adeptus Mechanicus",
            desc: "94% Cybernetic augmentation. Believes flesh is a design flaw. Expert in cogitation and disassembly.",
            icon: Cpu,
            color: "text-red-500",
            border: "border-red-900"
        },
        {
            name: "Dex Pointer",
            role: "Logis Strategos",
            faction: "Adeptus Administratum",
            desc: "Has filed 40,000 forms in record time. His quill is sharper than a power sword. Calculates supply lines in his sleep.",
            icon: Scroll,
            color: "text-gray-400",
            border: "border-gray-600"
        },
        {
            name: "Neil",
            role: "Sanctioned Psyker",
            faction: "Scholastica Psykana",
            desc: "Stares into the Warp so you don't have to. Sometimes levitates objects when sneezing. Keep at a safe distance.",
            icon: Activity,
            color: "text-purple-500",
            border: "border-purple-900"
        },
        {
            name: "Xena",
            role: "Sister Superior",
            faction: "Adeptus Sororitas",
            desc: "Wields a bolter and unshakeable faith. Her hymns deal holy damage. Has a zero-tolerance policy for heresy.",
            icon: Flame,
            color: "text-white",
            border: "border-white"
        },
        {
            name: "Mickey",
            role: "Confessor",
            faction: "Ministorum Priest",
            desc: "His sermons can rally a planet or condemn it. Carries a massive book and a chainsword. He calls it 'The Final Argument'.",
            icon: Book,
            color: "text-yellow-500",
            border: "border-yellow-600"
        },
        {
            name: "Kairos",
            role: "Vindicare Assassin",
            faction: "Officio Assassinorum",
            desc: "We aren't actually sure he is here. If you see him, it's already too late. Never misses.",
            icon: Crosshair,
            color: "text-green-500",
            border: "border-green-900"
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-gray-200 font-sans selection:bg-red-900 selection:text-white relative overflow-hidden">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] z-0"></div>
            
            {/* CRT Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none z-[10] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

            {/* Overlays */}
            {showLogin && <CogitatorLogin onClose={() => setShowLogin(false)} onLogin={setCurrentUser} />}
            {showDice && <TacticalAuspex onClose={() => setShowDice(false)} />}
            {showChat && <VoxCaster isOpen={showChat} onClose={() => setShowChat(false)} currentUser={currentUser} />}
            {showCareers && <AdministratumCareers onClose={() => setShowCareers(false)} />}

            {/* Navigation Header */}
            <nav className="relative z-20 border-b-4 border-yellow-700 bg-black/90 px-6 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-4">
                    <Skull className="w-10 h-10 text-yellow-600" />
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-yellow-600 tracking-widest uppercase">Ordo Hereticus</h1>
                        <p className="text-xs text-red-600 font-bold tracking-[0.3em] uppercase">Sector Calixis // Clearance Magenta</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* RETURN TO HOME BUTTON */}
                    <button onClick={() => navigate('/')} 
                        className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-900/30 flex items-center gap-2 uppercase text-xs font-bold tracking-widest transition-all">
                        <ChevronRight className="rotate-180 w-4 h-4"/> Return to Syndicate
                    </button>
                    
                    <div className="h-8 w-[2px] bg-yellow-800 mx-2"></div>

                    <button onClick={() => setShowDice(true)} className="text-yellow-600 hover:text-yellow-400 p-2"><Dices className="w-6 h-6"/></button>
                    <button onClick={() => setShowCareers(true)} className="text-yellow-600 hover:text-yellow-400 p-2"><Briefcase className="w-6 h-6"/></button>
                    
                    {currentUser ? (
                         <button onClick={handleLogout} className="px-4 py-2 border border-red-600 text-red-500 hover:bg-red-900/30 uppercase text-xs font-bold">
                            Sever Connection ({currentUser.username})
                        </button>
                    ) : (
                        <button onClick={() => setShowLogin(true)} className="px-4 py-2 bg-yellow-700 text-black hover:bg-yellow-600 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Initialize
                        </button>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                
                {/* Header Text */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-5xl md:text-7xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-500 to-yellow-800 drop-shadow-sm uppercase">
                        The Inquisitorial Retinue
                    </h2>
                    <div className="flex items-center justify-center gap-4 text-red-600 font-mono text-sm tracking-[0.2em]">
                        <span>++ THOUGHT FOR THE DAY: INNOCENCE PROVES NOTHING ++</span>
                    </div>
                </div>

                {/* Character Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {retinue.map((member, idx) => {
                        const Icon = member.icon;
                        return (
                            <div key={idx} className={`group relative bg-zinc-900/80 border-2 ${member.border} p-6 transition-all duration-500 hover:bg-zinc-800 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 bg-yellow-600"></div>
                                <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-600"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 bg-yellow-600"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-600"></div>

                                <div className="flex items-start justify-between mb-4 border-b border-gray-700 pb-4">
                                    <div>
                                        <h3 className={`text-2xl font-serif font-bold ${member.color} uppercase`}>{member.name}</h3>
                                        <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{member.role}</p>
                                    </div>
                                    <Icon className={`w-8 h-8 ${member.color} opacity-80`} />
                                </div>
                                
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 bg-black border border-gray-700 text-[10px] text-gray-400 uppercase tracking-wider">
                                        {member.faction}
                                    </span>
                                </div>

                                <p className="text-gray-300 font-serif leading-relaxed italic border-l-2 border-yellow-700 pl-4">
                                    "{member.desc}"
                                </p>

                                {/* Purity Seal Decoration via CSS */}
                                <div className="absolute -bottom-6 -right-2 w-12 h-12 bg-red-800 rounded-full border-4 border-red-950 shadow-lg flex items-center justify-center group-hover:animate-pulse z-20">
                                    <Skull className="w-6 h-6 text-yellow-600/50" />
                                    <div className="absolute top-10 w-8 h-20 bg-yellow-100/80 -z-10 clip-path-ribbon transform rotate-12"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Floating Vox Button */}
                {currentUser && (
                    <button onClick={() => setShowChat(!showChat)} className="fixed bottom-8 right-8 z-50 bg-green-900 border-2 border-green-500 p-4 rounded-full shadow-[0_0_20px_rgba(21,128,61,0.5)] hover:bg-green-800 transition-all">
                        <MessageSquare className="w-6 h-6 text-green-100" />
                    </button>
                )}

            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t-4 border-yellow-800 bg-black py-8 mt-20 text-center">
                <p className="text-yellow-700 font-serif text-sm uppercase tracking-widest">
                    The Emperor Protects • Ordo Hereticus • Sector 44-G
                </p>
            </footer>
            
            {/* Custom Styles for Ribbons */}
            <style>{`
                .clip-path-ribbon {
                    clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%);
                }
            `}</style>
        </div>
    );
};

export default InquisitionDashboard;

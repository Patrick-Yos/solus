import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scroll, Terminal, Shield, AlertTriangle, FileText, Download, Skull, Cross, Activity, Eye, Fingerprint, ChevronRight, Save, RotateCcw, Plus, Trash2, Shuffle, Gauge, Dices, Hammer, Volume2, VolumeX, Radio, Send, Zap, Target, Palette, Sparkles, Printer, FileWarning, Lock } from 'lucide-react';

/**
 * INQUISITORIAL CASE FILE GENERATOR (DARK HERESY: OMEGA EDITION)
 * Clearance Level: Magenta
 * * Features: Audio, Boot sequence, Dice (TN), Purity seals, News, Transmission, Warp Phenomena, Mission Gen, Dynamic Themes.
 * * Status: Fully Operational.
 */

const THOUGHTS_OF_THE_DAY = [
  "Innocence proves nothing.",
  "There is no such thing as innocence, only degrees of guilt.",
  "A plea of innocence is guilty of wasting my time.",
  "Burn the Heretic. Kill the Mutant. Purge the Unclean.",
  "Hope is the first step on the road to disappointment.",
  "An open mind is like a fortress with its gates unbarred and unguarded.",
  "Success is commemorated; Failure merely remembered.",
  "The wise man learns from the deaths of others.",
  "Ruthlessness is the kindness of the wise.",
  "It is better to die for the Emperor than to live for yourself."
];

const SECTOR_NEWS = [
  "++ VOX-CASTER 99.4 :: HIVE SIBELLUS SECTOR 4 QUARANTINED DUE TO 'UNREST' ++",
  "++ REMINDER: CORPSE STARCH RATIONS REDUCED BY 15% THIS CYCLE ++",
  "++ REPORT ALL UNSANCTIONED PSYKERS TO LOCAL ARBITES IMMEDIATELY ++",
  "++ VICTORY IN THE SPINWARD FRONT: 5 MILLION GUARDSMEN MARTYRED, STRATEGIC HILL TAKEN ++",
  "++ WORK SHIFT EXTENDED TO 18 HOURS. PRAISE THE OMNISSIAH ++",
  "++ THOUGHT FOR THE DAY: A SMALL MIND IS A TIDY MIND ++"
];

const IMPERIAL_DATA = {
  names: ["Gideon", "Vex", "Kara", "Thaddeus", "Crixus", "Octavia", "Valeria", "Severus", "Marius", "Lucia", "Tybalt", "Xanthia", "Havelock", "Morrigan", "Eisenhorn", "Ravenor", "Vail"],
  surnames: ["Kaine", "Voss", "Thorne", "Rex", "Glaive", "Darke", "Syle", "Mercer", "Crowl", "Est", "Vane", "Xerxes", "Dorn", "Valkyrie", "Maloc", "Zhu"],
  worlds: ["Scintilla", "Feral World", "Hive World", "Forge World", "Shrine World", "Death World", "Void Born", "Gunmetal City", "Iocanthos", "Sepheris Secundus", "Maccabeus Quintus"]
};

const PHENOMENA_TABLE = [
  { range: [1, 5], effect: "Spectral cold pervades the area. All breath mists." },
  { range: [6, 10], effect: "Nearby chronos run backwards for 1d10 seconds." },
  { range: [11, 15], effect: "Whispers of the damned fill the air." },
  { range: [16, 20], effect: "All lights flicker and die for a moment." },
  { range: [21, 30], effect: "Gravity reverses briefly. Loose objects float." },
  { range: [31, 40], effect: "Blood weeps from walls or statues." },
  { range: [41, 50], effect: "Technological artifacts scream in binary code." },
  { range: [51, 75], effect: "PERILS OF THE WARP! Roll on Perils Table." },
  { range: [76, 100], effect: "DEMONIC INCURSION IMMINENT. PRAY." }
];

const MISSION_DATA = {
  objectives: ["Apprehend Heretic", "Recover Archeotech", "Assassinate Rogue Psyker", "Investigate Cult", "Purge Xenos Nest", "Extract Noble"],
  locations: ["Underhive Slums", "Orbital Station", "Abandoned Cathedral", "Noble Spire", "Agri-World Farm", "Forge Complex", "Promethium Refinery"],
  twists: ["Target is possessed", "Local Enforcers are corrupt", "Warp Storm approaches", "Rival Cell intervenes", "It's a trap", "Target is actually loyal", "Inquisition Oversight arriving"]
};

// --- THEMES ---
const THEMES = {
  green: { primary: 'text-green-500', border: 'border-green-800', bg: 'bg-green-950/10', glow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]', accent: 'text-green-400' },
  amber: { primary: 'text-amber-500', border: 'border-amber-800', bg: 'bg-amber-950/10', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]', accent: 'text-amber-400' },
  cyan: { primary: 'text-cyan-500', border: 'border-cyan-800', bg: 'bg-cyan-950/10', glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]', accent: 'text-cyan-400' },
};

// --- HELPER FUNCTIONS ---
const getOrdoColor = (ordo) => {
  switch(ordo) {
    case 'Hereticus': return 'text-amber-500'; 
    case 'Xenos': return 'text-emerald-500'; 
    case 'Malleus': return 'text-blue-400'; 
    default: return 'text-stone-400';
  }
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- SUBCOMPONENTS ---

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, width = 'full', onRandomize, playSound, theme }) => (
  <div className={`mb-4 font-mono group ${width === 'half' ? 'col-span-1' : 'col-span-2'}`}>
    <label className={`block text-[0.65rem] uppercase tracking-widest ${theme.primary} opacity-70 mb-1 group-hover:opacity-100 transition-opacity flex items-center justify-between`}>
      <div className="flex items-center gap-2">
        <ChevronRight size={10} />
        {label}
      </div>
      {onRandomize && (
        <button onClick={() => { playSound('click'); onRandomize(); }} className={`hover:${theme.accent} transition-colors`} title="Query Databanks">
          <Shuffle size={10} />
        </button>
      )}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => { playSound('type'); onChange(e); }}
        placeholder={placeholder}
        className={`w-full bg-[#050505] border ${theme.border} ${theme.primary} p-2 text-sm focus:outline-none focus:bg-[#0a0a0a] transition-all uppercase font-mono tracking-tight shadow-inner focus:${theme.glow}`}
      />
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-1 h-1 border-t border-l ${theme.border}`} />
      <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r ${theme.border}`} />
    </div>
  </div>
);

const EvidenceItem = ({ text, index, onChange, onRemove, playSound, theme }) => (
  <div className="flex gap-2 mb-2 items-start animate-in slide-in-from-left-2 fade-in duration-300">
    <div className={`bg-[#050505] border ${theme.border} flex-1 flex items-center p-2 shadow-inner`}>
      <span className={`${theme.primary} font-mono text-xs mr-2 opacity-60`}>EX-{index + 1}::</span>
      <input
        type="text"
        value={text}
        onChange={(e) => { playSound('type'); onChange(index, e.target.value); }}
        className={`bg-transparent border-none ${theme.primary} text-sm w-full focus:outline-none uppercase font-mono`}
        placeholder="DESCRIBE ARTIFACT..."
      />
    </div>
    <button 
      onClick={() => { playSound('click'); onRemove(index); }}
      className="p-2 bg-red-950/20 border border-red-900/30 text-red-700 hover:bg-red-900/40 hover:text-red-500 transition-colors"
    >
      <Trash2 size={16} />
    </button>
  </div>
);

const OrdoSelector = ({ currentOrdo, onSelect, playSound }) => (
  <div className="flex gap-2 mb-6 bg-black p-1 border border-stone-800 shadow-lg">
    {['Hereticus', 'Xenos', 'Malleus'].map((ordo) => (
      <button
        key={ordo}
        onClick={() => { playSound('click'); onSelect(ordo); }}
        className={`flex-1 py-2 text-xs uppercase tracking-widest transition-all border ${
          currentOrdo === ordo 
            ? `bg-stone-900 ${getOrdoColor(ordo)} border-${getOrdoColor(ordo).split('-')[1]}-900 shadow-[0_0_15px_rgba(0,0,0,0.5)]` 
            : 'text-stone-600 border-transparent hover:text-stone-400'
        }`}
      >
        Ordo {ordo}
      </button>
    ))}
  </div>
);

const NavButton = ({ active, icon, label, onClick, color, playSound }) => {
  const activeClass = active 
    ? `bg-stone-900 ${color} border-l-2 ${color.replace('text', 'border')} shadow-lg` 
    : 'text-stone-600 hover:text-stone-400 hover:bg-stone-900/50 border-l-2 border-transparent';

  return (
    <button 
      onClick={() => { playSound('click'); onClick(); }}
      className={`w-full text-left py-3 px-4 text-xs font-bold tracking-widest transition-all flex items-center gap-3 ${activeClass}`}
    >
      <span className={active ? color : ''}>{icon}</span> 
      {label}
    </button>
  );
};

const DiceRoller = ({ isOpen, onClose, playSound, theme }) => {
  const [result, setResult] = useState(null);
  const [target, setTarget] = useState(40);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    playSound('click');
    setRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setResult(Math.floor(Math.random() * 100) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setRolling(false);
        playSound('boot');
      }
    }, 50);
  };

  if (!isOpen) return null;

  const success = result !== null && result <= target;
  const degrees = result !== null ? Math.floor(Math.abs(target - result) / 10) : 0;

  return (
    <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className={`bg-[#111] border-2 ${theme.border} p-8 max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500">
           <Cross size={20} className="rotate-45" />
        </button>
        <div className="text-center">
           <h3 className={`${theme.primary} uppercase tracking-widest mb-6 border-b ${theme.border} pb-2`}>Skill Check Cogitator</h3>
           
           <div className="flex justify-between items-center mb-4 px-4">
             <span className="text-xs text-stone-500">TARGET #</span>
             <input 
               type="number" 
               value={target}
               onChange={(e) => setTarget(parseInt(e.target.value))}
               className={`w-16 bg-black border ${theme.border} ${theme.primary} text-center p-1 focus:outline-none`}
             />
           </div>

           <div className={`h-32 flex flex-col items-center justify-center mb-6 bg-black border ${theme.border} shadow-inner`}>
              <span className={`text-6xl font-mono font-bold ${rolling ? 'text-stone-600' : success ? 'text-green-500' : 'text-red-500'} ${!rolling && result !== null ? 'animate-pulse' : ''}`}>
                {result !== null ? result.toString().padStart(2, '0') : '--'}
              </span>
              {!rolling && result !== null && (
                 <span className={`text-xs mt-2 font-bold ${success ? 'text-green-500' : 'text-red-500'}`}>
                    {success ? `SUCCESS (${degrees} DoS)` : `FAILURE (${degrees} DoF)`}
                 </span>
              )}
           </div>

           <button 
             onClick={roll}
             disabled={rolling}
             className={`w-full bg-stone-900 hover:bg-stone-800 ${theme.primary} py-3 uppercase tracking-widest text-sm font-bold border ${theme.border} disabled:opacity-50 transition-colors`}
           >
             {rolling ? 'Divining...' : 'Roll D100'}
           </button>
        </div>
      </div>
    </div>
  );
};

const PsychicModal = ({ isOpen, onClose, playSound, theme }) => {
  const [phenomenon, setPhenomenon] = useState(null);
  const [rolling, setRolling] = useState(false);

  const manifest = () => {
    playSound('warp');
    setRolling(true);
    setTimeout(() => {
        const roll = Math.floor(Math.random() * 100) + 1;
        const result = PHENOMENA_TABLE.find(p => roll >= p.range[0] && roll <= p.range[1]);
        setPhenomenon({ roll, ...result });
        setRolling(false);
        playSound('boot');
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-purple-950/20 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-in zoom-in-95 duration-300">
       <div className={`bg-[#050505] border-2 border-purple-500/50 p-8 max-w-md w-full relative shadow-[0_0_100px_rgba(168,85,247,0.2)]`}>
          <button onClick={onClose} className="absolute top-2 right-2 text-stone-500 hover:text-red-500">
             <Cross size={20} className="rotate-45" />
          </button>
          
          <div className="text-center space-y-6">
             <div className="flex justify-center mb-4">
                <Zap size={48} className={`text-purple-500 ${rolling ? 'animate-bounce' : ''}`} />
             </div>
             
             <h3 className="text-purple-400 font-bold uppercase tracking-[0.2em] text-lg">Warp Phenomena</h3>
             
             <div className="min-h-[120px] flex items-center justify-center border border-purple-900/50 bg-black/50 p-4">
                {rolling ? (
                    <span className="text-purple-500 animate-pulse font-mono">CHANNELING THE IMMATERIUM...</span>
                ) : phenomenon ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="text-4xl font-bold text-white mb-2">{phenomenon.roll}</div>
                        <p className="text-purple-300 font-mono text-sm leading-relaxed">{phenomenon.effect}</p>
                    </div>
                ) : (
                    <span className="text-stone-600 font-mono text-xs">READY TO MANIFEST</span>
                )}
             </div>

             <button 
               onClick={manifest}
               disabled={rolling}
               className="w-full bg-purple-900/20 hover:bg-purple-900/40 text-purple-300 border border-purple-500/50 py-3 uppercase tracking-widest text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
             >
               Manifest Power
             </button>
          </div>
       </div>
    </div>
  );
};

const MissionModal = ({ isOpen, onClose, playSound, theme }) => {
  const [mission, setMission] = useState(null);

  const generate = () => {
     playSound('type');
     setMission({
         obj: getRandom(MISSION_DATA.objectives),
         loc: getRandom(MISSION_DATA.locations),
         twist: getRandom(MISSION_DATA.twists)
     });
     playSound('boot');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
       <div className={`bg-[#111] border-2 ${theme.border} p-6 max-w-md w-full shadow-2xl`}>
          <div className="flex justify-between items-center mb-6 border-b border-stone-800 pb-2">
             <h3 className={`${theme.primary} uppercase tracking-widest flex items-center gap-2`}><Target size={16}/> Mission Auspex</h3>
             <button onClick={onClose}><Cross size={16} className="rotate-45 text-stone-500" /></button>
          </div>
          
          <div className="space-y-4 mb-6">
             <div className="bg-black border border-stone-800 p-3">
                <div className="text-[0.6rem] text-stone-500 uppercase">Primary Objective</div>
                <div className={`${theme.primary} font-mono`}>{mission ? mission.obj : '...'}</div>
             </div>
             <div className="bg-black border border-stone-800 p-3">
                <div className="text-[0.6rem] text-stone-500 uppercase">Target Location</div>
                <div className={`${theme.primary} font-mono`}>{mission ? mission.loc : '...'}</div>
             </div>
             <div className="bg-black border border-stone-800 p-3">
                <div className="text-[0.6rem] text-stone-500 uppercase">Complication</div>
                <div className="text-red-400 font-mono animate-pulse">{mission ? mission.twist : '...'}</div>
             </div>
          </div>

          <button 
             onClick={generate}
             className={`w-full ${theme.bg} ${theme.primary} border ${theme.border} py-3 uppercase tracking-widest text-xs font-bold hover:bg-stone-900 transition-colors`}
           >
             Generate Parameters
           </button>
       </div>
    </div>
  );
};

const TransmissionModal = ({ isOpen, onClose, playSound }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("INITIALIZING UPLINK...");
  
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setStatus("INITIALIZING UPLINK...");
      return;
    }

    const stages = [
       { p: 10, t: "ENCRYPTING DATA..." },
       { p: 30, t: "PRAYING TO MACHINE SPIRIT..." },
       { p: 50, t: "ESTABLISHING ASTROPATHIC LINK..." },
       { p: 70, t: "TRANSMITTING HEX-CODES..." },
       { p: 90, t: "VERIFYING CHECKSUM..." },
       { p: 100, t: "TRANSMISSION COMPLETE." }
    ];

    let currentStage = 0;
    
    const interval = setInterval(() => {
        setProgress(prev => {
            const next = prev + 1;
            if (next > stages[currentStage].p && currentStage < stages.length - 1) {
                currentStage++;
                setStatus(stages[currentStage].t);
                playSound('type');
            }
            if (next >= 100) {
                clearInterval(interval);
                playSound('boot');
                setTimeout(onClose, 1500);
                return 100;
            }
            return next;
        });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/95 z-[70] flex flex-col items-center justify-center p-12 font-mono">
       <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-4 text-emerald-500 animate-pulse">
             <Radio size={24} />
             <span className="text-xl font-bold tracking-widest">TRANSMITTING TO SECTOR COMMAND</span>
          </div>
          <div className="w-full h-4 bg-stone-900 border border-emerald-900 mb-2 p-1">
             <div className="h-full bg-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-75" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-emerald-700">
             <span>{status}</span>
             <span>{progress}%</span>
          </div>
       </div>
    </div>
  );
};

const Boot = ({ onComplete, playSound }) => {
  const [lines, setLines] = useState([]);
  
  useEffect(() => {
    let delay = 0;
    playSound('boot');
    ["INITIALIZING COGITATOR ALPHA-9...", "CONNECTING TO NOOSPHERE...", "AUTHENTICATING GENE-CODE...", "LOADING STC FRAGMENTS...", "BLESSING MACHINE SPIRIT...", "PURGING HERETICAL CACHE...", "ACCESS GRANTED."].forEach((line, index) => {
      delay += Math.random() * 500 + 200;
      setTimeout(() => {
        setLines(prev => [...prev, line]);
        playSound('type');
        if (index === 6) { 
          setTimeout(onComplete, 800);
        }
      }, delay);
    });
  }, []); 

  return (
    <div className="fixed inset-0 bg-black z-[100] p-8 font-mono text-green-500 text-sm flex flex-col justify-end pb-20">
      {lines.map((line, i) => (
        <div key={i} className="mb-1 animate-in fade-in slide-in-from-left-2">{`> ${line}`}</div>
      ))}
      <div className="w-2 h-4 bg-green-500 animate-pulse mt-2" />
    </div>
  );
};

export default function AdministratumForm() {
  // --- STATE MANAGEMENT ---
  const [hasBooted, setHasBooted] = useState(false);
  const [view, setView] = useState('form'); 
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [cogRotation, setCogRotation] = useState(0);
  const [thought, setThought] = useState(THOUGHTS_OF_THE_DAY[0]);
  const [imperialDate, setImperialDate] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [showDice, setShowDice] = useState(false);
  const [showTransmission, setShowTransmission] = useState(false);
  const [showPsychic, setShowPsychic] = useState(false);
  const [showMission, setShowMission] = useState(false);
  const [puritySeals, setPuritySeals] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTheme, setActiveTheme] = useState('green'); // green, amber, cyan
  const [printRequest, setPrintRequest] = useState(false); // New state for print orchestration
  
  const containerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    subjectName: 'Interrogator Gideon',
    homeworld: 'Scintilla',
    serviceNumber: 'INQ-99-DELTA',
    rank: 'Interrogator',
    ordo: 'Hereticus', 
    cellName: 'Cell Rho-17',
    sector: 'Calixis',
    location: 'Hive Sibellus',
    incidentType: 'Sanctioned Psyker Malfunction',
    date: new Date().toISOString().split('T')[0],
    threatLevel: 'Extremis', 
    clearance: 'Magenta',
    description: 'Subject 88-Beta manifested unsanctioned warp phenomena during interrogation. Containment breached. Requesting Grey Knight intervention protocols. The walls are bleeding.',
    witness: 'Servo-skull #455 (Deceased)',
    evidenceList: ['Tainted cogitator core', '3x spent bolt casings', 'Unsanctified Tome'],
    insanity: 15,
    corruption: 5
  });

  const theme = THEMES[activeTheme];

  // --- AUDIO ---
  const playSound = useCallback((type) => {
    if (isMuted || typeof window === 'undefined') return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'type') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else if (type === 'boot') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(880, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
    } else if (type === 'warp') {
      // Spooky warp sound
      osc.type = 'sine';
      lfo.type = 'sawtooth';
      lfo.frequency.value = 10;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfoGain.gain.value = 500;
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 2);
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 2);
      lfo.stop(now + 2);
    } else if (type === 'stamp') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(50, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }, [isMuted]);

  // --- EFFECTS ---
  useEffect(() => {
    const dateObj = new Date(formData.date);
    const year = dateObj.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const dayOfYear = Math.floor((dateObj - startOfYear) / (1000 * 60 * 60 * 24));
    const yearFraction = Math.floor((dayOfYear / 365) * 1000).toString().padStart(3, '0');
    setImperialDate(`0 ${yearFraction} ${year.toString().slice(-3)}.M${Math.floor(year/1000) + 1}`);
  }, [formData.date]);

  useEffect(() => {
    if (saveStatus) {
      const timer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  const cycleTheme = () => {
      playSound('click');
      if (activeTheme === 'green') setActiveTheme('amber');
      else if (activeTheme === 'amber') setActiveTheme('cyan');
      else setActiveTheme('green');
  }

  // --- HANDLERS ---
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const addEvidence = () => { playSound('click'); setFormData(prev => ({ ...prev, evidenceList: [...prev.evidenceList, ''] })); };
  const removeEvidence = (idx) => { setFormData(prev => ({ ...prev, evidenceList: prev.evidenceList.filter((_, i) => i !== idx) })); };
  const handleEvidenceChange = (idx, val) => { 
      const n = [...formData.evidenceList]; 
      n[idx] = val; 
      setFormData(prev => ({ ...prev, evidenceList: n })); 
  };
  const randomizeField = (field) => {
    if (field === 'subjectName') setFormData(prev => ({ ...prev, subjectName: `${getRandom(IMPERIAL_DATA.names)} ${getRandom(IMPERIAL_DATA.surnames)}` }));
    if (field === 'homeworld') setFormData(prev => ({ ...prev, homeworld: getRandom(IMPERIAL_DATA.worlds) }));
  };
  const saveToCogitator = () => { playSound('click'); localStorage.setItem('administratum_data', JSON.stringify(formData)); setSaveStatus('DATA SAVED'); };
  const loadFromCogitator = () => { playSound('click'); const s = localStorage.getItem('administratum_data'); if (s) { setFormData(JSON.parse(s)); setSaveStatus('LOADED'); } };
  
  const transmitData = () => {
    playSound('click');
    setShowTransmission(true);
  };
  const anointMachine = () => {
    playSound('boot');
    setFormData(prev => ({ ...prev, corruption: Math.max(0, prev.corruption - 5) }));
    setSaveStatus('MACHINE SPIRIT APPEASED');
  };

  const cycleThought = () => {
    playSound('click');
    const random = THOUGHTS_OF_THE_DAY[Math.floor(Math.random() * THOUGHTS_OF_THE_DAY.length)];
    setThought(random);
  };

  const triggerTransition = (targetView) => {
    playSound('click');
    setCogRotation(prev => prev + 360);
    setIsTransitioning(true);
    setTimeout(() => {
      setView(targetView);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  // --- PURITY SEALS ---
  const addPuritySeal = (e) => {
    if (view !== 'preview') return;
    playSound('stamp');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPuritySeals(prev => [...prev, { x, y, rotation: Math.random() * 20 - 10 }]);
  };

  const removePuritySeal = (index, e) => {
      e.stopPropagation();
      playSound('click');
      setPuritySeals(prev => prev.filter((_, i) => i !== index));
  };

  // --- PRINT HANDLER ---
  const handlePrint = () => {
    playSound('click');
    // If not in preview, switch to preview first, wait for render, then print
    if (view !== 'preview') {
        setView('preview');
        setPrintRequest(true);
    } else {
        window.print();
    }
  };

  // Effect to handle delayed printing
  useEffect(() => {
      if (printRequest && view === 'preview') {
          const timer = setTimeout(() => {
              window.print();
              setPrintRequest(false);
          }, 500); // 500ms delay to allow render
          return () => clearTimeout(timer);
      }
  }, [view, printRequest]);

  // --- LATEX GENERATOR ---
  const generateLatex = (data, impDate) => {
    const esc = (text) => text.replace(/([&%$#_{}])/g, "\\$1").replace(/~/g, "\\textasciitilde{}").replace(/\^/g, "\\textasciicircum{}");

    let headerTitle = "ORDO HERETICUS";
    let sealColor = "ImperialRed";
    if (data.ordo === 'Xenos') { headerTitle = "ORDO XENOS"; sealColor = "ForestGreen"; }
    if (data.ordo === 'Malleus') { headerTitle = "ORDO MALLEUS"; sealColor = "MidnightBlue"; }

    const evidenceItems = data.evidenceList.map(item => `  \\item ${esc(item)}`).join('\n');

    return `
\\documentclass[a4paper,10pt]{article}
\\usepackage[top=1.5cm, bottom=2cm, left=2cm, right=2cm]{geometry}
\\usepackage{fontspec}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{wallpaper}
\\usepackage{enumitem}

% --- GRIMDARK COLORS ---
\\definecolor{ImperialRed}{RGB}{139,0,0}
\\definecolor{ForestGreen}{RGB}{34, 139, 34}
\\definecolor{MidnightBlue}{RGB}{25, 25, 112}
\\definecolor{Parchment}{RGB}{245, 238, 220}
\\definecolor{InqBlack}{RGB}{20, 20, 20}

\\pagecolor{Parchment}
\\color{InqBlack}

% --- ASSETS ---
\\newcommand{\\confidentialstamp}{
  \\begin{tikzpicture}[remember picture, overlay]
    \\node[draw=${sealColor}, text=${sealColor}, line width=3pt, rotate=25, opacity=0.4, align=center, inner sep=15pt, rounded corners] 
    at (current page.center) {\\fontsize{50}{60}\\selectfont EXCOMMUNICATE\\\\\\fontsize{50}{60}\\selectfont TRAITORIS};
  \\end{tikzpicture}
}

% --- HEADER ---
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{\\textbf{\\large THE HOLY ORDERS OF THE\\\\EMPEROR'S INQUISITION}}
\\fancyhead[R]{\\large \\textbf{${headerTitle}}\\\\Sector ${esc(data.sector)}}
\\fancyfoot[C]{\\footnotesize \\textit{"${esc(thought)}"}}
\\renewcommand{\\headrulewidth}{2pt}
\\renewcommand{\\footrulewidth}{1pt}

\\begin{document}

% --- WATERMARK ---
\\begin{tikzpicture}[remember picture, overlay]
    \\node[opacity=0.05, text=black] at (current page.center) {\\fontsize{300}{300}\\selectfont I};
\\end{tikzpicture}

\\begin{center}
  \\LARGE \\textbf{INVESTIGATION CASE FILE} \\\\
  \\large REF: ${esc(data.serviceNumber)} // ${impDate}
\\end{center}

\\vspace{0.5cm}

\\begin{flushright}
  \\textbf{CLEARANCE:} \\colorbox{black}{\\textcolor{white}{\\textbf{${esc(data.clearance.toUpperCase())}}}}
\\end{flushright}

\\section*{I. OPERATIVE PROFILE}
\\noindent
\\begin{tabularx}{\\textwidth}{|l|X|l|X|}
  \\hline
  \\textbf{Name} & ${esc(data.subjectName)} & \\textbf{Rank} & ${esc(data.rank)} \\\\
  \\hline
  \\textbf{Homeworld} & ${esc(data.homeworld)} & \\textbf{Cell Designation} & ${esc(data.cellName)} \\\\
  \\hline
  \\textbf{Insanity} & ${data.insanity} / 100 & \\textbf{Corruption} & ${data.corruption} / 100 \\\\
  \\hline
\\end{tabularx}

\\section*{II. MISSION PARAMETERS}
\\noindent
\\begin{tabularx}{\\textwidth}{|l|X|l|X|}
  \\hline
  \\textbf{Location} & ${esc(data.location)} & \\textbf{Threat Level} & \\textbf{${esc(data.threatLevel)}} \\\\
  \\hline
  \\textbf{Incident Type} & ${esc(data.incidentType)} & \\textbf{Ordo Jurisdiction} & ${esc(data.ordo)} \\\\
  \\hline
\\end{tabularx}

\\section*{III. INCIDENT LOG}
\\noindent
\\textbf{Description of Events:} \\\\
\\fbox{
  \\parbox{\\dimexpr\\linewidth-2\\fboxsep-2\\fboxrule}{
    \\vspace{0.5em}
    ${esc(data.description)}
    \\vspace{6cm} 
  }
}

\\vspace{0.5cm}

\\section*{IV. EVIDENCE LOCKER}
\\noindent
\\begin{itemize}[label=\\textbullet, leftmargin=*]
${evidenceItems}
\\end{itemize}

\\section*{V. WITNESS TESTIMONY}
\\noindent
\\textbf{Witness Identity:} ${esc(data.witness)} \\\\
\\textit{Testimony recorded via servo-skull auto-quill.}

\\vspace{1cm}

\\begin{center}
\\begin{tikzpicture}
  \\node[circle, draw=${sealColor}, line width=2pt, inner sep=10pt] (seal) at (0,0) {\\textbf{INQUISITORIAL SEAL}};
  \\node[text width=4cm, align=center] at (0,-2) {Signed in the Emperor's Name\\\\Lord Inquisitor [REDACTED]};
\\end{tikzpicture}
\\end{center}

\\end{document}
    `;
  };

  const handleDownload = () => {
    playSound('click');
    const latex = generateLatex(formData, imperialDate);
    const blob = new Blob([latex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casefile_${formData.serviceNumber}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!hasBooted) return <Boot onComplete={() => setHasBooted(true)} playSound={playSound} />;

  // --- RENDER ---
  return (
    <div ref={containerRef} className="min-h-screen bg-[#020202] font-mono p-4 md:p-8 flex items-center justify-center selection:bg-red-900 selection:text-white overflow-hidden relative text-stone-400">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Special+Elite&display=swap');
        
        .font-gothic { font-family: 'Cinzel', serif; }
        .font-typewriter { font-family: 'Special Elite', monospace; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }

        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Reset root constraints */
          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }

          /* Hide all UI elements */
          body * { 
            visibility: hidden; 
          }
          
          /* Only show the printable area */
          #printable-area, #printable-area * { 
            visibility: visible; 
          }
          
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto !important;
            margin: 0;
            padding: 0;
            background: #e8e4d9 !important; /* Keep parchment color */
            color: black !important;
            overflow: visible !important;
            z-index: 9999;
          }
          
          /* Force hide common UI classes */
          .no-print, .no-print * { 
            display: none !important; 
          }
        }
      `}</style>

      {/* GLOBAL CRT EFFECTS - Hidden on Print */}
      <div className="fixed inset-0 pointer-events-none z-[100] shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] rounded-[2rem] border-[1px] border-[#222] no-print" />
      <div className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay opacity-10 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ea/Settings_noise.png')] animate-[pulse_0.1s_infinite] no-print" />
      <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,4px_100%] no-print" />
      
      {/* DYNAMIC GLOW BASED ON THEME */}
      <div className={`fixed inset-0 pointer-events-none z-0 bg-radial-gradient ${theme.bg} to-transparent transition-colors duration-1000 no-print`} />

      {/* OVERLAYS */}
      <DiceRoller isOpen={showDice} onClose={() => setShowDice(false)} playSound={playSound} theme={theme} />
      <PsychicModal isOpen={showPsychic} onClose={() => setShowPsychic(false)} playSound={playSound} theme={theme} />
      <MissionModal isOpen={showMission} onClose={() => setShowMission(false)} playSound={playSound} theme={theme} />
      <TransmissionModal isOpen={showTransmission} onClose={() => setShowTransmission(false)} playSound={playSound} />
      
      {/* NEWS TICKER */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-red-900/50 h-8 flex items-center overflow-hidden z-[80] no-print">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-[0.65rem] font-bold tracking-widest text-red-700 font-mono">
                {SECTOR_NEWS.map((news, i) => <span key={i} className="flex items-center gap-2"><Skull size={10} /> {news}</span>)}
            </div>
      </div>

      <div 
        className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 border border-stone-800 shadow-[0_0_80px_rgba(0,0,0,1)] bg-[#050505] rounded-sm overflow-hidden mb-8 transition-transform duration-100 no-print-container"
        style={{ transform: `translate(${Math.random() * (formData.corruption/50)}px, ${Math.random() * (formData.corruption/50)}px)` }} // Glitch effect
      >
        
        {/* SIDEBAR */}
        <div className="lg:col-span-3 bg-[#080808] border-r border-stone-800 p-6 flex flex-col relative overflow-hidden no-print">
          <div className="mb-10 text-center relative">
            <div className={`absolute inset-0 bg-stone-500/5 blur-xl rounded-full`} />
            <div className="mb-4 inline-block relative z-10" style={{ transform: `rotate(${cogRotation}deg)`, transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)' }}>
               <Skull className={`w-16 h-16 ${getOrdoColor(formData.ordo)}`} strokeWidth={1.5} />
            </div>
            <h1 className="text-xl font-bold tracking-widest text-stone-200">INQUISITION</h1>
            <p className="text-[0.55rem] uppercase tracking-[0.2em] text-stone-600 mt-1">Terminal 77-A</p>
          </div>

          <div 
            onClick={cycleThought} 
            className="mb-8 p-3 border border-stone-800 bg-[#0c0c0c] text-[0.6rem] text-stone-500 italic cursor-pointer hover:border-stone-600 hover:text-stone-300 transition-all text-center relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-stone-800/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             "{thought}"
          </div>

          <nav className="space-y-2 mb-8">
            <NavButton active={view === 'form'} icon={<Fingerprint size={14} />} label="DATA ENTRY" onClick={() => { playSound('click'); setView('form'); }} color={theme.primary} playSound={playSound} />
            <NavButton active={view === 'preview'} icon={<Eye size={14} />} label="PREVIEW" onClick={() => { playSound('click'); setView('preview'); }} color={theme.primary} playSound={playSound} />
            <NavButton active={view === 'latex'} icon={<Terminal size={14} />} label="EXPORT TO STC" onClick={() => { playSound('click'); setView('latex'); }} color={theme.primary} playSound={playSound} />
          </nav>

          <div className="mb-8 border-t border-stone-800 pt-6">
             <div className="text-[0.6rem] uppercase text-stone-600 mb-2 font-bold tracking-widest">Acolyte Tools</div>
             <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { playSound('click'); setShowDice(true); }} className="bg-stone-900 border border-stone-700 p-2 text-stone-400 hover:text-white hover:border-white transition-all flex flex-col items-center gap-1 group">
                   <Dices size={16} className="group-hover:animate-bounce" />
                   <span className="text-[0.6rem] uppercase">Dice</span>
                </button>
                <button onClick={() => { playSound('click'); setShowPsychic(true); }} className="bg-stone-900 border border-stone-700 p-2 text-purple-400 hover:text-purple-200 hover:border-purple-500 transition-all flex flex-col items-center gap-1 group">
                   <Zap size={16} className="group-hover:animate-pulse" />
                   <span className="text-[0.6rem] uppercase">Warp</span>
                </button>
                <button onClick={() => { playSound('click'); setShowMission(true); }} className="bg-stone-900 border border-stone-700 p-2 text-stone-400 hover:text-white hover:border-white transition-all flex flex-col items-center gap-1 group">
                   <Target size={16} className="group-hover:rotate-45" />
                   <span className="text-[0.6rem] uppercase">Mission</span>
                </button>
                <button onClick={anointMachine} className="bg-stone-900 border border-stone-700 p-2 text-stone-400 hover:text-white hover:border-white transition-all flex flex-col items-center gap-1 group">
                   <Hammer size={16} className="group-hover:-rotate-12" />
                   <span className="text-[0.6rem] uppercase">Anoint</span>
                </button>
             </div>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div className="lg:col-span-9 bg-[#0b0b0b] min-h-[700px] flex flex-col relative">
           {/* Top Bar */}
           <div className="border-b border-stone-800 p-2 flex justify-between items-center bg-[#080808] z-20 no-print">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${theme.bg.replace('/10','')} animate-pulse shadow-[0_0_5px] ${theme.primary}`} />
                 <span className="text-[0.6rem] uppercase tracking-widest text-stone-600">Uplink: Active // {imperialDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                 {saveStatus && <span className={`text-[0.6rem] ${theme.primary} animate-pulse`}>{saveStatus}</span>}
                 <div className="h-4 w-[1px] bg-stone-800 mx-2" />
                 <button onClick={cycleTheme} className="text-stone-500 hover:text-white p-1" title="Cycle Phosphor Theme"><Palette size={14} /></button>
                 <button onClick={() => setIsMuted(!isMuted)} className="text-stone-500 hover:text-white p-1">{isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}</button>
                 <button onClick={saveToCogitator} className="text-stone-500 hover:text-white p-1"><Save size={14} /></button>
                 <button onClick={loadFromCogitator} className="text-stone-500 hover:text-white p-1"><RotateCcw size={14} /></button>
                 <button onClick={transmitData} className="text-stone-500 hover:text-emerald-500 p-1"><Send size={14} /></button>
                 <button onClick={handlePrint} className="text-stone-500 hover:text-emerald-500 p-1" title="Print to PDF"><Printer size={14} /></button>
              </div>
           </div>

           {/* Content */}
           <div className="flex-1 p-8 relative overflow-hidden">
             {view === 'form' && (
                  <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500 no-print">
                    <OrdoSelector currentOrdo={formData.ordo} onSelect={(val) => setFormData(prev => ({...prev, ordo: val}))} playSound={playSound} />
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      <InputField label="Acolyte Name" name="subjectName" value={formData.subjectName} onChange={handleChange} width="half" onRandomize={() => randomizeField('subjectName')} playSound={playSound} theme={theme} />
                      <InputField label="Rank" name="rank" value={formData.rank} onChange={handleChange} width="half" playSound={playSound} theme={theme} />
                      <InputField label="Homeworld" name="homeworld" value={formData.homeworld} onChange={handleChange} width="half" onRandomize={() => randomizeField('homeworld')} playSound={playSound} theme={theme} />
                      <InputField label="Cell" name="cellName" value={formData.cellName} onChange={handleChange} width="half" playSound={playSound} theme={theme} />

                      {/* PSYCHO CONDITIONING */}
                      <div className="col-span-2 bg-[#080808] border border-[#222] p-4 my-2 shadow-inner">
                         <div className="flex items-center gap-2 mb-4 text-xs text-stone-500 uppercase font-bold"><Gauge size={12} /> Psycho-Conditioning</div>
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <div className="flex justify-between text-[0.6rem] uppercase text-stone-400 mb-1"><span>Insanity</span><span>{formData.insanity}%</span></div>
                               <input type="range" min="0" max="100" value={formData.insanity} onChange={(e) => { playSound('click'); setFormData(p => ({...p, insanity: e.target.value})); }} className="w-full h-1 bg-stone-800 rounded-lg accent-purple-500" />
                            </div>
                            <div>
                               <div className="flex justify-between text-[0.6rem] uppercase text-stone-400 mb-1"><span>Corruption</span><span>{formData.corruption}%</span></div>
                               <input type="range" min="0" max="100" value={formData.corruption} onChange={(e) => { playSound('click'); setFormData(p => ({...p, corruption: e.target.value})); }} className="w-full h-1 bg-stone-800 rounded-lg accent-red-600" />
                            </div>
                         </div>
                      </div>

                      <InputField label="Sector" name="sector" value={formData.sector} onChange={handleChange} width="half" playSound={playSound} theme={theme} />
                      <InputField label="Location" name="location" value={formData.location} onChange={handleChange} width="half" playSound={playSound} theme={theme} />
                      <div className="col-span-2 mt-4">
                        <label className="block text-[0.65rem] uppercase tracking-widest text-stone-500 mb-1 flex items-center gap-2">
                          <ChevronRight size={10} className="text-stone-600" /> Incident Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={(e) => { playSound('type'); handleChange(e); }}
                          rows={6}
                          className={`w-full bg-[#050505] border ${theme.border} ${theme.primary} p-3 text-sm focus:outline-none focus:bg-[#0a0a0a] transition-all uppercase placeholder-stone-800 font-mono tracking-tight shadow-inner focus:${theme.glow}`}
                        />
                      </div>
                      <div className="col-span-2 mt-4">
                        <div className="flex justify-between items-center mb-2">
                           <label className={`block text-[0.65rem] uppercase tracking-widest ${theme.primary} flex items-center gap-2`}><ChevronRight size={10} /> Evidence Locker</label>
                           <button onClick={addEvidence} className={`text-[0.6rem] text-stone-400 hover:text-white border border-stone-800 px-2 py-1 hover:${theme.border} transition-colors uppercase`}><Plus size={10} /> Add Item</button>
                        </div>
                        <div className="space-y-1">{formData.evidenceList.map((item, idx) => <EvidenceItem key={idx} text={item} index={idx} onChange={handleEvidenceChange} onRemove={removeEvidence} playSound={playSound} theme={theme} />)}</div>
                      </div>
                    </div>
                  </div>
             )}

             {view === 'preview' && (
                  <div 
                    id="printable-area" 
                    className="h-full bg-[#e8e4d9] text-black font-gothic p-12 shadow-inner overflow-y-auto custom-scrollbar relative cursor-crosshair print:h-auto print:overflow-visible print:bg-white"
                    onClick={addPuritySeal}
                  >
                     {/* Preview Content */}
                     <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] no-print" />
                     <div className="absolute inset-0 pointer-events-none bg-red-900 mix-blend-overlay transition-opacity duration-1000 no-print" style={{ opacity: formData.corruption / 200 }} />
                     
                     <div className="absolute top-2 right-2 text-[0.5rem] bg-black/10 px-2 py-1 rounded pointer-events-none animate-pulse no-print">
                        CLICK TO STAMP PURITY SEAL
                     </div>

                     {/* Default Top Left Purity Seal - Always Visible */}
                     <div className="absolute -top-4 -left-4 z-10 pointer-events-none drop-shadow-xl print:drop-shadow-none">
                        <div className="w-24 h-24 bg-red-800 rounded-full border-4 border-red-900 flex items-center justify-center shadow-lg relative print:bg-gray-800 print:border-black">
                            <Skull className="text-red-950 w-12 h-12 print:text-white" />
                        </div>
                        <div className="absolute top-20 left-6 w-16 h-48 bg-[#e8dbc3] border border-stone-400 transform rotate-3 p-3 text-[0.5rem] font-serif leading-tight text-stone-800 shadow-md text-center print:bg-white print:border-black">
                            <strong>IMPERATOR VULT</strong><br/><br/>
                            <span className="italic">May His light guide the faithful and burn the unclean.</span>
                        </div>
                        <div className="absolute top-20 left-10 w-12 h-40 bg-[#e8dbc3] border border-stone-400 transform -rotate-2 p-2 text-[0.5rem] font-serif leading-tight text-stone-800 shadow-md text-center print:bg-white print:border-black">
                             <strong>X-99</strong><br/><br/>PURITAS
                        </div>
                     </div>

                     {/* Dynamic Purity Seals */}
                     {puritySeals.map((seal, i) => (
                      <div 
                        key={i} 
                        onClick={(e) => removePuritySeal(i, e)}
                        className="absolute z-50 pointer-events-auto drop-shadow-xl print:drop-shadow-none cursor-pointer hover:scale-105 transition-transform"
                        title="Click to remove"
                        style={{ top: `${seal.y}%`, left: `${seal.x}%`, transform: `rotate(${seal.rotation}deg)` }}
                      >
                         <div className="w-16 h-16 bg-red-800 rounded-full border-4 border-red-900 flex items-center justify-center shadow-lg relative print:bg-gray-800 print:border-black">
                            <Skull className="text-red-950 w-8 h-8 print:text-white" />
                        </div>
                        <div className="absolute top-12 left-4 w-10 h-24 bg-[#e8dbc3] border border-stone-400 transform rotate-2 p-2 text-[0.3rem] font-serif leading-tight text-stone-700 shadow-md text-center print:bg-white print:border-black">
                            SANCTIFIED
                        </div>
                      </div>
                    ))}
                     
                     <div className="relative z-10 space-y-8 mt-8">
                        <div className="flex justify-between items-start border-b-4 border-black pb-4 mb-6">
                           <div className="text-center w-32"></div>
                           <div className="flex-1 text-center pt-4">
                              <div className="text-[0.6rem] uppercase tracking-[0.5em] font-bold mb-2">The Holy Orders of the Emperor's Inquisition</div>
                              <h2 className="text-5xl font-black uppercase tracking-tighter scale-y-110 mb-2">ORDO {formData.ordo}</h2>
                              <p className="text-sm font-bold uppercase tracking-[0.3em] border-t border-b border-black py-1 inline-block">Sector {formData.sector} // Sub-Sector {formData.location}</p>
                           </div>
                           <div className="w-32 text-right pt-4">
                                <div className="border-4 border-black p-2 inline-block text-center transform rotate-1">
                                   <div className="text-[0.6rem] font-black bg-black text-white px-2 py-1 mb-1">REF CODE</div>
                                   <div className="text-sm font-typewriter font-bold">{formData.serviceNumber}</div>
                                </div>
                           </div>
                        </div>

                        {/* DATA GRID */}
                        <div className="grid grid-cols-2 gap-0 border-4 border-black bg-white/60">
                           <div className="border-r border-b border-black p-3">
                              <div className="text-[0.5rem] uppercase font-bold text-stone-500 mb-1">Subject Identity</div>
                              <div className="font-typewriter text-lg font-bold">{formData.subjectName}</div>
                           </div>
                           <div className="border-b border-black p-3">
                              <div className="text-[0.5rem] uppercase font-bold text-stone-500 mb-1">Inquisitorial Rank</div>
                              <div className="font-typewriter text-lg font-bold">{formData.rank}</div>
                           </div>
                           <div className="border-r border-black p-3">
                              <div className="text-[0.5rem] uppercase font-bold text-stone-500 mb-1">Homeworld Origin</div>
                              <div className="font-typewriter">{formData.homeworld}</div>
                           </div>
                           <div className="p-3">
                              <div className="text-[0.5rem] uppercase font-bold text-stone-500 mb-1">Current Threat Status</div>
                              <div className="font-black text-red-900 uppercase tracking-widest">{formData.threatLevel}</div>
                           </div>
                        </div>

                        {/* REPORT BODY */}
                        <div className="relative">
                           <h3 className="text-lg font-bold uppercase border-b-2 border-black mb-4 flex justify-between items-end">
                              <span>Incident Report // {imperialDate}</span>
                              <span className="text-[0.6rem] font-normal opacity-50">EYES ONLY - MAGENTA CLEARANCE</span>
                           </h3>
                           <div className="font-typewriter text-sm text-justify leading-7 whitespace-pre-wrap p-4 bg-white/40 border border-black/10 min-h-[150px] relative">
                              {/* Background "Confidential" text */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 overflow-hidden">
                                 <div className="transform -rotate-45 text-6xl font-black uppercase text-black whitespace-nowrap">
                                    Confidential • Confidential • Confidential
                                 </div>
                              </div>
                              {formData.description}
                           </div>
                        </div>

                        {/* EVIDENCE & WITNESS */}
                        <div className="grid grid-cols-3 gap-6">
                           <div className="col-span-2 bg-stone-200/50 p-4 border-l-4 border-black relative">
                                <h4 className="text-xs font-bold uppercase mb-3 flex items-center gap-2"><FileWarning size={14}/> Evidence Locker:</h4>
                                <ul className="list-none space-y-2">
                                   {formData.evidenceList.map((item, i) => (
                                      <li key={i} className="text-xs font-typewriter flex items-start gap-2">
                                         <span className="font-bold">[{i+1}]:</span> {item}
                                      </li>
                                   ))}
                                </ul>
                           </div>
                           <div className="col-span-1 border border-black p-2 flex flex-col items-center justify-center text-center opacity-70">
                               <div className="border-2 border-red-900 rounded-full w-24 h-24 flex items-center justify-center mb-2">
                                  <div className="text-[0.5rem] text-red-900 font-bold transform -rotate-12">
                                     OFFICIAL<br/>SEAL
                                  </div>
                               </div>
                               <div className="text-[0.5rem] uppercase font-bold">Authorized By</div>
                               <div className="font-script text-lg">Inquisitor Vail</div>
                           </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-12 pt-8 border-t-2 border-black flex justify-between items-end relative z-10">
                             <div className="text-xs italic w-2/3 font-serif">
                                "Thought for the Day: {thought}"
                             </div>
                             <div className="text-right">
                                <div className="text-[0.5rem] uppercase font-bold tracking-widest mb-1">Departmento Munitorum</div>
                                <div className="text-[0.6rem] font-typewriter">FORM 1044-AG-DL</div>
                             </div>
                        </div>
                     </div>
                  </div>
             )}

             {view === 'latex' && (
                  <div className="h-full flex flex-col animate-in fade-in duration-500 no-print">
                    <div className="bg-[#050505] p-4 border-b border-stone-800 flex justify-between items-center shadow-lg z-20">
                        <div className="text-xs font-mono text-stone-400">
                             // SOURCE_GENERATOR.EXE<br/>
                             // COMPILING FOR STC PRINT...
                        </div>
                        <button 
                            onClick={handleDownload}
                            className={`bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 transition-all border border-stone-600 hover:border-stone-400`}
                        >
                            <Download size={14} /> Initialize Download
                        </button>
                    </div>
                    <div className="flex-1 bg-black p-4 overflow-hidden relative">
                        <pre className="text-[0.65rem] text-green-600 font-mono h-full overflow-auto custom-scrollbar p-2 font-bold selection:bg-green-900 selection:text-white">
                            {generateLatex(formData, imperialDate)}
                        </pre>
                        {/* Scanline overlay for code view */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px]" />
                    </div>
                  </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}

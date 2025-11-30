import React, { useState } from 'react';
import CosmicSyndicate from './CosmicSyndicate';
import InquisitionDashboard from './InquisitionDashboard';
import { Skull, Rocket, ShieldAlert, ChevronRight } from 'lucide-react';

// Add this CSS for the selection screen
const SelectionScreenStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Share+Tech+Mono&display=swap');
    
    .selection-root {
      background: radial-gradient(circle at center, #1a1a1a 0%, #000000 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Share Tech Mono', monospace;
      position: relative;
      overflow: hidden;
    }
    
    .selection-scanlines {
      background: linear-gradient(to bottom, transparent 0%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1));
      background-size: 100% 4px;
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 10;
    }
    
    .selection-container {
      background: rgba(5,5,5,0.95);
      border: 4px solid #5a2e2e;
      box-shadow: 0 0 50px rgba(197,160,89,0.3), inset 0 0 30px rgba(0,0,0,0.5);
      max-width: 900px;
      width: 90%;
      padding: 3rem;
      position: relative;
      z-index: 20;
    }
    
    .selection-title {
      font-family: 'Cinzel', serif;
      font-size: 3rem;
      font-weight: 900;
      text-align: center;
      margin-bottom: 1rem;
      background: linear-gradient(to bottom, #e5c079, #8a6e3e);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: 0.1em;
    }
    
    .selection-subtitle {
      text-align: center;
      color: #ff3333;
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      margin-bottom: 3rem;
    }
    
    .interface-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .interface-card {
      background: #111;
      border: 2px solid #333;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .interface-card:hover {
      border-color: #c5a059;
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(197,160,89,0.2);
    }
    
    .interface-card:active {
      transform: translateY(-2px);
    }
    
    .interface-icon {
      width: 5rem;
      height: 5rem;
      margin: 0 auto 1rem;
      color: #c5a059;
    }
    
    .interface-title {
      font-family: 'Cinzel', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #c5a059;
      margin-bottom: 0.5rem;
    }
    
    .interface-desc {
      font-size: 0.8rem;
      color: #a0a0a0;
      line-height: 1.4;
    }
    
    .clearance-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.6rem;
      color: #ff3333;
      border: 1px solid #ff3333;
      padding: 0.25rem 0.5rem;
      letter-spacing: 0.1em;
    }
    
    .imperial-seal {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      width: 6rem;
      height: 6rem;
      border: 2px solid #5a2e2e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.2;
    }
    
    .flicker {
      animation: flicker 0.15s infinite;
    }
    
    @keyframes flicker {
      0% { opacity: 0.98; } 10% { opacity: 0.90; } 20% { opacity: 1; } 
      50% { opacity: 0.95; } 100% { opacity: 0.99; }
    }
    
    @media (max-width: 768px) {
      .interface-grid {
        grid-template-columns: 1fr;
      }
      .selection-title {
        font-size: 2rem;
      }
    }
  `}</style>
);

function App() {
  const [currentPage, setCurrentPage] = useState('selection');

  // SELECTION SCREEN
  if (currentPage === 'selection') {
    return (
      <div className="selection-root">
        <SelectionScreenStyles />
        <div className="selection-scanlines"></div>
        
        <div className="selection-container flicker">
          {/* Decorative Elements */}
          <div className="imperial-seal">
            <Skull className="w-8 h-8 text-[#5a2e2e]" />
          </div>
          
          <h1 className="selection-title">INQUISITORIAL CONTROL</h1>
          <p className="selection-subtitle">SELECT OPERATIONAL INTERFACE</p>
          
          <div className="interface-grid">
            {/* COSMIC SYNDICATE OPTION */}
            <div 
              className="interface-card btn-interactive"
              onClick={() => setCurrentPage('cosmic-syndicate')}
            >
              <div className="clearance-badge">CLEARANCE: AMBER</div>
              <Rocket className="interface-icon" />
              <h2 className="interface-title">COSMIC SYNDICATE</h2>
              <p className="interface-desc">
                Neural interface for data brokerage, cosmic payload delivery, and interstellar market manipulation. 
                For the Inquisitor who knows that information is the greatest weapon.
              </p>
            </div>
            
            {/* DARK HERESY OPTION */}
            <div 
              className="interface-card btn-interactive"
              onClick={() => setCurrentPage('dark-heresy')}
            >
              <div className="clearance-badge">CLEARANCE: MAGENTA</div>
              <ShieldAlert className="interface-icon" />
              <h2 className="interface-title">DARK HERESY</h2>
              <p className="interface-desc">
                Tactical auspex, retinue command, and Exterminatus deployment. 
                For the Inquisitor whose tolerance for heresy is as low as their mercy.
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.7rem', color: '#5a2e2e' }}>
            <p>+++ The Emperor Protects. The Inquisitor Expects. +++</p>
          </div>
        </div>
      </div>
    );
  }

  // COSMIC SYNDICATE PAGE
  if (currentPage === 'cosmic-syndicate') {
    return <CosmicSyndicate onNavigate={() => setCurrentPage('selection')} />;
  }

  // DARK HERESY PAGE
  if (currentPage === 'dark-heresy') {
    return <InquisitionDashboard onNavigate={() => setCurrentPage('selection')} />;
  }

  // Fallback (should never reach)
  return null;
}

export default App;

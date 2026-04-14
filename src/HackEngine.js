// ============================================================================
// HACK ENGINE -- Cinematic "Being Hacked" Visual Effects Engine
// ============================================================================
// Pure JS class that manipulates the DOM directly. Imported by React components.
// Fetches /api/hack-status -- if { active: true }, boots all visual effects.
// If inactive or errored, does absolutely nothing.
// ============================================================================

// HACK ENGINE -- TEXT SCRAMBLE (standalone helper class)
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}--=+*^?#$%&\u65E5\uFF8A\uFF90\uFF8B\uFF70\uFF73\uFF7C\uFF85\u0030\u0031';
    this.frameRequest = null;
    this.frame = 0;
    this.queue = [];
    this.resolve = null;
    this.update = this.update.bind(this);
  }

  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => {
      this.resolve = resolve;
    });
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end, char: '' });
    }
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += '<span class="glitch-char" style="color:#00ff41">' + char + '</span>';
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      if (this.resolve) this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }

  destroy() {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
  }
}


// ============================================================================
// MAIN HACK ENGINE CLASS
// ============================================================================
class HackEngine {
  constructor() {
    this.active = false;
    this.paused = false;
    this.effects = new Map();
    this.intervals = [];
    this.timeouts = [];
    this.animationFrames = [];
    this.injectedElements = [];
    this.textScramblers = [];
    this.originalTexts = new Map();
    this.originalCursor = '';
    this.matrixRafId = null;
    this.cursorRafId = null;
    this.isMobile = false;
    this.isTouch = false;

    // Pre-built combining char arrays for Zalgo effect
    // HACK ENGINE -- ZALGO CORRUPTION (pre-built arrays)
    this.combiningAbove = [];
    for (let i = 0x0300; i <= 0x036F; i++) {
      this.combiningAbove.push(String.fromCharCode(i));
    }
    this.combiningBelow = [];
    for (let i = 0x0316; i <= 0x0362; i++) {
      this.combiningBelow.push(String.fromCharCode(i));
    }

    // Cursor trail ring buffer (Float32Array for performance)
    // 12 positions, x/y interleaved = 24 floats
    this.cursorTrailBuffer = new Float32Array(24);
    this.cursorTrailIndex = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorGhosts = [];

    // Visibility change handler reference
    this._onVisibilityChange = this._onVisibilityChange.bind(this);

    // Matrix rain state
    this.matrixCanvas = null;
    this.matrixCtx = null;
    this.matrixColumns = [];
    this.matrixSpeeds = [];
    this.matrixSpeedMultiplier = 1;

    // Breach burst state
    this.breachTimeoutId = null;
  }

  // --------------------------------------------------------------------------
  // INIT -- Fetch DB flag, boot all effects if active
  // --------------------------------------------------------------------------
  async init() {
    try {
      const response = await fetch('/api/hack-status', { method: 'GET' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data || data.active !== true) return;
    } catch (e) {
      // Error fetching status -- do nothing
      return;
    }

    this.active = true;
    this.isMobile = window.innerWidth < 768;
    this.isTouch = 'ontouchstart' in window;

    // Listen for visibility changes to pause/resume
    document.addEventListener('visibilitychange', this._onVisibilityChange);

    // Boot all effects
    this.startEffect('matrixRain', () => this._bootMatrixRain());
    this.startEffect('textScramble', () => this._bootTextScramble());
    this.startEffect('zalgoCorruption', () => this._bootZalgoCorruption());
    this.startEffect('chromaticAberration', () => this._bootChromaticAberration());
    this.startEffect('terminalPanel', () => this._bootTerminalPanel());
    this.startEffect('cursorTrail', () => this._bootCursorTrail());
    this.startEffect('imageGlitch', () => this._bootImageGlitch());
    this.startEffect('screenShake', () => this._bootScreenShake());
    this.startEffect('scanlineOverlay', () => this._bootScanlineOverlay());
  }

  // --------------------------------------------------------------------------
  // startEffect -- registers and starts each effect
  // --------------------------------------------------------------------------
  startEffect(name, fn) {
    if (this.effects.has(name)) return;
    this.effects.set(name, { name, active: true });
    fn();
  }

  // --------------------------------------------------------------------------
  // PAUSE / RESUME (Page Visibility API)
  // --------------------------------------------------------------------------
  _onVisibilityChange() {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  }

  pause() {
    if (!this.active || this.paused) return;
    this.paused = true;

    // Pause matrix rain rAF
    if (this.matrixRafId) {
      cancelAnimationFrame(this.matrixRafId);
      this.matrixRafId = null;
    }

    // Pause cursor trail rAF
    if (this.cursorRafId) {
      cancelAnimationFrame(this.cursorRafId);
      this.cursorRafId = null;
    }

    // Pause all registered rAFs
    for (const id of this.animationFrames) {
      cancelAnimationFrame(id);
    }

    // Pause all intervals
    for (const id of this.intervals) {
      clearInterval(id);
    }
  }

  resume() {
    if (!this.active || !this.paused) return;
    this.paused = false;

    // Resume matrix rain
    if (this.matrixCanvas) {
      this._matrixRainLoop();
    }

    // Resume cursor trail
    if (!this.isTouch && this.effects.has('cursorTrail')) {
      this._cursorTrailLoop();
    }

    // Note: intervals and timeouts that were cleared cannot be trivially
    // resumed. The effects that rely on setInterval re-register on resume
    // where critical. The text scramble and zalgo effects use setTimeout
    // chains that self-renew, so they pick up again once un-hidden.
  }

  // --------------------------------------------------------------------------
  // DESTROY -- removes all injected DOM, clears timers, restores cursor
  // --------------------------------------------------------------------------
  destroy() {
    this.active = false;
    this.paused = false;

    // Remove visibility listener
    document.removeEventListener('visibilitychange', this._onVisibilityChange);

    // Cancel all animation frames
    if (this.matrixRafId) cancelAnimationFrame(this.matrixRafId);
    if (this.cursorRafId) cancelAnimationFrame(this.cursorRafId);
    for (const id of this.animationFrames) {
      cancelAnimationFrame(id);
    }
    this.animationFrames = [];

    // Clear all intervals
    for (const id of this.intervals) {
      clearInterval(id);
    }
    this.intervals = [];

    // Clear all timeouts
    for (const id of this.timeouts) {
      clearTimeout(id);
    }
    this.timeouts = [];

    // Clear breach timeout
    if (this.breachTimeoutId) {
      clearTimeout(this.breachTimeoutId);
      this.breachTimeoutId = null;
    }

    // Destroy text scramblers
    for (const scrambler of this.textScramblers) {
      scrambler.destroy();
    }
    this.textScramblers = [];

    // Restore original texts
    for (const [el, text] of this.originalTexts.entries()) {
      el.innerHTML = text;
    }
    this.originalTexts.clear();

    // Remove all injected elements
    const injected = document.querySelectorAll('[data-hack-engine="true"]');
    injected.forEach((el) => el.remove());
    this.injectedElements = [];

    // Remove glitch-layer class from all elements
    const glitched = document.querySelectorAll('.glitch-layer');
    glitched.forEach((el) => {
      el.classList.remove('glitch-layer');
      el.removeAttribute('data-text');
    });

    // Remove hue-rotate attribute
    if (this._hueWrapper) {
      this._hueWrapper.removeAttribute('data-hack-hue');
      this._hueWrapper = null;
    }

    // Remove image glitch attributes
    const glitchedImgs = document.querySelectorAll('[data-hack-engine-img="true"]');
    glitchedImgs.forEach((img) => img.removeAttribute('data-hack-engine-img'));

    // Disconnect observers
    if (this._matrixResizeObserver) {
      this._matrixResizeObserver.disconnect();
      this._matrixResizeObserver = null;
    }
    if (this._imgObserver) {
      this._imgObserver.disconnect();
      this._imgObserver = null;
    }

    // Remove mousemove listener
    if (this._onMouseMove) {
      document.removeEventListener('mousemove', this._onMouseMove);
    }

    // Restore cursor
    if (this.originalCursor !== undefined) {
      document.body.style.cursor = this.originalCursor;
    }

    // Clear effects registry
    this.effects.clear();
  }


  // ==========================================================================
  // EFFECT 1 -- MATRIX RAIN CANVAS
  // ==========================================================================
  // HACK ENGINE -- MATRIX RAIN
  _bootMatrixRain() {
    const chars =
      '\u30E9\u30C9\u30AF\u30EA\u30D5\u30DE\u30E9\u30BD\u30F3\u308F\u305F\u3057\u30EF\u30BF\u30B7\u65E5\uFF8A\uFF90\uFF8B\uFF70\uFF73\uFF7C\uFF85\uFF93\uFF86\uFF7B\uFF9C\uFF82\uFF75\uFF98\uFF71\uFF8E\uFF83\uFF8F\uFF79\uFF92\uFF74\uFF76\uFF77\uFF91\uFF95\uFF97\uFF7E\uFF88\uFF7D\uFF80\uFF87\uFF8D01010011!<>-_\\/[]{}--=+*^?#$%';
    const charArray = Array.from(chars);
    const fontSize = 14;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.setAttribute('data-hack-engine', 'true');
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;will-change:transform;';
    document.body.appendChild(canvas);
    this.injectedElements.push(canvas);
    this.matrixCanvas = canvas;

    const ctx = canvas.getContext('2d');
    this.matrixCtx = ctx;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const totalColumns = Math.floor(canvas.width / fontSize);
      const activeColumns = this.isMobile
        ? Math.floor(totalColumns / 2)
        : totalColumns;

      this.matrixColumns = new Array(activeColumns);
      this.matrixSpeeds = new Array(activeColumns);
      for (let i = 0; i < activeColumns; i++) {
        this.matrixColumns[i] = Math.random() * canvas.height;
        this.matrixSpeeds[i] = 0.5 + Math.random() * 1.5;
      }
    };

    resizeCanvas();

    // ResizeObserver for viewport resize recalculation
    const ro = new ResizeObserver(() => {
      this.isMobile = window.innerWidth < 768;
      resizeCanvas();
    });
    ro.observe(document.documentElement);

    // Store cleanup ref
    this._matrixResizeObserver = ro;

    // Start the loop
    this._matrixRainLoop();
  }

  _matrixRainLoop() {
    if (!this.active || this.paused) return;

    const canvas = this.matrixCanvas;
    const ctx = this.matrixCtx;
    const chars =
      '\u30E9\u30C9\u30AF\u30EA\u30D5\u30DE\u30E9\u30BD\u30F3\u308F\u305F\u3057\u30EF\u30BF\u30B7\u65E5\uFF8A\uFF90\uFF8B\uFF70\uFF73\uFF7C\uFF85\uFF93\uFF86\uFF7B\uFF9C\uFF82\uFF75\uFF98\uFF71\uFF8E\uFF83\uFF8F\uFF79\uFF92\uFF74\uFF76\uFF77\uFF91\uFF95\uFF97\uFF7E\uFF88\uFF7D\uFF80\uFF87\uFF8D01010011!<>-_\\/[]{}--=+*^?#$%';
    const charArray = Array.from(chars);
    const fontSize = 14;

    // Fade effect
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < this.matrixColumns.length; i++) {
      const char = charArray[Math.floor(Math.random() * charArray.length)];
      const x = i * fontSize;
      const y = this.matrixColumns[i];

      // Leading char is bright green, trailing is dark green
      ctx.fillStyle = '#00ff41';
      ctx.fillText(char, x, y);

      // Draw a slightly darker char a few rows behind
      if (y > fontSize * 2) {
        ctx.fillStyle = '#003b00';
        const trailChar = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(trailChar, x, y - fontSize * 2);
      }

      // Advance column position
      this.matrixColumns[i] += fontSize * this.matrixSpeeds[i] * this.matrixSpeedMultiplier;

      // Reset column when it goes past the bottom
      if (this.matrixColumns[i] > canvas.height && Math.random() > 0.975) {
        this.matrixColumns[i] = 0;
      }
    }

    this.matrixRafId = requestAnimationFrame(() => this._matrixRainLoop());
  }


  // ==========================================================================
  // EFFECT 2 -- TEXT SCRAMBLE / DECODE
  // ==========================================================================
  // HACK ENGINE -- TEXT SCRAMBLE
  _bootTextScramble() {
    const selectors = 'h1, h2, h3, [class*="hero"] span, [class*="hero"] p, nav a, button';
    const elements = document.querySelectorAll(selectors);

    elements.forEach((el) => {
      // Store original text
      const originalText = el.innerText;
      if (!originalText || originalText.trim().length === 0) return;
      this.originalTexts.set(el, el.innerHTML);

      const scrambler = new TextScramble(el);
      this.textScramblers.push(scrambler);

      // Staggered start: random 0-4s delay
      const initialDelay = Math.random() * 4000;

      const runScramble = () => {
        if (!this.active || this.paused) return;
        scrambler.setText(originalText).then(() => {
          // Re-trigger every 8-15 seconds (randomized)
          const nextDelay = 8000 + Math.random() * 7000;
          const tid = setTimeout(() => runScramble(), nextDelay);
          this.timeouts.push(tid);
        });
      };

      const tid = setTimeout(() => runScramble(), initialDelay);
      this.timeouts.push(tid);
    });
  }


  // ==========================================================================
  // EFFECT 3 -- ZALGO / UNICODE CORRUPTION
  // ==========================================================================
  // HACK ENGINE -- ZALGO CORRUPTION
  _bootZalgoCorruption() {
    const maxIntensity = this.isMobile ? 1 : 2;

    // Gather paragraph elements (NOT headings)
    const paragraphs = document.querySelectorAll('p, [class*="description"], [class*="text-"]');
    const targets = [];

    paragraphs.forEach((el) => {
      const text = el.innerText;
      if (!text || text.trim().length < 5) return;
      if (!this.originalTexts.has(el)) {
        this.originalTexts.set(el, el.innerHTML);
      }
      targets.push(el);
    });

    if (targets.length === 0) return;

    // Slowly corrupt over 3s (intensity 0 -> maxIntensity)
    const steps = 10;
    const stepDuration = 300; // 3000ms / 10 steps
    for (let step = 0; step <= steps; step++) {
      const intensity = (step / steps) * maxIntensity;
      const tid = setTimeout(() => {
        if (!this.active) return;
        targets.forEach((el) => {
          const original = this.originalTexts.get(el);
          if (!original) return;
          // Extract text from stored HTML
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = original;
          const plainText = tempDiv.textContent || tempDiv.innerText || '';
          el.textContent = this._zalgoCorrupt(plainText, intensity);
        });
      }, step * stepDuration);
      this.timeouts.push(tid);
    }

    // Every 5s: randomly spike 1-3 words to intensity 3 for 800ms
    const spikeLoop = () => {
      if (!this.active) return;
      const target = targets[Math.floor(Math.random() * targets.length)];
      if (target) {
        const original = this.originalTexts.get(target);
        if (original) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = original;
          const plainText = tempDiv.textContent || tempDiv.innerText || '';
          const words = plainText.split(/\s+/);
          const spikeCount = 1 + Math.floor(Math.random() * 3);
          const spikedWords = [...words];
          for (let s = 0; s < spikeCount && s < words.length; s++) {
            const idx = Math.floor(Math.random() * words.length);
            spikedWords[idx] = this._zalgoCorrupt(words[idx], 3);
          }
          target.textContent = spikedWords.join(' ');

          // Restore after 800ms
          const restoreTid = setTimeout(() => {
            if (!this.active) return;
            target.textContent = this._zalgoCorrupt(plainText, maxIntensity);
          }, 800);
          this.timeouts.push(restoreTid);
        }
      }

      const nextTid = setTimeout(spikeLoop, 5000);
      this.timeouts.push(nextTid);
    };

    // Start spike loop after initial corruption finishes
    const startSpikeTid = setTimeout(spikeLoop, 3500);
    this.timeouts.push(startSpikeTid);
  }

  _zalgoCorrupt(text, intensity) {
    if (intensity <= 0) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += text[i];
      if (text[i] === ' ') continue; // skip spaces

      const aboveCount = Math.floor(Math.random() * (intensity * 2 + 1));
      const belowCount = Math.floor(Math.random() * (intensity * 2 + 1));

      for (let a = 0; a < aboveCount; a++) {
        result += this.combiningAbove[
          Math.floor(Math.random() * this.combiningAbove.length)
        ];
      }
      for (let b = 0; b < belowCount; b++) {
        result += this.combiningBelow[
          Math.floor(Math.random() * this.combiningBelow.length)
        ];
      }
    }
    return result;
  }


  // ==========================================================================
  // EFFECT 4 -- CSS CHROMATIC ABERRATION
  // ==========================================================================
  // HACK ENGINE -- CHROMATIC ABERRATION
  _bootChromaticAberration() {
    // Inject style element
    const style = document.createElement('style');
    style.setAttribute('data-hack-engine', 'true');
    style.textContent = `
      .glitch-layer {
        position: relative;
      }
      .glitch-layer::before {
        content: attr(data-text);
        position: absolute;
        left: 0;
        top: 0;
        color: #ff00ff;
        clip-path: inset(0 0 50% 0);
        animation: hack-glitch-top 0.5s infinite;
        transform: translate(-2px, -1px);
        pointer-events: none;
      }
      .glitch-layer::after {
        content: attr(data-text);
        position: absolute;
        left: 0;
        top: 0;
        color: #00ffff;
        clip-path: inset(50% 0 0 0);
        animation: hack-glitch-bottom 0.5s infinite;
        transform: translate(2px, 1px);
        pointer-events: none;
      }
      @keyframes hack-glitch-top {
        0% { clip-path: inset(0 0 65% 0); transform: translate(-2px, -1px); }
        33% { clip-path: inset(25% 0 40% 0); transform: translate(2px, 0px); }
        66% { clip-path: inset(60% 0 0% 0); transform: translate(-1px, 1px); }
        100% { clip-path: inset(0 0 65% 0); transform: translate(-2px, -1px); }
      }
      @keyframes hack-glitch-bottom {
        0% { clip-path: inset(65% 0 0 0); transform: translate(2px, 1px); }
        33% { clip-path: inset(40% 0 25% 0); transform: translate(-2px, 0px); }
        66% { clip-path: inset(0% 0 60% 0); transform: translate(1px, -1px); }
        100% { clip-path: inset(65% 0 0 0); transform: translate(2px, 1px); }
      }

      /* Full body RGB hue shift */
      @keyframes hack-hue-shift {
        0% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(15deg); }
        100% { filter: hue-rotate(0deg); }
      }
      [data-hack-hue="true"] {
        animation: hack-hue-shift 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    this.injectedElements.push(style);

    // Apply hue-rotate to main content wrapper
    const wrapper = document.querySelector('[class*="min-h-screen"]');
    if (wrapper) {
      wrapper.setAttribute('data-hack-hue', 'true');
      // Store for cleanup
      this._hueWrapper = wrapper;
    }

    // Randomly add/remove .glitch-layer on headings
    const headings = document.querySelectorAll('h1, h2, h3, h4');

    const burstCycle = () => {
      if (!this.active) return;

      // Pick random heading
      const idx = this._cryptoRandom(headings.length);
      const heading = headings[idx];
      if (!heading) {
        const tid = setTimeout(burstCycle, 3000);
        this.timeouts.push(tid);
        return;
      }

      heading.setAttribute('data-text', heading.textContent);
      heading.classList.add('glitch-layer');

      // Remove after 150-400ms
      const duration = 150 + this._cryptoRandom(250);
      const removeTid = setTimeout(() => {
        heading.classList.remove('glitch-layer');
        heading.removeAttribute('data-text');

        // Quiet for 2-6s, then fire again
        const quietTime = 2000 + this._cryptoRandom(4000);
        const nextTid = setTimeout(burstCycle, quietTime);
        this.timeouts.push(nextTid);
      }, duration);
      this.timeouts.push(removeTid);
    };

    burstCycle();
  }

  // Use crypto.getRandomValues() for randomness
  _cryptoRandom(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }


  // ==========================================================================
  // EFFECT 5 -- TERMINAL TAKEOVER PANEL
  // ==========================================================================
  // HACK ENGINE -- TERMINAL PANEL
  _bootTerminalPanel() {
    const terminal = document.createElement('div');
    terminal.setAttribute('data-hack-engine', 'true');

    const isDesktop = !this.isMobile;
    terminal.style.cssText = isDesktop
      ? 'position:fixed;bottom:20px;left:20px;width:480px;max-height:200px;overflow:hidden;' +
        'background:rgba(0,0,0,0.85);border:1px solid #00ff41;' +
        'font-family:"Courier New",monospace;font-size:12px;color:#00ff41;' +
        'padding:12px;z-index:9999;box-shadow:0 0 20px rgba(0,255,65,0.3);' +
        'border-radius:4px;transition:opacity 0.5s;'
      : 'position:fixed;bottom:0;left:0;width:100%;max-height:200px;overflow:hidden;' +
        'background:rgba(0,0,0,0.85);border-top:1px solid #00ff41;' +
        'font-family:"Courier New",monospace;font-size:11px;color:#00ff41;' +
        'padding:10px;z-index:9999;box-shadow:0 0 20px rgba(0,255,65,0.3);' +
        'transition:opacity 0.5s;';

    document.body.appendChild(terminal);
    this.injectedElements.push(terminal);

    // Click to restore full opacity
    terminal.addEventListener('click', () => {
      terminal.style.opacity = '1';
      const fadeTid = setTimeout(() => {
        terminal.style.opacity = '0.3';
      }, 3000);
      this.timeouts.push(fadeTid);
    });

    // Message queue
    const hostname = window.location.hostname || 'localhost';
    const title = document.title || 'UNKNOWN';
    const platform = window.navigator.platform || 'UNKNOWN';

    const messages = [
      '> INITIATING CONNECTION TO ' + hostname + '...',
      '> SCANNING PORT 443... OPEN',
      '> BYPASSING SSL CERTIFICATE....... SUCCESS',
      '> ENUMERATING DATABASE TABLES...',
      '> FOUND: users, sessions, config_data, chat_messages, reviews, donations',
      '> EXTRACTING RECORDS [\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591\u2591\u2591] 75%',
      '> WARNING: INTRUSION DETECTION TRIGGERED',
      '> OBFUSCATING TRACE ROUTE...',
      '> ACCESS LEVEL: ROOT',
      '> ' + title + ' HAS BEEN COMPROMISED',
      '> WELCOME TO THE MATRIX, ' + platform,
    ];

    // Typewriter effect with async/await
    const typeMessage = async (msg) => {
      if (!this.active) return;
      const line = document.createElement('div');
      line.style.cssText = 'margin-bottom:2px;white-space:nowrap;overflow:hidden;';
      terminal.appendChild(line);

      for (let i = 0; i < msg.length; i++) {
        if (!this.active) return;
        line.textContent = msg.substring(0, i + 1);
        // Auto-scroll to bottom
        terminal.scrollTop = terminal.scrollHeight;
        await this._sleep(40);
      }
    };

    const runMessages = async () => {
      for (const msg of messages) {
        if (!this.active) return;
        await typeMessage(msg);
        // Small pause between messages
        await this._sleep(300 + Math.random() * 500);
      }

      // After all messages: fade to 30% opacity
      terminal.style.opacity = '0.3';
    };

    runMessages();
  }

  _sleep(ms) {
    return new Promise((resolve) => {
      const tid = setTimeout(resolve, ms);
      this.timeouts.push(tid);
    });
  }


  // ==========================================================================
  // EFFECT 6 -- CUSTOM CURSOR TRAIL (Desktop only)
  // ==========================================================================
  // HACK ENGINE -- CURSOR TRAIL
  _bootCursorTrail() {
    // Skip on touch devices
    if (this.isTouch) return;

    // Hide default cursor
    this.originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'none';

    // Create custom cursor element with green crosshair SVG
    const cursor = document.createElement('div');
    cursor.id = 'hack-cursor';
    cursor.setAttribute('data-hack-engine', 'true');
    cursor.style.cssText =
      'position:fixed;top:0;left:0;width:20px;height:20px;pointer-events:none;z-index:10001;' +
      'will-change:transform;';
    cursor.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">' +
      '<line x1="10" y1="0" x2="10" y2="8" stroke="#00ff41" stroke-width="1.5"/>' +
      '<line x1="10" y1="12" x2="10" y2="20" stroke="#00ff41" stroke-width="1.5"/>' +
      '<line x1="0" y1="10" x2="8" y2="10" stroke="#00ff41" stroke-width="1.5"/>' +
      '<line x1="12" y1="10" x2="20" y2="10" stroke="#00ff41" stroke-width="1.5"/>' +
      '<circle cx="10" cy="10" r="3" stroke="#00ff41" stroke-width="1" fill="none"/>' +
      '</svg>';
    document.body.appendChild(cursor);
    this.injectedElements.push(cursor);
    this._cursorEl = cursor;

    // Create 12 ghost trail divs
    for (let i = 0; i < 12; i++) {
      const ghost = document.createElement('div');
      ghost.setAttribute('data-hack-engine', 'true');
      ghost.style.cssText =
        'position:fixed;top:0;left:0;width:6px;height:6px;border-radius:50%;' +
        'background:#00ff41;pointer-events:none;z-index:10000;will-change:transform;' +
        'opacity:0;';
      document.body.appendChild(ghost);
      this.cursorGhosts.push(ghost);
      this.injectedElements.push(ghost);
    }

    // Mousemove listener
    this._onMouseMove = (e) => {
      this.cursorX = e.clientX;
      this.cursorY = e.clientY;
    };
    document.addEventListener('mousemove', this._onMouseMove, { passive: true });

    // Start render loop
    this._cursorTrailLoop();
  }

  _cursorTrailLoop() {
    if (!this.active || this.paused) return;

    // Update cursor element position
    if (this._cursorEl) {
      this._cursorEl.style.transform =
        'translate3d(' + (this.cursorX - 10) + 'px,' + (this.cursorY - 10) + 'px,0)';
    }

    // Store position in ring buffer (x,y interleaved)
    const bufIdx = (this.cursorTrailIndex % 12) * 2;
    this.cursorTrailBuffer[bufIdx] = this.cursorX;
    this.cursorTrailBuffer[bufIdx + 1] = this.cursorY;
    this.cursorTrailIndex++;

    // Render ghost divs with decreasing opacity and scale
    for (let i = 0; i < 12; i++) {
      const ghost = this.cursorGhosts[i];
      if (!ghost) continue;

      // Read from ring buffer (oldest positions first)
      const readIdx = ((this.cursorTrailIndex - 12 + i + 120) % 12) * 2;
      const gx = this.cursorTrailBuffer[readIdx];
      const gy = this.cursorTrailBuffer[readIdx + 1];

      if (gx === 0 && gy === 0) continue; // not yet filled

      const opacity = (i / 12) * 0.6;
      const scale = 0.3 + (i / 12) * 0.7;
      ghost.style.transform =
        'translate3d(' + (gx - 3) + 'px,' + (gy - 3) + 'px,0) scale(' + scale + ')';
      ghost.style.opacity = opacity.toString();
    }

    this.cursorRafId = requestAnimationFrame(() => this._cursorTrailLoop());
  }


  // ==========================================================================
  // EFFECT 7 -- IMAGE GLITCH (pure CSS filter approach)
  // ==========================================================================
  // HACK ENGINE -- IMAGE GLITCH
  _bootImageGlitch() {
    const style = document.createElement('style');
    style.setAttribute('data-hack-engine', 'true');
    style.textContent = `
      @keyframes hack-img-glitch {
        0% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
        10% {
          filter: hue-rotate(90deg) saturate(2) contrast(1.5);
          clip-path: inset(5% 0 85% 0);
        }
        12% {
          filter: hue-rotate(180deg) saturate(3);
          clip-path: inset(40% 0 50% 0);
        }
        14% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
        45% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
        47% {
          filter: hue-rotate(270deg) contrast(2) brightness(1.3);
          clip-path: inset(70% 0 10% 0);
        }
        48% {
          filter: saturate(0) contrast(3);
          clip-path: inset(15% 0 65% 0);
        }
        50% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
        80% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
        82% {
          filter: hue-rotate(45deg) saturate(4) contrast(0.7);
          clip-path: inset(60% 0 20% 0);
        }
        84% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
        100% {
          filter: none;
          clip-path: inset(0 0 0 0);
        }
      }

      img[data-hack-engine-img="true"] {
        animation: hack-img-glitch 4s infinite;
        animation-timing-function: steps(1, end);
      }
    `;
    document.head.appendChild(style);
    this.injectedElements.push(style);

    // Find all images and mark them
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      img.setAttribute('data-hack-engine-img', 'true');
    });

    // Also observe for dynamically added images
    this._imgObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            if (node.tagName === 'IMG') {
              node.setAttribute('data-hack-engine-img', 'true');
            }
            const imgs = node.querySelectorAll ? node.querySelectorAll('img') : [];
            imgs.forEach((img) => img.setAttribute('data-hack-engine-img', 'true'));
          }
        }
      }
    });
    this._imgObserver.observe(document.body, { childList: true, subtree: true });
  }


  // ==========================================================================
  // EFFECT 8 -- SCREEN SHAKE + STATIC BURST
  // ==========================================================================
  // HACK ENGINE -- SCREEN SHAKE
  _bootScreenShake() {
    const triggerBreach = () => {
      if (!this.active) return;

      // 1. Screen shake via Web Animations API
      document.body.animate(
        [
          { transform: 'translate(0,0)' },
          { transform: 'translate(-4px, 2px)' },
          { transform: 'translate(4px, -2px)' },
          { transform: 'translate(-2px, 4px)' },
          { transform: 'translate(0,0)' },
        ],
        { duration: 300, iterations: 1 }
      );

      // 2. White flash overlay
      const flash = document.createElement('div');
      flash.setAttribute('data-hack-engine', 'true');
      flash.style.cssText =
        'position:fixed;top:0;left:0;width:100vw;height:100vh;' +
        'background:white;pointer-events:none;z-index:10002;opacity:0;';
      document.body.appendChild(flash);
      this.injectedElements.push(flash);

      flash.animate([{ opacity: 0 }, { opacity: 0.12 }, { opacity: 0 }], {
        duration: 200,
        iterations: 1,
        fill: 'forwards',
      }).onfinish = () => {
        flash.remove();
        const idx = this.injectedElements.indexOf(flash);
        if (idx > -1) this.injectedElements.splice(idx, 1);
      };

      // 3. Spike matrix rain speed 3x for 500ms
      this.matrixSpeedMultiplier = 3;
      const restoreTid = setTimeout(() => {
        this.matrixSpeedMultiplier = 1;
      }, 500);
      this.timeouts.push(restoreTid);

      // Schedule next breach: 12-20 seconds
      const nextDelay = 12000 + Math.random() * 8000;
      this.breachTimeoutId = setTimeout(triggerBreach, nextDelay);
      this.timeouts.push(this.breachTimeoutId);
    };

    // First breach after 12-20 seconds
    const initialDelay = 12000 + Math.random() * 8000;
    this.breachTimeoutId = setTimeout(triggerBreach, initialDelay);
    this.timeouts.push(this.breachTimeoutId);
  }


  // ==========================================================================
  // EFFECT 9 -- SCANLINE OVERLAY
  // ==========================================================================
  // HACK ENGINE -- SCANLINES
  _bootScanlineOverlay() {
    // Inject scanline style
    const style = document.createElement('style');
    style.setAttribute('data-hack-engine', 'true');
    style.textContent = `
      @keyframes hack-scanline-scroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(2px); }
      }
    `;
    document.head.appendChild(style);
    this.injectedElements.push(style);

    // Inject scanline overlay div
    const scanlines = document.createElement('div');
    scanlines.setAttribute('data-hack-engine', 'true');
    scanlines.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;' +
      'background:repeating-linear-gradient(' +
      '0deg,' +
      'rgba(0,0,0,0.03) 0px,' +
      'rgba(0,0,0,0.03) 1px,' +
      'transparent 1px,' +
      'transparent 2px' +
      ');' +
      'pointer-events:none;z-index:9997;' +
      'animation:hack-scanline-scroll 0.1s linear infinite;';
    document.body.appendChild(scanlines);
    this.injectedElements.push(scanlines);
  }
}


// ============================================================================
// AUTO-INIT: Create global instance and boot after DOM + React render
// ============================================================================
const hackEngine = new HackEngine();
window.__hackEngine = hackEngine;

// Wait for DOM ready + a short delay so React components are mounted
const bootHack = () => {
  // Give React 2s to mount all components before we scan the DOM
  setTimeout(() => hackEngine.init(), 2000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootHack);
} else {
  bootHack();
}

export default HackEngine;

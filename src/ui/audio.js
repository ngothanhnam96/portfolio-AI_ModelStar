/**
 * Synthesised sound effects and music (WebAudio, no asset files). All loops are original.
 */

let context = null;
let master = null;
let musicBus = null;
let noiseBuffer = null;
let muted = false;
let musicOn = true;

const MUSIC_GAIN = 0.28;

export function setMuted(value) {
  muted = value;
  if (master) master.gain.value = muted ? 0 : 1;
}
export const isMuted = () => muted;

export function setMusic(value) {
  musicOn = value;
  if (musicBus) musicBus.gain.value = musicOn ? MUSIC_GAIN : 0;
}
export const isMusicOn = () => musicOn;

/** Must first be called from a user gesture (browsers block audio before that). */
function audio() {
  if (muted) return null;
  if (!context) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
    master = context.createGain();
    master.connect(context.destination);
    musicBus = context.createGain();
    musicBus.gain.value = musicOn ? MUSIC_GAIN : 0;
    musicBus.connect(master);
    noiseBuffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  if (context.state === "suspended") context.resume();
  return context;
}

function tone(frequency, duration, { type = "sine", gain = 0.1, delay = 0, bus = null, slide = 0 } = {}) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  if (slide) osc.frequency.exponentialRampToValueAtTime(frequency * slide, start + duration);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env).connect(bus || master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise(duration, { gain = 0.1, delay = 0, filter = 2000, q = 0.8, bus = null, type = "bandpass" } = {}) {
  const ctx = audio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const band = ctx.createBiquadFilter();
  band.type = type;
  band.frequency.value = filter;
  band.Q.value = q;
  const env = ctx.createGain();
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(band).connect(env).connect(bus || master);
  src.start(start, Math.random() * 0.5);
  src.stop(start + duration + 0.02);
}

const semi = (base, steps) => base * 2 ** (steps / 12);

export const sfx = {
  unlock() {
    audio();
  },
  tap() {
    tone(720, 0.05, { type: "triangle", gain: 0.05 });
  },
  equip() {
    tone(520, 0.08, { type: "triangle", gain: 0.07 });
    tone(780, 0.1, { type: "triangle", gain: 0.06, delay: 0.05 });
  },
  remove() {
    tone(520, 0.08, { type: "triangle", gain: 0.05, slide: 0.7 });
  },
  color() {
    tone(semi(880, Math.floor(Math.random() * 5)), 0.06, { gain: 0.05 });
  },
  buy() {
    [0, 7, 12, 16].forEach((s, i) => tone(semi(988, s), 0.12, { type: "square", gain: 0.035, delay: i * 0.06 }));
  },
  wrong() {
    tone(200, 0.14, { type: "square", gain: 0.035 });
  },
  hint() {
    [0, 4, 7].forEach((s, i) => tone(semi(660, s), 0.14, { gain: 0.06, delay: i * 0.07 }));
  },
  tick() {
    tone(1200, 0.04, { type: "square", gain: 0.025 });
  },
  camera() {
    noise(0.05, { gain: 0.25, filter: 4000, q: 0.5 });
    noise(0.08, { gain: 0.15, filter: 2500, delay: 0.06 });
  },
  applause(seconds = 1.6) {
    for (let i = 0; i < seconds * 22; i += 1) {
      noise(0.05, { gain: 0.04 + Math.random() * 0.05, filter: 1500 + Math.random() * 2500, q: 1.5, delay: Math.random() * seconds });
    }
  },
  score(value) {
    tone(semi(440, Math.round(value)), 0.16, { type: "triangle", gain: 0.08 });
  },
  star(index) {
    tone(semi(784, index * 4), 0.25, { type: "triangle", gain: 0.09 });
    tone(semi(784, index * 4 + 12), 0.25, { gain: 0.04, delay: 0.05 });
  },
  fanfare() {
    [0, 4, 7, 12, 7, 12].forEach((s, i) => tone(semi(523.25, s), 0.2, { type: "triangle", gain: 0.08, delay: i * 0.11 }));
  },
};

// Music ---------------------------------------------------------------------------------------------

const hz = (semitones) => 440 * 2 ** (semitones / 12);

/** root (semitones from A4), tempo (steps/s), 16-step lead (null = rest), bass every 2 steps, beat. */
export const SONGS = {
  home: { root: -7, tempo: 4.6, lead: [7, null, 12, 11, 9, null, 7, null, 4, 5, 7, null, 9, 7, 4, null], bass: [-12, -5, -8, -3, -10, -5, -7, -5], beat: false },
  studio: { root: -5, tempo: 4.2, lead: [0, null, 4, null, 7, 9, 7, null, 2, null, 5, null, 9, 7, 5, null], bass: [-12, -12, -7, -7, -10, -10, -5, -5], beat: false },
  runway: { root: -9, tempo: 7.2, lead: [0, null, 0, 3, null, 7, null, 3, 10, null, 7, null, 5, 3, null, 0], bass: [-12, -12, -9, -9, -14, -14, -7, -7], beat: true },
};

let timer = null;
let current = null;
let step = 0;
let nextTime = 0;

export function playMusic(name) {
  if (name === current && timer) return;
  stopMusic();
  current = name;
  step = 0;
  nextTime = 0;
  timer = setInterval(() => schedule(SONGS[name]), 60);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  current = null;
}

function schedule(song) {
  if (!context || muted || !musicOn || context.state !== "running") return;
  const length = 1 / song.tempo;
  const now = context.currentTime;
  if (nextTime < now) nextTime = now + 0.05;
  while (nextTime < now + 0.25) {
    const delay = nextTime - now;
    const lead = song.lead[step % song.lead.length];
    if (lead !== null) tone(hz(song.root + lead + 12), length * 0.85, { type: "triangle", gain: 0.07, delay, bus: musicBus });
    if (step % 2 === 0) {
      const bass = song.bass[(step / 2) % song.bass.length];
      tone(hz(song.root + bass), length * 1.7, { type: "sine", gain: 0.14, delay, bus: musicBus });
    }
    if (song.beat) {
      if (step % 4 === 0) tone(110, 0.14, { type: "sine", gain: 0.28, delay, bus: musicBus, slide: 0.4 });
      if (step % 4 === 2) noise(0.03, { gain: 0.06, filter: 7000, q: 0.7, delay, bus: musicBus });
      if (step % 8 === 4) noise(0.1, { gain: 0.1, filter: 1800, q: 0.6, delay, bus: musicBus });
    }
    step += 1;
    nextTime += length;
  }
}

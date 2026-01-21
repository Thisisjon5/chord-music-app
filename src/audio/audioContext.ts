// AudioContext manager - handles Web Audio API initialization

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

// Initialize AudioContext and master gain
export function initAudioContext(): { context: AudioContext; masterGain: GainNode } {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.3; // Master volume
    masterGain.connect(audioContext.destination);
  }

  return { context: audioContext, masterGain: masterGain! };
}

// Get current AudioContext (must be initialized first)
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    throw new Error('AudioContext not initialized. Call initAudioContext() first.');
  }
  return audioContext;
}

// Get master gain node
export function getMasterGain(): GainNode {
  if (!masterGain) {
    throw new Error('AudioContext not initialized. Call initAudioContext() first.');
  }
  return masterGain;
}

// Resume AudioContext (needed for browser autoplay restrictions)
export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

// Check if AudioContext is running
export function isAudioContextRunning(): boolean {
  return audioContext?.state === 'running';
}

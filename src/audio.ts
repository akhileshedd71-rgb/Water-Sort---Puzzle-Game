let context: AudioContext | null = null;
export function tone(kind: 'tap' | 'pour' | 'complete' | 'win', enabled: boolean) {
  if (!enabled) return;
  try {
    context ??= new AudioContext(); if (context.state === 'suspended') void context.resume();
    const notes = kind === 'win' ? [523,659,784,1047] : kind === 'complete' ? [659,880] : kind === 'pour' ? [392,523] : [440];
    notes.forEach((f,i) => { const osc = context!.createOscillator(), gain = context!.createGain(), t = context!.currentTime + i * .09; osc.type = 'sine'; osc.frequency.setValueAtTime(f,t); gain.gain.setValueAtTime(0,t); gain.gain.linearRampToValueAtTime(.045,t+.012); gain.gain.exponentialRampToValueAtTime(.001,t+.25); osc.connect(gain); gain.connect(context!.destination); osc.start(t); osc.stop(t+.26); });
  } catch { /* Audio is optional, including on browsers without Web Audio. */ }
}

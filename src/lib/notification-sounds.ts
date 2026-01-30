/**
 * Notification sound and vibration utilities
 * Uses Web Audio API for sound and Navigator.vibrate for haptic feedback
 */

// Audio context singleton
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      return null;
    }
  }
  return audioContext;
}

/**
 * Play a notification sound using Web Audio API
 * No external files needed - generates tones programmatically
 */
export function playNotificationSound(type: 'default' | 'urgent' = 'default'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'urgent') {
      // Urgent: Higher frequency, two beeps
      oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.25);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else {
      // Default: Gentle single tone
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.35);
    }
  } catch (e) {
    console.warn('Error playing notification sound:', e);
  }
}

/**
 * Vibrate the device using the Vibration API
 * Only works on supported mobile devices
 */
export function vibrateDevice(type: 'default' | 'urgent' = 'default'): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) {
    return;
  }

  try {
    if (type === 'urgent') {
      // Urgent: Two short vibrations
      navigator.vibrate([100, 50, 100]);
    } else {
      // Default: Single short vibration
      navigator.vibrate(100);
    }
  } catch (e) {
    // Vibration may fail silently on some devices
  }
}

/**
 * Check if the device supports vibration
 */
export function supportsVibration(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.vibrate;
}

/**
 * Check if the device supports Web Audio API
 */
export function supportsWebAudio(): boolean {
  return typeof window !== 'undefined' && 
         !!(window.AudioContext || (window as any).webkitAudioContext);
}

/**
 * Request permission for audio (needed for autoplay policy)
 * Call this on user interaction (click, tap)
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

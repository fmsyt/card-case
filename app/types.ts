export type WindowWithAudioContext = typeof window & {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
};

export type SoundContextValue = {
  isNotSupported: boolean;
  initAudio: () => void;
  play: () => void;
  getAudioContext: () => AudioContext | null;
};

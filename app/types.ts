export type WindowWithAudioContext = typeof window & {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
};

export type Direction = "portrait" | "landscape";

export type playParams = {
  volume?: number;
};

export type SoundContextValue = {
  isNotSupported: boolean;
  initAudio: () => void;
  play: (params?: playParams) => void;
  getAudioContext: () => AudioContext | null;
};

import { createContext } from "react";
import type { SoundContextValue } from "./types";

const SoundContext = createContext<SoundContextValue>({
  isNotSupported: false,
  initAudio: () => {},
  play: () => {},
  getAudioContext: () => null,
});

export default SoundContext;

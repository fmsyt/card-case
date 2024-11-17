import { type ReactNode, useCallback, useRef, useState } from "react";
import SoundContext from "./SoundContext";
import type { SoundContextValue, WindowWithAudioContext } from "./types";

type AudioProviderProps = {
  children: ReactNode;
};

function initAudioContextInstance() {
  if (window.AudioContext) {
    return new AudioContext();
  }

  if ((window as WindowWithAudioContext).webkitAudioContext) {
    return new (window as WindowWithAudioContext).webkitAudioContext();
  }

  throw new Error("AudioContext not supported");
}

export default function SoundProvider(props: AudioProviderProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const [isNotSupported, setIsNotSupported] = useState(false);

  const initAudio = useCallback(() => {
    try {
      const context = initAudioContextInstance();
      audioContextRef.current = context;
    } catch (error) {
      setIsNotSupported(true);
      return;
    }

    const fetchSound = async () => {
      if (!audioContextRef.current) {
        return;
      }

      const context = audioContextRef.current;

      const response = await fetch("/sounds/hit.mp3");
      const buffer = await response.arrayBuffer();

      const data = await context.decodeAudioData(buffer);
      audioBufferRef.current = data;
    };

    fetchSound();
  }, []);

  const play = useCallback(() => {
    if (!audioContextRef.current || !audioBufferRef.current) {
      return;
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);

    source.start();
  }, []);

  const audioContextValue: SoundContextValue = {
    isNotSupported,
    initAudio,
    play,
    getAudioContext: () => audioContextRef.current,
  };

  return (
    <SoundContext.Provider value={audioContextValue}>
      {props.children}
    </SoundContext.Provider>
  );
}

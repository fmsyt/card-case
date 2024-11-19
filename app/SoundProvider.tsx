import { type ReactNode, useCallback, useRef, useState } from "react";
import SoundContext from "./SoundContext";
import type {
  playParams,
  SoundContextValue,
  WindowWithAudioContext,
} from "./types";

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

  const play = useCallback((params?: playParams) => {
    if (!audioContextRef.current || !audioBufferRef.current) {
      return;
    }

    const { volume } = { volume: 1, ...params };

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;

    const gainNode = audioContextRef.current.createGain();

    // NOTE: 人間の聴覚は対数的な感じ方をするので、音量を対数的に変更する
    gainNode.gain.value = Math.log10(volume + 1);

    source.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

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

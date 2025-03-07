import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type AudioResource = {
  context: AudioContext;
  gainNode: AudioNode;
};

export default function SoundProvider(props: AudioProviderProps) {
  const [audioResource, setAudioResource] = useState<AudioResource | null>(
    null,
  );

  const soundEffectBufferRef = useRef<AudioBuffer | null>(null);

  const isInitialized = useMemo(() => Boolean(audioResource), [audioResource]);
  const [isStreamStarted, setIsStreamStarted] = useState(false);

  const [isNotSupported, setIsNotSupported] = useState(false);

  const fetchSE = useCallback(async (context: AudioContext) => {
    const response = await fetch("/sounds/hit.mp3");
    const buffer = await response.arrayBuffer();

    const data = await context.decodeAudioData(buffer);
    soundEffectBufferRef.current = data;
  }, []);

  const initAudio = useCallback(() => {
    try {
      const context = initAudioContextInstance();

      const gainNode = context.createGain();
      gainNode.connect(context.destination);

      return { context, gainNode } as AudioResource;
    } catch (error) {
      setIsNotSupported(true);
    }

    return null;
  }, []);

  useEffect(() => {
    const resource = initAudio();

    if (resource) {
      setAudioResource(resource);
      fetchSE(resource.context);
    }

    return () => {
      if (resource) {
        resource.context.close();

        setAudioResource(null);
        setIsStreamStarted(false);
      }
    };
  }, [initAudio, fetchSE]);

  const playSilentAudio = useCallback(() => {
    if (!audioResource) {
      return;
    }

    const audioContext = audioResource.context;
    const gainNode = audioResource.gainNode;

    const buffer = audioContext.createBuffer(
      1,
      audioContext.sampleRate * 1,
      audioContext.sampleRate,
    );
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gainNode);
    source.start();
  }, [audioResource]);

  const play = useCallback(
    (params?: playParams) => {
      if (!audioResource) {
        return;
      }

      const { volume } = { volume: 1, ...params };
      if (!isStreamStarted) {
        playSilentAudio();
        setIsStreamStarted(true);
      }

      const source = audioResource.context.createBufferSource();
      source.buffer = soundEffectBufferRef.current;

      const gainNode = audioResource.context.createGain();

      // NOTE: 人間の聴覚は対数的な感じ方をするので、音量を対数的に変更する
      gainNode.gain.value = Math.log10(volume + 1);

      source.connect(gainNode);
      gainNode.connect(audioResource.gainNode);

      source.start();
    },
    [audioResource, playSilentAudio, isStreamStarted],
  );

  const audioContextValue: SoundContextValue = {
    isInitialized,
    isNotSupported,
    initAudio,
    play,
    getAudioContext: () => audioResource?.context || null,
  };

  return (
    <SoundContext.Provider value={audioContextValue}>
      {props.children}
    </SoundContext.Provider>
  );
}

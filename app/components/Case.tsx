"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "./Card";

type CaseProps = {
  direction?: "landscape" | "portrait";
};

export default function Case(props: CaseProps) {
  const caseRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardPosition = useRef({ x: 0, y: 0 });

  const { direction = "landscape" } = props;

  const [isHitLeftOrRight, setIsHitLeftOrRight] = useState(false);
  const [isHitTopOrBottom, setIsHitTopOrBottom] = useState(false);

  const [activated, setActivated] = useState(false);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const playingRef = useRef(false);

  const initAudio = useCallback(async () => {

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch("/sounds/hit.mp3");
    const arrayBuffer = await response.arrayBuffer();
    audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);

  }, []);

  useEffect(() => {
    initAudio();

    const handleDeviceChange = () => {
      initAudio();
    };

    if (navigator.mediaDevices) {
      if (navigator.mediaDevices.addEventListener) {
        navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
      } else {
        navigator.mediaDevices.ondevicechange = handleDeviceChange;
      }
    }

    return () => {
      if (navigator.mediaDevices) {
        if (navigator.mediaDevices.removeEventListener) {
          navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
        } else {
          navigator.mediaDevices.ondevicechange = null;
        }
      }
    };
  }, [initAudio]);

  const playSound = useCallback(() => {

    const fn = async () => {
      if (!audioContextRef.current || !audioBufferRef.current) {
        return;
      }

      try {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = volume;
        source.connect(gainNode).connect(audioContextRef.current.destination);
        source.start(0);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        alert(message);
      }
    };

    fn();
  }, [volume]);

  useEffect(() => {
    (() => {
      if (!isHitLeftOrRight) {
        playingRef.current = false;
        return;
      }

      if (playingRef.current) {
        return;
      }

      playingRef.current = true;
      playSound();
    })();

    return () => {
      playingRef.current = false;
    };
  }, [isHitLeftOrRight, playSound]);

  useEffect(() => {
    (() => {
      if (!isHitTopOrBottom) {
        playingRef.current = false;
        return;
      }

      if (playingRef.current) {
        return;
      }

      playingRef.current = true;
      playSound();
    })();

    return () => {
      playingRef.current = false;
    };
  }, [isHitTopOrBottom, playSound]);

  useEffect(() => {
    // クリック、タッチによるドラッグを実装する
    // ケースの外にカードが出ないようにする

    if (!cardRef.current) {
      return;
    }

    if (!caseRef.current) {
      return;
    }

    const cardElement = cardRef.current;
    const caseElement = caseRef.current;

    let isDragging = false;

    const dragStart = (offsetTop: number, offsetLeft: number) => {
      isDragging = true;
      cardPosition.current = {
        x: offsetLeft,
        y: offsetTop,
      };
    };

    const dragMove = (clientX: number, clientY: number) => {
      if (!isDragging) {
        return;
      }

      const cardWidth = cardElement.offsetWidth;
      const cardHeight = cardElement.offsetHeight;

      const caseWidth = caseElement.offsetWidth;
      const caseHeight = caseElement.offsetHeight;

      const cardLeft = clientX - cardPosition.current.x;
      const cardTop = clientY - cardPosition.current.y;

      const cardRight = cardLeft + cardWidth;
      const cardBottom = cardTop + cardHeight;

      const caseLeft = 0;
      const caseTop = 0;

      const caseRight = caseWidth;
      const caseBottom = caseHeight;

      let hitLeftOrRight = false;
      let hitTopOrBottom = false;

      if (cardLeft < caseLeft) {
        cardElement.style.left = `${caseLeft}px`;
        hitLeftOrRight = true;
      } else if (cardRight > caseRight) {
        cardElement.style.left = `${caseRight - cardWidth}px`;
        hitLeftOrRight = true;
      } else {
        cardElement.style.left = `${cardLeft}px`;
      }

      if (cardTop < caseTop) {
        cardElement.style.top = `${caseTop}px`;
        hitTopOrBottom = true;
      } else if (cardBottom > caseBottom) {
        cardElement.style.top = `${caseBottom - cardHeight}px`;
        hitTopOrBottom = true;
      } else {
        cardElement.style.top = `${cardTop}px`;
      }

      setIsHitLeftOrRight(hitLeftOrRight);
      setIsHitTopOrBottom(hitTopOrBottom);
    };

    const dragEnd = () => {
      isDragging = false;
    };

    cardElement.addEventListener("mousedown", (event) => {
      dragStart(
        event.clientY - cardElement.offsetTop,
        event.clientX - cardElement.offsetLeft,
      );
    });

    cardElement.addEventListener("touchstart", (event) => {
      dragStart(
        event.touches[0].clientY - cardElement.offsetTop,
        event.touches[0].clientX - cardElement.offsetLeft,
      );
    });

    window.addEventListener("mousemove", (event) => {
      dragMove(event.clientX, event.clientY);
    });

    window.addEventListener("touchmove", (event) => {
      dragMove(event.touches[0].clientX, event.touches[0].clientY);
    });

    window.addEventListener("mouseup", () => {
      dragEnd();
    });

    window.addEventListener("touchend", () => {
      dragEnd();
    });

    return () => {
      cardElement.removeEventListener("mousedown", (event) => {
        dragStart(
          event.clientY - cardElement.offsetTop,
          event.clientX - cardElement.offsetLeft,
        );
      });

      window.removeEventListener("mousemove", (event) => {
        dragMove(event.clientX, event.clientY);
      });

      window.removeEventListener("mouseup", () => {
        dragEnd();
      });

      cardElement.removeEventListener("touchstart", (event) => {
        dragStart(
          event.touches[0].clientY - cardElement.offsetTop,
          event.touches[0].clientX - cardElement.offsetLeft,
        );
      });

      window.removeEventListener("touchmove", (event) => {
        dragMove(event.touches[0].clientX, event.touches[0].clientY);
      });

      window.removeEventListener("touchend", () => {
        dragEnd();
      });
    };
  }, []);

  const borderColor = useMemo(() => {
    if (isHitLeftOrRight && isHitTopOrBottom) {
      return "border-red-500";
    }
    if (isHitLeftOrRight) {
      return "border-blue-500";
    }
    if (isHitTopOrBottom) {
      return "border-green-500";
    }
    return "border-gray-500";
  }, [isHitLeftOrRight, isHitTopOrBottom]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={caseRef}
        className={[
          "case",
          "border",
          borderColor,
          "rounded-[3mm]",
          "relative",
          direction === "landscape" ? "landscape" : "portrait",
          !activated && "hidden",
        ].join(" ")}
      >
        <div
          ref={cardRef}
          className="absolute"
        >
          <Card direction={props.direction} />
        </div>
      </div>

      {activated && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mt-4"
        />
      )}

      {!activated && (
        <>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              if (audioContextRef.current?.state === "suspended") {
                audioContextRef.current.resume();
              }
              audioRef.current?.play();
              setActivated(true);
            }}
          >
            クリックで開始
          </button>

          <p className="text-sm text-gray-500 mt-4">
            このページは、音が出ます。音量にご注意ください。
          </p>
        </>
      )}

      <audio ref={audioRef}>
        <source src="/sounds/hit.mp3" type="audio/mpeg" />
        <track kind="captions" />
      </audio>
    </div>
  );
}

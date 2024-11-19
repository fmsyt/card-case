"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SoundContext from "../SoundContext";
import SoundProvider from "../SoundProvider";
import Card from "./Card";

type CaseProps = {
  direction?: "landscape" | "portrait";
};

export default function Case(props: CaseProps) {
  return (
    <SoundProvider>
      <CaseInner {...props} />
    </SoundProvider>
  );
}

function CaseInner(props: CaseProps) {
  const caseRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const inputImageRef = useRef<HTMLInputElement>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const handleImageChange = useCallback(() => {
    if (!inputImageRef.current) {
      return;
    }

    const file = inputImageRef.current.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target?.result as string);
    };

    reader.readAsDataURL(file);
  }, []);

  const initialCardPosition = useRef({ left: 0, top: 0 });

  const { direction = "landscape" } = props;

  const { initAudio, play } = useContext(SoundContext);

  const [isHitLeftOrRight, setIsHitLeftOrRight] = useState(false);
  const [isHitTopOrBottom, setIsHitTopOrBottom] = useState(false);

  const [activated, setActivated] = useState(false);
  const volumeRef = useRef(0.5);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playingRef = useRef(false);

  useEffect(() => {
    initAudio();

    const handleDeviceChange = () => {
      initAudio();
    };

    if (navigator.mediaDevices) {
      if (navigator.mediaDevices.addEventListener) {
        navigator.mediaDevices.addEventListener(
          "devicechange",
          handleDeviceChange,
        );
      } else {
        navigator.mediaDevices.ondevicechange = handleDeviceChange;
      }
    }

    return () => {
      if (navigator.mediaDevices) {
        if (navigator.mediaDevices.removeEventListener) {
          navigator.mediaDevices.removeEventListener(
            "devicechange",
            handleDeviceChange,
          );
        } else {
          navigator.mediaDevices.ondevicechange = null;
        }
      }
    };
  }, [initAudio]);

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
      play();
    })();

    return () => {
      playingRef.current = false;
    };
  }, [isHitLeftOrRight, play]);

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
      play();
    })();

    return () => {
      playingRef.current = false;
    };
  }, [isHitTopOrBottom, play]);

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
      initialCardPosition.current = {
        left: offsetLeft,
        top: offsetTop,
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

      const cardLeftExpected = clientX - initialCardPosition.current.left;
      const cardTopExpected = clientY - initialCardPosition.current.top;

      let cardLeft = cardLeftExpected;
      let cardTop = cardTopExpected;

      const cardRight = cardLeftExpected + cardWidth;
      const cardBottom = cardTopExpected + cardHeight;

      const caseRight = caseWidth;
      const caseBottom = caseHeight;

      let hitLeftOrRight = false;
      let hitTopOrBottom = false;

      if (cardLeftExpected < 0) {
        cardLeft = 0;
        hitLeftOrRight = true;
      } else if (cardRight > caseRight) {
        cardLeft = caseRight - cardWidth;
        hitLeftOrRight = true;
      }

      if (cardTopExpected < 0) {
        cardTop = 0;
        hitTopOrBottom = true;
      } else if (cardBottom > caseBottom) {
        cardTop = caseBottom - cardHeight;
        hitTopOrBottom = true;
      }

      cardElement.style.left = `${cardLeft}px`;
      cardElement.style.top = `${cardTop}px`;

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

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    inputImageRef.current?.click();
  }, []);

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
          onContextMenu={handleContextMenu}
          onDoubleClick={handleContextMenu}
        >
          <Card direction={props.direction} imageBase64={imageBase64} />
        </div>
      </div>

      {activated && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          defaultValue={volumeRef.current}
          onChange={(e) => {
            volumeRef.current = Number(e.target.value);
          }}
          className="mt-4"
        />
      )}

      {!activated && (
        <>
          <button
            type="button"
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
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

      <input
        ref={inputImageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  );
}

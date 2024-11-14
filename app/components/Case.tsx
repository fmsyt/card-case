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

  const audioRef = useRef<HTMLAudioElement>(null);

  const { direction = "landscape" } = props;

  const [isHitLeftOrRight, setIsHitLeftOrRight] = useState(false);
  const [isHitTopOrBottom, setIsHitTopOrBottom] = useState(false);

  const [activated, setActivated] = useState(false);

  const playSound = useCallback(() => {
    const fn = async () => {
      if (!audioRef.current) {
        return;
      }

      try {
        // NOTE: Safariでは、`controls`によって1度でも再生されるとplay()が使えるようになる
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch (error) {
        console.error(error);
      }
    };

    fn();
  }, []);

  useEffect(() => {
    let playing = false;

    (() => {
      if (!isHitLeftOrRight) {
        playing = false;
        return;
      }

      if (playing) {
        return;
      }

      playing = true;
      playSound();
    })();

    return () => {
      playing = false;
    };
  }, [isHitLeftOrRight, playSound]);

  useEffect(() => {
    let playing = false;

    (() => {
      if (!isHitTopOrBottom) {
        playing = false;
        return;
      }

      if (playing) {
        return;
      }

      playing = true;
      playSound();
    })();

    return () => {
      playing = false;
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

      {!activated && (
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
      )}

      <audio
        preload="auto"
        controls
        ref={audioRef}
        src="/sounds/hit.mp3"
        className="hidden"
      >
        <track kind="captions" />
      </audio>
    </div>
  );
}

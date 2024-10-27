'use client';

import { useEffect, useRef } from 'react';
import Card from './Card';

type CaseProps = {
  direction?: "landscape" | "portrait";
}

export default function Case(props: CaseProps) {

  const caseRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardPosition = useRef({ x: 0, y: 0 });

  const { direction = "landscape" } = props;

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
      }
    }

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

      if (cardLeft < caseLeft) {
        cardElement.style.left = `${caseLeft}px`;
      } else if (cardRight > caseRight) {
        cardElement.style.left = `${caseRight - cardWidth}px`;
      } else {
        cardElement.style.left = `${cardLeft}px`;
      }

      if (cardTop < caseTop) {
        cardElement.style.top = `${caseTop}px`;
      } else if (cardBottom > caseBottom) {
        cardElement.style.top = `${caseBottom - cardHeight}px`;
      } else {
        cardElement.style.top = `${cardTop}px`;
      }
    }

    const dragEnd = () => {
      isDragging = false;
    }

    cardElement.addEventListener("mousedown", (event) => {
      dragStart(event.clientY - cardElement.offsetTop, event.clientX - cardElement.offsetLeft);
    })

    cardElement.addEventListener("touchstart", (event) => {
      dragStart(event.touches[0].clientY - cardElement.offsetTop, event.touches[0].clientX - cardElement.offsetLeft);
    })

    window.addEventListener("mousemove", (event) => {
      dragMove(event.clientX, event.clientY);
    })

    window.addEventListener("touchmove", (event) => {
      dragMove(event.touches[0].clientX, event.touches[0].clientY);
    })

    window.addEventListener("mouseup", () => {
      dragEnd();
    })

    window.addEventListener("touchend", () => {
      dragEnd();
    })

    return () => {
      cardElement.removeEventListener("mousedown", (event) => {
        dragStart(event.clientY - cardElement.offsetTop, event.clientX - cardElement.offsetLeft);
      });

      window.removeEventListener("mousemove", (event) => {
        dragMove(event.clientX, event.clientY);
      });

      window.removeEventListener("mouseup", () => {
        dragEnd();
      });

      cardElement.removeEventListener("touchstart", (event) => {
        dragStart(event.touches[0].clientY - cardElement.offsetTop, event.touches[0].clientX - cardElement.offsetLeft);
      });

      window.removeEventListener("touchmove", (event) => {
        dragMove(event.touches[0].clientX, event.touches[0].clientY);
      });

      window.removeEventListener("touchend", () => {
        dragEnd();
      });
    }

  }, []);

  return (
    <div
      ref={caseRef}
      className={[
        "case",
        "border",
        "border-blue-500",
        "rounded-[3mm]",
        "relative",
        direction === "landscape" ? "landscape" : "portrait",
      ].join(" ")}
    >
      <div ref={cardRef} className="absolute">
        <Card direction={props.direction}>

        </Card>
      </div>
    </div>
  )
}

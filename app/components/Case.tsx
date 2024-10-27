'use client';

import { useRef } from 'react';
import Card from './Card';

type CaseProps = {
  direction?: "landscape" | "portrait";
}

export default function Case(props: CaseProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { direction = "landscape" } = props;

  return (
    <div
      className={[
        "case",
        "border",
        "border-blue-500",
        "rounded-[3mm]",
        direction === "landscape" ? "landscape" : "portrait",
      ].join(" ")}
    >
      <Card ref={cardRef} direction={props.direction} />
    </div>
  )
}

import type { ReactNode } from "react";

type CardProps = {
  children?: ReactNode;
  direction?: "landscape" | "portrait";
  ref?: React.Ref<HTMLDivElement>;
};

export default function Card(props: CardProps) {
  const { direction = "landscape" } = props;

  return (
    <div
      ref={props.ref}
      className={[
        "card",
        direction === "landscape" ? "landscape" : "portrait",
        "border",
        "border-red-500",
        "rounded-[3mm]",
        "selection-none",
      ].join(" ")}
    >
      {props.children || "カード"}
    </div>
  );
}

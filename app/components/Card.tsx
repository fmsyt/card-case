import type { ReactNode } from "react";

type CardProps = {
  children?: ReactNode;
  direction?: "landscape" | "portrait";
  ref?: React.Ref<HTMLDivElement>;
  image?: string | null;
};

export default function Card(props: CardProps) {
  const { direction = "landscape", image } = props;

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
      {Boolean(image) && (
        <img
          className="w-full h-full object-cover select-none rounded-[3mm]"
          src={image || ""}
          alt=""
        />
      )}

      {!image && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">ダブルクリックで画像を設定</div>
        </div>
      )}

      <div className="absolute inset-0" />
    </div>
  );
}

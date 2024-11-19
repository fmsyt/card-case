import { useEffect, type ReactNode } from "react";

type CardProps = {
  children?: ReactNode;
  direction?: "landscape" | "portrait";
  ref?: React.Ref<HTMLDivElement>;
  imageBase64?: string | null;
};

export default function Card(props: CardProps) {
  const { direction = "landscape", imageBase64 } = props;

  useEffect(() => {
    console.log(imageBase64);
  }, [imageBase64]);

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
      {Boolean(imageBase64) && (
        <img
          className="w-full h-full object-cover select-none rounded-[3mm]"
          src={imageBase64 || ""}
          alt=""
        />
      )}

      {!imageBase64 && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-500">ダブルクリックで画像を設定</div>
        </div>
      )}

      <div className="absolute inset-0" />
    </div>
  );
}

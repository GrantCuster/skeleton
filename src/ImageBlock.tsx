import { ImageBlockType } from "./types";

export function ImageBlock({ block }: { block: ImageBlockType }) {
  return (
    <img
      draggable={false}
      src={block.src}
      style={{ width: "100%", height: "100%" }}
    />
  );
}

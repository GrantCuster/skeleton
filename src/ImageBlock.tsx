import { ImageBlockType } from "./types";

export function ImageBlock({ block }: { block: ImageBlockType }) {
  return (
    <img
      draggable={false}
      src={block.src}
      style={{ width: "100%", height: "100%",
        transform: `scale(${block.flippedHorizontally ? -1 : 1}, ${block.flippedVertically ? -1 : 1})`,
      }}
    />
  );
}

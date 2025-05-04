import { useAtom } from "jotai";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  BlockIdsAtom,
  BlockMapAtom,
  showCropModalAtom,
  activeStreamsAtom,
} from "./atoms";
import { WebcamBlockType, CropBoxType } from "./types";
import { pointIntersectBox } from "./utils";

export function CropModal() {
  const [blockId, setShowCropModal] = useAtom(showCropModalAtom);
  if (!blockId) return null;

  const [blockMap, setBlockMap] = useAtom(BlockMapAtom);

  const block = blockMap[blockId];

  return (
    <div className="absolute inset-0 pointer-events-auto flex">
      <div className="m-auto bg-neutral-800 w-full pointer-events-auto">
        {block.type === "webcam" ? (
          <CropWebcamDisplay block={block} />
        ) : (
          <img src={block.src} className="w-full h-auto" alt="Crop preview" />
        )}
      </div>
    </div>
  );
}

function CropWebcamDisplay({ block }: { block: WebcamBlockType }) {
  return <div>crop video</div>;
}

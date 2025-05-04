import { useAtom } from "jotai";
import { useDevices } from "./useDevices";
import {
  BlockIdsAtom,
  BlockMapAtom,
  stampMoveDirectionAtom,
  stampMoveOffsetAtom,
} from "./atoms";
import {
  BlendTypes,
  BlockType,
  ImageBlockType,
  WebcamBlockType,
} from "./types";
import { blendOptions, offsetLookup } from "./consts";
import { FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { makeZIndex } from "./utils";

export function ToolStamp({ blocks }: { blocks: BlockType[] }) {
  const [blockIds, setBlockIds] = useAtom(BlockIdsAtom);
  const [, setBlockMap] = useAtom(BlockMapAtom);

  const [stampMoveDirection, setStampMoveDirection] = useAtom(
    stampMoveDirectionAtom,
  );
  const [stampMoveOffset, setStampMoveOffset] = useAtom(stampMoveOffsetAtom);

  return (
    <button
      className="px-3 py-2 pointer-events-auto bg-neutral-800 hover:bg-neutral-700 flex justify-center items-center"
      onClick={(e) => {
        e.stopPropagation();
        for (const block of blocks) {
          let horizontalMove = 0;
          let verticalMove = 0;
          if (
            stampMoveDirection === "←" ||
            stampMoveDirection === "↖" ||
            stampMoveDirection === "↙"
          ) {
            horizontalMove = -1 * offsetLookup[stampMoveOffset];
          }
          if (
            stampMoveDirection === "→" ||
            stampMoveDirection === "↗" ||
            stampMoveDirection === "↘"
          ) {
            horizontalMove = 1 * offsetLookup[stampMoveOffset];
          }
          if (
            stampMoveDirection === "↑" ||
            stampMoveDirection === "↖" ||
            stampMoveDirection === "↗"
          ) {
            verticalMove = -1 * offsetLookup[stampMoveOffset];
          }
          if (
            stampMoveDirection === "↓" ||
            stampMoveDirection === "↙" ||
            stampMoveDirection === "↘"
          ) {
            verticalMove = 1 * offsetLookup[stampMoveOffset];
          }
          if (stampMoveDirection === "•") {
            horizontalMove = 0;
            verticalMove = 0;
          }
          const canvas = document.getElementById(
            "canvas-" + block.id,
          ) as HTMLCanvasElement;
          const dataUrl = canvas.toDataURL();
          const newId = uuid();
          const newBlock = {
            id: newId,
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
            rotation: block.rotation,
            flippedHorizontally: false,
            flippedVertically: false,
            src: dataUrl,
            blend: block.blend,
            type: "image",
            zIndex: makeZIndex(),
          } as ImageBlockType;
          setBlockIds((prev) => [...prev, newId]);
          setBlockMap((prev) => ({
            ...prev,
            [newId]: newBlock,
            [block.id]: {
              ...block,
              x: block.x + block.width * horizontalMove,
              y: block.y + block.height * verticalMove,
              zIndex: makeZIndex() + 1,
            },
          }));
        }
        // setCamera((prev) => {
        //   return {
        //     ...prev,
        //     x: prev.x - block.width * horizontalMove,
        //     y: prev.y - block.height * verticalMove,
        //   };
        // });
      }}
    >
      stamp
    </button>
  );
}

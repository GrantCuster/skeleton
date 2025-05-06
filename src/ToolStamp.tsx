import { useAtom } from "jotai";
import { useDevices } from "./useDevices";
import {
  BlockIdsAtom,
  BlockMapAtom,
  CameraAtom,
  stampMoveDirectionAtom,
  stampMoveOffsetAtom,
  StateRefAtom,
} from "./atoms";
import {
  BlockType,
  ImageBlockType,
  StampMoveDirectionType,
  StampMoveOffsetType,
} from "./types";
import { offsetLookup } from "./consts";
import { v4 as uuid } from "uuid";
import { makeZIndex } from "./utils";
import { screenToCanvas } from "./Camera";

export function ToolStamp({ blocks }: { blocks: BlockType[] }) {
  const [, setBlockIds] = useAtom(BlockIdsAtom);
  const [, setBlockMap] = useAtom(BlockMapAtom);
  const [, setCamera] = useAtom(CameraAtom);
  const [stateRef] = useAtom(StateRefAtom);

  const [stampMoveDirection, setStampMoveDirection] = useAtom(
    stampMoveDirectionAtom,
  );
  const [stampMoveOffset, setStampMoveOffset] = useAtom(stampMoveOffsetAtom);

  return (
    <div className="flex flex-col items-end">
      <div className="grid grid-cols-3">
        {["↖", "↑", "↗", "←", "•", "→", "↙", "↓", "↘"].map((value) => (
          <button
            className={`px-2 ${
              stampMoveDirection === value ? "bg-neutral-700" : "bg-neutral-800"
            } hover:bg-neutral-700 flex justify-center items-center`}
            onClick={(e) => {
              e.stopPropagation();
              setStampMoveDirection(value as StampMoveDirectionType);
            }}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 grid-flow-row">
        <div></div>
        {["1/8", "1/4", "1/2", "3/4", "1"].map((offset) => {
          return (
            <button
              className={`px-3 ${
                stampMoveOffset === offset ? "bg-neutral-700" : "bg-neutral-800"
              } hover:bg-neutral-700 flex justify-center items-center`}
              onClick={(e) => {
                e.stopPropagation();
                setStampMoveOffset(offset as StampMoveOffsetType);
              }}
              value={offset}
            >
              {offset}
            </button>
          );
        })}
      </div>

      <button
        className="px-3 py-2 pointer-events-auto bg-neutral-800 hover:bg-neutral-700 flex justify-center items-center"
        onClick={(e) => {
          e.stopPropagation();
          let centerDistance = Infinity;
          let centerMoveX = 0;
          let centerMoveY = 0;
          const currentCenter = screenToCanvas(
            {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
            },
            stateRef.camera,
            stateRef.zoomContainer!,
          );

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

            const blockCenterX = block.x + block.width / 2;
            const blockCenterY = block.y + block.height / 2;
            const thisCenterDistance = Math.sqrt(
              (blockCenterX - currentCenter.x) ** 2 +
                (blockCenterY - currentCenter.y) ** 2,
            );
            if (thisCenterDistance < centerDistance) {
              centerDistance = thisCenterDistance;
              centerMoveX = horizontalMove * block.width;
              centerMoveY = verticalMove * block.height;
            }

            // const duration = 200;
            // const start = performance.now();
            // const initialCameraX = stateRef.camera.x;
            // const initialCameraY = stateRef.camera.y;
            // const animate = (time: number) => {
            //   const progress = Math.min((time - start) / duration, 1);
            //   const easedProgress = Math.pow(progress, 2);
            //   const additionX = centerMoveX * easedProgress;
            //   const additionY = centerMoveY * easedProgress;
            //   setCamera((prev) => {
            //     return {
            //       ...prev,
            //       x: initialCameraX - additionX,
            //       y: initialCameraY - additionY,
            //     };
            //   });
            //   if (progress < 1) {
            //     requestAnimationFrame(animate);
            //   }
            // };
            // requestAnimationFrame(animate);

            setCamera((prev) => {
              return {
                ...prev,
                x: prev.x - centerMoveX,
                y: prev.y - centerMoveY,
              };
            });

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
        }}
      >
        stamp
      </button>
    </div>
  );
}

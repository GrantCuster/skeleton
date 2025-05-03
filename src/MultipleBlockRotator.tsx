import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { useRef } from "react";
import {
  SelectedBlockIdsAtom,
  BlockMapAtom,
  StateRefAtom,
  CameraAtom,
} from "./atoms";
import { screenToCanvas } from "./Camera";
import { BlockSelectorType } from "./types";
import { rotateAroundCenter } from "./utils";

export function MultipleBlockRotator({
  blockSelector,
}: {
  blockSelector: BlockSelectorType;
}) {
  const [selectedBlockIds] = useAtom(SelectedBlockIdsAtom);
  const [blockMap, setBlockMap] = useAtom(BlockMapAtom);
  const offset = 16;
  const size = 16;
  const corners = [
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
  ] as const;
  const [stateRef] = useAtom(StateRefAtom);
  const [camera] = useAtom(CameraAtom);

  const startCenterRef = useRef({ x: 0, y: 0 });
  const startAngleRef = useRef(0);
  const startCentersRef = useRef<{ x: number; y: number }[]>([]);
  const startAnglesRef = useRef<number[]>([]);
  const dragBind = useDrag(({ first, event, xy: [x, y] }) => {
    event.stopPropagation();

    // resizing rotation from https://shihn.ca/posts/2020/resizing-rotated-elements/
    const canvasPoint = screenToCanvas(
      { x, y },
      stateRef.camera,
      stateRef.zoomContainer!,
    );

    if (first) {
      const selectorCenterX = blockSelector.x + blockSelector.width / 2;
      const selectorCenterY = blockSelector.y + blockSelector.height / 2;

      startCenterRef.current = {
        x: selectorCenterX,
        y: selectorCenterY,
      };
    }

    const angle =
      Math.atan2(
        canvasPoint.y - startCenterRef.current.y,
        canvasPoint.x - startCenterRef.current.x,
      ) -
      Math.PI / 4;

    if (first) {
      startAngleRef.current = angle;
      startCentersRef.current = selectedBlockIds.map((id) => {
        const block = blockMap[id];
        return {
          x: block.x + block.width / 2,
          y: block.y + block.height / 2,
        };
      });
      startAnglesRef.current = selectedBlockIds.map((id) => {
        const block = blockMap[id];
        return block.rotation || 0;
      });
    }

    const newAngle = angle - startAngleRef.current;

    const newBlockMap = { ...blockMap };
    for (let i = 0; i < selectedBlockIds.length; i++) {
      const id = selectedBlockIds[i];
      const block = newBlockMap[id];
      const newCenter = rotateAroundCenter(
        startCentersRef.current[i].x,
        startCentersRef.current[i].y,
        startCenterRef.current.x,
        startCenterRef.current.y,
        newAngle,
      );
      newBlockMap[id] = {
        ...block,
        x: newCenter[0] - block.width / 2,
        y: newCenter[1] - block.height / 2,
        rotation: startAnglesRef.current[i] + newAngle,
      };
    }
    setBlockMap(newBlockMap);
  });

  const cornerCursors = {
    "top-left": "nesw-resize",
    "top-right": "nwse-resize",
    "bottom-left": "nwse-resize",
    "bottom-right": "nesw-resize",
  };

  const scaledSize = size / camera.z;
  const scaledOffset = offset / camera.z;

  return (
    <>
      {[...corners].map((corner) => {
        return (
          <div
            {...dragBind()}
            key={corner}
            data-corner={corner}
            className="absolute touch-none pointer-events-auto"
            style={{
              left:
                corner === "top-left" || corner === "bottom-left"
                  ? -scaledOffset - scaledSize / 2
                  : blockSelector.width - scaledSize / 2 + scaledOffset,
              top:
                corner === "top-left" || corner === "top-right"
                  ? -scaledSize / 2 - scaledOffset
                  : blockSelector.height - scaledSize / 2 + scaledOffset,
              cursor: cornerCursors[corner],
              width: scaledSize,
              height: scaledSize,
            }}
          />
        );
      })}
    </>
  );
}

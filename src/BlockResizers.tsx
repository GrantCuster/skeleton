import { useDrag } from "@use-gesture/react";
import { useAtom } from "jotai";
import { useRef } from "react";
import { BlockMapAtom, CameraAtom, ZoomContainerAtom } from "./atoms";
import { screenToCanvas } from "./Camera";

function rotateAroundCenter(
  x: number,
  y: number,
  cx: number,
  cy: number,
  angle: number,
) {
  return [
    (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
    (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
  ];
}

export function BlockResizers({ id }: { id: string }) {
  const [blockMap, setBlockMap] = useAtom(BlockMapAtom);
  const block = blockMap[id];

  const [camera] = useAtom(CameraAtom);
  const cameraRef = useRef(camera);
  cameraRef.current = camera;
  const [zoomContainer] = useAtom(ZoomContainerAtom);
  const zoomContainerRef = useRef(zoomContainer);
  zoomContainerRef.current = zoomContainer;

  // reimplement?
  const preserveAspectRatio = block.type === "image" || block.type === "webcam";

  const size = 22;

  const dragBind = useDrag(({ event, xy: [x, y] }) => {
    event.stopPropagation();

    const cx = block.x + block.width / 2;
    const cy = block.y + block.height / 2;

    const canvasPoint = screenToCanvas(
      { x, y },
      cameraRef.current,
      zoomContainerRef.current!,
    );
    const rotation = block.rotation || 0;

    const unrotatedTopLeft = [block.x, block.y];

    const rotatedTopLeft = rotateAroundCenter(
      block.x,
      block.y,
      cx,
      cy,
      rotation,
    );
    const rotatedBottomRight = [canvasPoint.x, canvasPoint.y];

    const unrotatedBottomRight = rotateAroundCenter(
      rotatedBottomRight[0],
      rotatedBottomRight[1],
      cx,
      cy,
      -rotation,
    );

    let proposedWidth = unrotatedBottomRight[0] - unrotatedTopLeft[0];
    let proposedHeight = unrotatedBottomRight[1] - unrotatedTopLeft[1];

    if (preserveAspectRatio) {
      const aspectRatio = block.width / block.height;
      const newAspectRatio = Math.abs(proposedWidth / proposedHeight);
      if (newAspectRatio < aspectRatio) {
        proposedHeight = proposedWidth / aspectRatio;
      } else {
        proposedWidth = proposedHeight * aspectRatio;
      }
    }

    const newCenterX = unrotatedTopLeft[0] + proposedWidth / 2;
    const newCenterY = unrotatedTopLeft[1] + proposedHeight / 2;

    const newRotatedTopLeft = rotateAroundCenter(
      block.x,
      block.y,
      newCenterX,
      newCenterY,
      rotation,
    );

    const adjustedX = newRotatedTopLeft[0] - rotatedTopLeft[0];
    const adjustedY = newRotatedTopLeft[1] - rotatedTopLeft[1];

    const newX = unrotatedTopLeft[0] - adjustedX;
    const newY = unrotatedTopLeft[1] - adjustedY;
    let newWidth = proposedWidth;
    let newHeight = proposedHeight;

    setBlockMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      },
    }));
  });

  return (
    <>
      <div
        className="absolute left-1/2 touch-none pointer-events-auto bg-blue-500"
        style={{
          width: 2,
          height: 22,
          top: -size,
        }}
      ></div>
      <div
        {...dragBind()}
        className="absolute touch-none pointer-events-auto border-2 border-blue-500 bg-black"
        style={{
          right: -size / 2,
          bottom: -size / 2,
          cursor: "grab",
          width: size,
          height: size,
        }}
      />
    </>
  );
}

import { useEffect, useRef } from "react";
import { ImageBlockType, WebcamBlockType } from "./types";
import { useAtom } from "jotai";
import {
  BlockIdsAtom,
  BlockMapAtom,
  videoCanvasRefAtom,
  videoSizeAtom,
} from "./atoms";
import { v4 as uuid } from "uuid";
import { makeZIndex } from "./utils";

export function WebcamBlockUI({
  block,
  isSelected,
}: {
  block: WebcamBlockType;
  isSelected: boolean;
}) {
  const [, setBlockIds] = useAtom(BlockIdsAtom);
  const [, setBlockMap] = useAtom(BlockMapAtom);

  const size = 24;

  return (
    <>
      {isSelected && false ? (
        <div
          className="absolute left-1/2 -bottom-8 border-2 rounded-2xl border-blue-500 pointer-events-auto bg-black cursor-pointer"
          style={{
            marginLeft: -size,
            width: size * 1.5,
            height: size,
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
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
              src: dataUrl,
              type: "image",
              zIndex: makeZIndex(),
            } as ImageBlockType;
            setBlockIds((prev) => [...prev, newId]);
            setBlockMap((prev) => ({
              ...prev,
              [newId]: newBlock,
              [block.id]: {
                ...block,
                x: block.x + 12,
                y: block.y + 12,
                zIndex: makeZIndex() + 1,
              },
            }));
          }}
        ></div>
      ) : null}
    </>
  );
}

export function WebcamBlockRender({
  block,
}: {
  block: WebcamBlockType;
  isSelected: boolean;
}) {
  const [videoCanvasRef] = useAtom(videoCanvasRefAtom);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrame = useRef<number | null>(null);
  const [videoSize] = useAtom(videoSizeAtom);
  const [, setBlockMap] = useAtom(BlockMapAtom);

  useEffect(() => {
    if (canvasRef.current) {
      const targetWidth = block.crop ? block.crop.width : videoSize.width;
      const targetHeight = block.crop ? block.crop.height : videoSize.height;
      canvasRef.current.width = targetWidth;
      canvasRef.current.height = targetHeight;
      // set block size to match aspect ratio
      const targetAspectRatio = targetWidth / targetHeight;
      const blockAspectRatio = block.width / block.height;
      if (blockAspectRatio > targetAspectRatio) {
        setBlockMap((prev) => ({
          ...prev,
          [block.id]: {
            ...block,
            width: block.height * targetAspectRatio,
          },
        }));
      } else {
        setBlockMap((prev) => ({
          ...prev,
          [block.id]: {
            ...block,
            height: block.width / targetAspectRatio,
          },
        }));
      }
    }
  }, [videoSize]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      function draw() {
        if (block.crop) {
          ctx.drawImage(
            videoCanvasRef.current,
            block.crop.x,
            block.crop.y,
            block.crop.width,
            block.crop.height,
            0,
            0,
            block.crop.width,
            block.crop.height,
          );
        } else {
          ctx.drawImage(videoCanvasRef.current, 0, 0);
        }
        animationFrame.current = window.requestAnimationFrame(draw);
      }
      animationFrame.current = window.requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrame.current) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [canvasRef, videoSize, block.crop]);

  return (
    <div className="absolute pointer-events-none inset-0" draggable={false}>
      <canvas
        id={"canvas-" + block.id}
        ref={canvasRef}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

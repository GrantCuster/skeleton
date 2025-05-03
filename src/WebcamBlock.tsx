import { useEffect, useRef } from "react";
import { ImageBlockType, WebcamBlockType } from "./types";
import { useAtom } from "jotai";
import {
  BlockMapAtom,
  CameraAtom,
  videoCanvasRefAtom,
  videoSizeAtom,
} from "./atoms";

export function WebcamBlockUI() {
  const [camera] = useAtom(CameraAtom);

  return (
      <div
        className={`absolute border-2 border-white opacity-50`}
        style={{
          inset: -Math.max(8, 8 / camera.z),
          borderWidth: Math.max(2, 2 / camera.z),
        }}
      ></div>
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

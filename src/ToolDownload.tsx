import { useAtom } from "jotai";
import { StateRefAtom } from "./atoms";
import { useRef } from "react";

export function ToolDownload() {
  const [stateRef] = useAtom(StateRefAtom);
  const bufferCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="flex flex-col">
      <button
        className={`px-3 py-2 bg-neutral-800 hover:bg-neutral-700`}
        onClick={() => {
          bufferCanvasRef.current =
            bufferCanvasRef.current || document.createElement("canvas");
          finalCanvasRef.current =
            finalCanvasRef.current || document.createElement("canvas");

          const currentBlocks = stateRef.blockIds.map((id) => {
            const block = stateRef.blockMap[id];
            return {
              ...block,
            };
          });
          currentBlocks.sort((a, b) => {
            if (a.zIndex > b.zIndex) {
              return 1;
            } else if (a.zIndex < b.zIndex) {
              return -1;
            }
            return 0;
          });
          let minX = Infinity;
          let minY = Infinity;
          let maxX = -Infinity;
          let maxY = -Infinity;
          currentBlocks.forEach((block) => {
            if (block.x < minX) {
              minX = block.x;
            }
            if (block.y < minY) {
              minY = block.y;
            }
            if (block.x + block.width > maxX) {
              maxX = block.x + block.width;
            }
            if (block.y + block.height > maxY) {
              maxY = block.y + block.height;
            }
          });
          const proposedWidth = maxX - minX;
          const proposedHeight = maxY - minY;
          let width = proposedWidth;
          let height = proposedHeight;
          let scale = 1;
          const maxSize = 4096;

          const aspectRatio = proposedWidth / proposedHeight;

          if (proposedWidth > maxSize || proposedHeight > maxSize) {
            if (aspectRatio > 1) {
              width = maxSize;
              height = maxSize / aspectRatio;
            } else {
              width = maxSize * aspectRatio;
              height = maxSize;
            }
            scale = Math.min(maxSize / proposedWidth, maxSize / proposedHeight);
          }

          bufferCanvasRef.current.width = width;
          bufferCanvasRef.current.height = height;
          finalCanvasRef.current.width = width;
          finalCanvasRef.current.height = height;

          const ctx = bufferCanvasRef.current.getContext("2d")!;
          const ftx = finalCanvasRef.current.getContext("2d")!;

          for (const block of currentBlocks) {
            ctx.save();
            ctx.globalCompositeOperation =
              block.blend === "normal" ? "source-over" : block.blend;
            if (block.type === "image" && !block.crop) {
              ctx.drawImage(
                document.getElementById(
                  "image-" + block.id,
                ) as HTMLImageElement,
                block.x - minX,
                block.y - minY,
                block.width,
                block.height,
              );
            } else {
              ctx.drawImage(
                document.getElementById(
                  "canvas-" + block.id,
                ) as HTMLCanvasElement,
                block.x - minX,
                block.y - minY,
                block.width,
                block.height,
              );
            }
            ctx.restore();
          }

          ftx.fillStyle = "black";
          ftx.fillRect(0, 0, width, height);
          ftx.drawImage(
            bufferCanvasRef.current,
            0,
            0,
            width,
            height,
            0,
            0,
            width,
            height,
          );

          const dataUrl = bufferCanvasRef.current.toDataURL("image/jpg");
          const a = document.createElement("a");
          a.href = dataUrl;
          const timestamp = new Date().toISOString().replace(/:/g, "-");
          a.download = timestamp + "-skeleton.jpg";
          a.click();
          a.remove();
        }}
      >
        download
      </button>
    </div>
  );
}

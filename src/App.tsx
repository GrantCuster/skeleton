import { useAtom } from "jotai";
import { Keyboard } from "./Keyboard";
import { RefUpdater } from "./RefUpdater";
import { Toolbar } from "./Toolbar";
import { Zoom } from "./Zoom";
import {
  BlockIdsAtom,
  BlockMapAtom,
  videoCanvasRefAtom,
  videoSizeAtom,
} from "./atoms";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CropBoxType, WebcamBlockType } from "./types";

export function App() {
  return (
    <div className="w-full relative h-[100dvh]">
      <Zoom />
      <Toolbar />
      <Keyboard />
      <CropModal />
      <RefUpdater />
    </div>
  );
}

export default App;

export function CropModal() {
  const [videoSize] = useAtom(videoSizeAtom);
  const topSetRef = useRef<HTMLDivElement | null>(null);
  const bottomSetRef = useRef<HTMLDivElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const [videoCanvasRef] = useAtom(videoCanvasRefAtom);
  const [blockIds] = useAtom(BlockIdsAtom);
  const [blockMap, setBlockMap] = useAtom(BlockMapAtom);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrame = useRef<number | null>(null);
  const videoPadding = 8;
  const borderWidth = 2;
  const dragRef = useRef<{
    isDragging: boolean;
    start: { x: number; y: number };
    current: { x: number; y: number };
  }>({
    isDragging: false,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
  });
  const [videoContainerSize, setVideoContainerSize] = useState({
    width: 0,
    height: 0,
  });
  const [videoDisplayBox, setVideoDisplayBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const webcamBlockId = useMemo(() => {
    return blockIds.find((id: string) => {
      const block = blockMap[id];
      return block.type === "webcam" ? id : null;
    });
  }, [blockIds, blockMap]);
  const webcamBlock = useMemo(() => {
    return blockMap[webcamBlockId!] as WebcamBlockType;
  }, [webcamBlockId, blockMap]);

  function setCropBox(cropBox: CropBoxType) {
    setBlockMap((prev) => ({
      ...prev,
      [webcamBlockId!]: {
        ...prev[webcamBlockId!],
        crop: cropBox,
      },
    }));
  }

  function rawCoordsToCropBox() {
    const minX = Math.max(
      0,
      Math.min(dragRef.current.start.x, dragRef.current.current.x),
    );
    const minY = Math.max(
      0,
      Math.min(dragRef.current.start.y, dragRef.current.current.y),
    );
    const maxX = Math.min(
      videoDisplayBox.width,
      Math.max(dragRef.current.start.x, dragRef.current.current.x),
    );
    const maxY = Math.min(
      videoDisplayBox.height,
      Math.max(dragRef.current.start.y, dragRef.current.current.y),
    );
    const x = minX;
    const y = minY;
    const width = maxX - minX;
    const height = maxY - minY;
    const cropBox = {
      x: Math.round((x / videoDisplayBox.width) * videoSize.width),
      y: Math.round((y / videoDisplayBox.height) * videoSize.height),
      width: Math.round((width / videoDisplayBox.width) * videoSize.width),
      height: Math.round((height / videoDisplayBox.height) * videoSize.height),
    };
    return cropBox;
  }

  useEffect(() => {
    function handleResize() {
      if (topSetRef.current && bottomSetRef.current) {
        const topSet = topSetRef.current.getBoundingClientRect();
        const bottomSet = bottomSetRef.current.getBoundingClientRect();
        const topSetHeight = topSet.height;
        const bottomSetHeight = bottomSet.height;

        const availableHeight =
          window.innerHeight -
          topSetHeight -
          bottomSetHeight -
          videoPadding * 2;
        const availableWidth = window.innerWidth - videoPadding * 2;
        let videoWidth = availableWidth;
        let videoHeight = availableHeight;
        const aspectRatio = videoSize.width / videoSize.height;
        if (availableWidth / availableHeight > aspectRatio) {
          videoWidth = availableHeight * aspectRatio;
        } else {
          videoHeight = availableWidth / aspectRatio;
        }
        // width is always 100%
        const videoContainerHeight = videoHeight + videoPadding * 2;
        videoContainerRef.current!.style.height = `${videoContainerHeight}px`;
        canvasRef.current!.style.width = `${videoWidth}px`;
        canvasRef.current!.style.height = `${videoHeight}px`;
        const sidePadding = (window.innerWidth - videoWidth) / 2;
        const topPadding = videoPadding;
        setVideoContainerSize({
          width: window.innerWidth,
          height: videoContainerHeight,
        });
        setVideoDisplayBox({
          x: sidePadding,
          y: topPadding,
          width: videoWidth,
          height: videoHeight,
        });
        videoContainerRef.current!.style.padding = `${topPadding}px ${sidePadding}px`;
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [videoSize]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")!;
      function draw() {
        ctx.drawImage(videoCanvasRef.current, 0, 0);
        animationFrame.current = window.requestAnimationFrame(draw);
      }
      animationFrame.current = window.requestAnimationFrame(draw);
    }
    return () => {
      if (animationFrame.current) {
        window.cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [canvasRef]);

  return (
    <div className="absolute inset-0 pointer-events-none flex">
      <div className="m-auto bg-neutral-800 w-full pointer-events-auto">
        <div className="w-full flex flex-col" ref={topSetRef}>
          <div className="px-2 py-1">Crop</div>
        </div>
        <div
          ref={videoContainerRef}
          className="relative"
          onPointerDown={(e) => {
            if (e.button === 0) {
              e.currentTarget.setPointerCapture(e.pointerId);
              const rect = videoContainerRef.current?.getBoundingClientRect();
              dragRef.current.isDragging = true;
              dragRef.current.start.x =
                e.clientX - (rect?.left || 0) - videoPadding;
              dragRef.current.start.y =
                e.clientY - (rect?.top || 0) - videoPadding;
              dragRef.current.current.x =
                e.clientX - (rect?.left || 0) - videoPadding;
              dragRef.current.current.y =
                e.clientY - (rect?.top || 0) - videoPadding;
              setCropBox(rawCoordsToCropBox());
            }
          }}
          onPointerMove={(e) => {
            if (dragRef.current.isDragging) {
              const rect = videoContainerRef.current?.getBoundingClientRect();
              dragRef.current.current.x =
                e.clientX - (rect?.left || 0) - videoPadding;
              dragRef.current.current.y =
                e.clientY - (rect?.top || 0) - videoPadding;
              setCropBox(rawCoordsToCropBox());
            }
          }}
          onPointerUp={(e) => {
            if (dragRef.current.isDragging) {
              e.currentTarget.releasePointerCapture(e.pointerId);
              dragRef.current.isDragging = false;
            }
          }}
        >
          <canvas
            className="w-full h-full pointer-events-none"
            ref={canvasRef}
            width={videoSize.width}
            height={videoSize.height}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: videoDisplayBox.x,
              top: videoDisplayBox.y,
              width: videoDisplayBox.width,
              height: videoDisplayBox.height,
            }}
          >
            {webcamBlock.crop && (
              <div
                className="absolute pointer-events-auto border-2 border-neutral-500"
                style={{
                  left:
                    (webcamBlock.crop.x / videoSize.width) *
                    videoDisplayBox.width,
                  top:
                    (webcamBlock.crop.y / videoSize.height) *
                    videoDisplayBox.height,
                  width:
                    (webcamBlock.crop.width / videoSize.width) *
                    videoDisplayBox.width,
                  height:
                    (webcamBlock.crop.height / videoSize.height) *
                    videoDisplayBox.height,
                }}
              />
            )}
          </div>
        </div>
        <div className="w-full flex justify-between" ref={bottomSetRef}>
          <div className="px-2 py-1">
            {videoSize.width}x{videoSize.height}
          </div>
          <div className="flex">
            {webcamBlock.crop && (
              <>
                <div className="px-2 py-1">
                  {webcamBlock.crop.x},{webcamBlock.crop.y}{" "}
                  {webcamBlock.crop.width}x{webcamBlock.crop.height}
                </div>
                <button className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600" onClick={() => setCropBox(null)}>
                  &times;
                </button>
              </>
            )}
          </div>
          <div className="flex">
            <button className="px-2 py-1 bg-neutral-700" onClick={() => setCropBox(null)}>
              crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

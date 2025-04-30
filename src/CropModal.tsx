import { useAtom } from "jotai";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  videoSizeAtom,
  videoCanvasRefAtom,
  BlockIdsAtom,
  BlockMapAtom,
  showCropModalAtom,
} from "./atoms";
import { WebcamBlockType, CropBoxType } from "./types";
import { pointIntersectBox } from "./utils";

export function CropModal() {
  const [, setShowCropModal] = useAtom(showCropModalAtom);
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
  const dragRef = useRef<{
    isCreating: boolean;
    isMoving: boolean;
    start: { x: number; y: number };
    current: { x: number; y: number };
    ref: { x: number; y: number };
  }>({
    isCreating: false,
    isMoving: false,
    start: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    ref: { x: 0, y: 0 },
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

  function moveCropBox() {
    const dx =
      ((dragRef.current.current.x - dragRef.current.start.x) /
        videoDisplayBox.width) *
      videoSize.width;
    const dy =
      ((dragRef.current.current.y - dragRef.current.start.y) /
        videoDisplayBox.height) *
      videoSize.height;
    let newX = Math.round(dragRef.current.ref.x + dx);
    let newY = Math.round(dragRef.current.ref.y + dy);
    const maxX = videoSize.width - webcamBlock.crop!.width;
    const maxY = videoSize.height - webcamBlock.crop!.height;
    const minX = 0;
    const minY = 0;
    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));
    const cropBox = {
      x: newX,
      y: newY,
      width: webcamBlock.crop!.width,
      height: webcamBlock.crop!.height,
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

  function handleCrop() {
    // resize block based on crop
    const cropAspectRatio = webcamBlock.crop!.width / webcamBlock.crop!.height;
    const blockAspectRatio = webcamBlock.width / webcamBlock.height;
    if (blockAspectRatio > cropAspectRatio) {
      setBlockMap((prev) => ({
        ...prev,
        [webcamBlockId!]: {
          ...prev[webcamBlockId!],
          width: webcamBlock.crop!.height * cropAspectRatio,
        },
      }));
    } else {
      setBlockMap((prev) => ({
        ...prev,
        [webcamBlockId!]: {
          ...prev[webcamBlockId!],
          height: webcamBlock.crop!.width / cropAspectRatio,
        },
      }));
    }
    setShowCropModal(false);
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex">
      <div className="m-auto bg-neutral-800 w-full pointer-events-auto">
        <div className="w-full flex flex-col" ref={topSetRef}>
          <div className="flex justify-between">
            <div className="px-2 py-1">Crop</div>
            <button
              className="px-2 py-1 hover:bg-neutral-700"
              onClick={() => setShowCropModal(false)}
            >
              &times;
            </button>
          </div>
        </div>
        <div
          ref={videoContainerRef}
          className="relative"
          onPointerDown={(e) => {
            if (e.button === 0) {
              e.currentTarget.setPointerCapture(e.pointerId);
              const rect = videoContainerRef.current?.getBoundingClientRect();
              dragRef.current.start.x =
                e.clientX - (rect?.left || 0) - videoPadding;
              dragRef.current.start.y =
                e.clientY - (rect?.top || 0) - videoPadding;
              dragRef.current.current.x =
                e.clientX - (rect?.left || 0) - videoPadding;
              dragRef.current.current.y =
                e.clientY - (rect?.top || 0) - videoPadding;
              const isIntersecting =
                webcamBlock.crop &&
                pointIntersectBox(
                  {
                    x: Math.round(
                      (dragRef.current.start.x / videoDisplayBox.width) *
                      videoSize.width,
                    ),
                    y: Math.round(
                      (dragRef.current.start.y / videoDisplayBox.height) *
                      videoSize.height,
                    ),
                  },
                  webcamBlock.crop,
                );
              if (isIntersecting) {
                dragRef.current.isMoving = true;
                dragRef.current.ref.x = webcamBlock.crop!.x;
                dragRef.current.ref.y = webcamBlock.crop!.y;
              } else {
                dragRef.current.isCreating = true;
                setCropBox(rawCoordsToCropBox());
              }
            }
          }}
          onPointerMove={(e) => {
            if (dragRef.current.isCreating || dragRef.current.isMoving) {
              const rect = videoContainerRef.current?.getBoundingClientRect();
              dragRef.current.current.x =
                e.clientX - (rect?.left || 0) - videoPadding;
              dragRef.current.current.y =
                e.clientY - (rect?.top || 0) - videoPadding;
              if (dragRef.current.isCreating) {
                setCropBox(rawCoordsToCropBox());
              } else if (dragRef.current.isMoving) {
                setCropBox(moveCropBox());
              }
            }
          }}
          onPointerUp={(e) => {
            if (dragRef.current.isCreating || dragRef.current.isMoving) {
              e.currentTarget.releasePointerCapture(e.pointerId);
              dragRef.current.isCreating = false;
              dragRef.current.isMoving = false;
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
                className="absolute pointer-events-auto border-2 border-blue-500"
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
                <button
                  className="px-2 py-1 bg-neutral-700 hover:bg-neutral-600"
                  onClick={() => setCropBox(null)}
                >
                  &times;
                </button>
              </>
            )}
          </div>
          <div className="flex">
            <button
              className={`px-2 py-1 ${webcamBlock.crop ? "bg-blue-700 hover:bg-blue-600" : "bg-neutral-500 cursor-not-allowed"}`}
              onClick={() => handleCrop()}
            >
              crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

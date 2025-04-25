import { useEffect } from "react";
import { useAtom } from "jotai";
import { mediaStreamAtom, videoCanvasRefAtom, videoSizeAtom } from "./atoms";

const videoElRef: { current: HTMLVideoElement | null } = { current: null };
const drawRequestRef: { current: number | null } = { current: null };

export function useStream() {
  const [stream] = useAtom(mediaStreamAtom);
  const [, setSize] = useAtom(videoSizeAtom);
  const [videoCanvasRef] = useAtom(videoCanvasRefAtom);

  useEffect(() => {
    if (stream) {
      if (!videoElRef.current) {
        videoElRef.current = document.createElement("video");
        videoElRef.current.style.position = "absolute";
        videoElRef.current.style.left = "0";
        videoElRef.current.style.top = "0";
        videoElRef.current.style.opacity = "0";
        videoElRef.current.style.pointerEvents = "none";
        document.body.appendChild(videoElRef.current);
      }
      const videoEl = videoElRef.current;
      const canvasEl = videoCanvasRef.current;
      videoEl.autoplay = true;
      videoEl.playsInline = true;
      videoEl.muted = true;
      videoEl.onloadedmetadata = () => {
        const videoWidth = videoEl.videoWidth;
        const videoHeight = videoEl.videoHeight;
        setSize({ width: videoWidth, height: videoHeight });
        canvasEl.width = videoWidth;
        canvasEl.height = videoHeight;
        const ctx = canvasEl.getContext("2d")!;
        function draw() {
          ctx.drawImage(videoEl, 0, 0);
          drawRequestRef.current = window.requestAnimationFrame(draw);
        }
        drawRequestRef.current = window.requestAnimationFrame(draw);
      };
      videoEl.srcObject = stream;
    }
    return () => {
      if (drawRequestRef.current !== null) {
        window.cancelAnimationFrame(drawRequestRef.current);
      }
    };
  }, [stream]);
}

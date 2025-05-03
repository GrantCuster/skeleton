import { useEffect, useState } from "react";
import { BlockType, BoxType, PointType } from "./types";

// load image as promise
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function makeZIndex() {
  return Math.round((Date.now() - 1729536285367) / 100);
}

export function pointIntersectBlocks({ x, y }: PointType, blocks: BlockType[]) {
  return blocks.filter((block) => {
    return (
      x >= block.x &&
      x <= block.x + block.width &&
      y >= block.y &&
      y <= block.y + block.height
    );
  });
}

export function pointIntersectBox({ x, y }: PointType, box: BoxType) {
  return (
    x >= box.x &&
    x <= box.x + box.width &&
    y >= box.y &&
    y <= box.y + box.height
  );
}

export function pointIntersectsRotatedBlock({
  x,
  y,
}: PointType, block: BlockType) {
  const cx = block.x + block.width / 2;
  const cy = block.y + block.height / 2;
  const angle = -block.rotation;

  // rotate point around center of block
  const rotatedPoint = rotateAroundCenter(x, y, cx, cy, angle);

  return (
    rotatedPoint[0] >= block.x &&
    rotatedPoint[0] <= block.x + block.width &&
    rotatedPoint[1] >= block.y &&
    rotatedPoint[1] <= block.y + block.height
  );
}

// TODO make this work
export function blockIntersectBlocks(
  { x, y, width, height }: BlockType,
  blocks: BlockType[],
) {
  return blocks.filter((block) => {
    return (
      x < block.x + block.width &&
      x + width > block.x &&
      y < block.y + block.height &&
      y + height > block.y
    );
  });
}

export async function appletResolveImage(src: string) {
  if (window.location.origin.includes("usercontent.goog")) {
    // const noStartingSlash = src.startsWith("/") ? src.slice(1) : src;
    const ghPagesSource = "https://grantcuster.github.io/blocks/" + src;
    const fetchURL = src.startsWith("data") ? src : ghPagesSource;
    const fetched = await fetch(fetchURL);
    const blob = await fetched.blob();
    const url = URL.createObjectURL(blob);
    return url;
  } else {
    return src;
  }
}

export function useImageHandler(src: string) {
  const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);

  useEffect(() => {
    async function main() {
      const url = await appletResolveImage(src);
      setResolvedSrc(url);
    }
    main();
  }, [src]);

  return resolvedSrc;
}

export function rotateAroundCenter(
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



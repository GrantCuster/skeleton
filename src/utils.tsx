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

export function pointIntersectsBlocks({ x, y }: PointType, blocks: BlockType[]) {
  return blocks.filter((block) => {
    return pointIntersectsRotatedBlock({ x, y }, block);
  });
}

export function pointIntersectsBox(
  { x, y }: PointType,
  box: BoxType,
): boolean {
  return (
    x >= box.x &&
    x <= box.x + box.width &&
    y >= box.y &&
    y <= box.y + box.height
  );
}

export function pointIntersectsRotatedBlock(
  { x, y }: PointType,
  block: BlockType,
) {
  const cx = block.x + block.width / 2;
  const cy = block.y + block.height / 2;
  const angle = -(block.rotation || 0);

  // rotate point around center of block
  const rotatedPoint = rotateAroundCenter(x, y, cx, cy, angle);

  return (
    rotatedPoint[0] >= block.x &&
    rotatedPoint[0] <= block.x + block.width &&
    rotatedPoint[1] >= block.y &&
    rotatedPoint[1] <= block.y + block.height
  );
}

export function blockIntersectBlocks(
  { x, y, width, height }: BlockType,
  blocks: BlockType[],
): BlockType[] {
  return blocks.filter((block) => {
    return (
      x < block.x + block.width &&
      x + width > block.x &&
      y < block.y + block.height &&
      y + height > block.y
    );
  });
}

export function blockIntersectsRotatedBlocks(
  { x, y, width, height }: BlockType,
  blocks: BlockType[],
) {
  return blocks.filter((block) => {
    const cx = block.x + block.width / 2;
    const cy = block.y + block.height / 2;
    const angle = -(block.rotation || 0);

    // rotate point around center of block
    const rotatedBlock = rotateAroundCenter(x, y, cx, cy, angle);

    return (
      rotatedBlock[0] < block.x + block.width &&
      rotatedBlock[0] + width > block.x &&
      rotatedBlock[1] < block.y + block.height &&
      rotatedBlock[1] + height > block.y
    );
  });
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

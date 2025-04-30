import { atom } from "jotai";
import {
  BlockType,
  CameraSettingsType,
  ModeType,
  SizeType,
  StateRefType,
} from "./types";
import { starterBlocks } from "./starterBlocks";
import { atomWithStorage } from "jotai/utils";

export const CameraAtom = atom({
  x: 0,
  y: 0,
  z: 1,
});

export const ZoomContainerAtom = atom<HTMLDivElement | null>(null);

export const ModeAtom = atom<ModeType>("move");

export const BlockIdsAtom = atom<string[]>(
  starterBlocks.map((block) => block.id),
);
let starterBlockMap: Record<string, BlockType> = {};
for (const block of starterBlocks) {
  starterBlockMap[block.id] = block as BlockType;
}
export const BlockMapAtom = atom<Record<string, BlockType>>(starterBlockMap);

export const SelectedBlockIdsAtom = atom<string[]>([]);

export const BlockSelectorAtom = atom<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);

export const videoSizeAtom = atom<SizeType>({
  width: 0,
  height: 0,
});

export const StateRefAtom = atom<StateRefType>({
  camera: { x: 0, y: 0, z: 1 },
  blockIds: [],
  blockMap: {},
  mode: "move",
  zoomContainer: null,
  selectedBlockIds: [],
  blockSelector: null,
});

export const cameraSettingsAtom = atomWithStorage<
  Record<string, CameraSettingsType>
>("camera-settings", {});

export const mediaStreamAtom = atom<MediaStream | null>(null);

export const videoCanvasRefAtom = atom<{ current: HTMLCanvasElement }>({
  current: document.createElement("canvas"),
});

export const isDraggingAtom = atom(false);

export const showCameraBlockAtom = atom(true);

// maybe expand to images later
export const showCropModalAtom = atom<boolean>(false);

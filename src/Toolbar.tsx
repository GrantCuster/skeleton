import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import {
  BlockIdsAtom,
  BlockMapAtom,
  CameraAtom,
  SelectedBlockIdsAtom,
  SelectedBoxAtom,
  showCropModalAtom,
  stampMoveDirectionAtom,
  stampMoveOffsetAtom,
} from "./atoms";
import { useDevices } from "./useDevices";
import { useStream } from "./useStream";
import { FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { makeZIndex } from "./utils";
import {
  BlendTypes,
  ImageBlockType,
  StampMoveDirectionType,
  StampMoveOffsetType,
  WebcamBlockType,
} from "./types";
import { blendOptions, offsetLookup } from "./consts";
import { ToolCameraSelector } from "./ToolCameraSelector";
import { ToolBlendSelector } from "./ToolBlendSelector";
import { ToolFlipper } from "./ToolFlipper";
import { ToolCrop } from "./ToolCrop";
import { ToolStamp } from "./ToolStamp";

export function Toolbar() {
  const [blockIds, setBlockIds] = useAtom(BlockIdsAtom);
  const [, setShowCropModal] = useAtom(showCropModalAtom);
  const [blockMap, setBlockMap] = useAtom(BlockMapAtom);
  const [, setCamera] = useAtom(CameraAtom);
  const [selectedBox] = useAtom(SelectedBoxAtom);
  const [selectedBlockIds, setSelectedBlockIds] = useAtom(SelectedBlockIdsAtom);
  const [stampMoveDirection, setStampMoveDirection] = useAtom(
    stampMoveDirectionAtom,
  );
  const [stampMoveOffset, setStampMoveOffset] = useAtom(stampMoveOffsetAtom);
  useStream();

  const selectedBlocks = useMemo(() => {
    return selectedBlockIds.map((id) => blockMap[id]);
  }, [blockMap, selectedBlockIds]);

  const selectedWebcamBlocks = selectedBlocks.filter(
    (block) => block.type === "webcam",
  );

  const selectedImageBlocks = selectedBlocks.filter(
    (block) => block.type === "image",
  );

  const blocksAreSelected = selectedBlockIds.length > 0;
  const singleBlockSelected = selectedBlockIds.length === 1;
  const multipleBlocksSelected = selectedBlockIds.length > 1;
  const webcamIsSelected = selectedWebcamBlocks.length > 0;

  return (
    <>
      <div className="absolute left-0 bottom-0 w-full">
        <div className="flex flex-wrap items-end">
          {webcamIsSelected && (
            <ToolCameraSelector webcamBlocks={selectedWebcamBlocks} />
          )}
          {blocksAreSelected ? (
            <ToolBlendSelector blocks={selectedBlocks} />
          ) : null}
          {blocksAreSelected ? <ToolFlipper blocks={selectedBlocks} /> : null}
          {singleBlockSelected ? <ToolCrop block={selectedBlocks[0]} /> : null}
          {webcamIsSelected ? (
            <ToolStamp blocks={selectedWebcamBlocks} />
          ) : null}
        </div>
        <div className="flex flex-wrap">
          {selectedBlockIds.length > 0 ? (
            <div className="px-3 py-2">{`${selectedBlockIds.length} selected`}</div>
          ) : (
            <div className="px-3 py-2">{`0 selected`}</div>
          )}
          {selectedBox ? (
            <div className="px-3 py-2">
              {Math.round(selectedBox.x)}, {Math.round(selectedBox.y)}{" "}
              {Math.round(selectedBox.width)}x{Math.round(selectedBox.height)}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

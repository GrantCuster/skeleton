import { useAtom } from "jotai";
import {
  BlockIdsAtom,
  BlockMapAtom,
  isDraggingAtom,
  SelectedBlockIdsAtom,
  showCameraBlockAtom,
  showCropModalAtom,
} from "./atoms";
import { ImageBlockType, WebcamBlockType } from "./types";
import { ImageBlock } from "./ImageBlock";
import { BlockResizers } from "./BlockResizers";
import { WebcamBlockRender, WebcamBlockUI } from "./WebcamBlock";
import { BlockRotators } from "./BlockRotators";

export function Blocks() {
  const [blockIds] = useAtom(BlockIdsAtom);
  return (
    <>
      <div className="absolute z-0">
        {blockIds.map((id) => {
          return <BlockRender key={id} id={id} />;
        })}
        {blockIds.map((id) => {
          return <BlockUI key={id} id={id} />;
        })}
      </div>
    </>
  );
}

export function BlockUI({ id }: { id: string }) {
  const [blockMap] = useAtom(BlockMapAtom);
  const block = blockMap[id];
  const [selectedBlockIds] = useAtom(SelectedBlockIdsAtom);
  const isSelected = selectedBlockIds.includes(id);

  return (
    <>
      <div
        className={`absolute border-2 ${isSelected ? "border-blue-500" : "border-transparent"} touch-none pointer-events-auto`}
        style={{
          left: block.x,
          top: block.y,
          width: block.width,
          height: block.height,
          zIndex: block.zIndex,
          transform: `rotate(${block.rotation}rad)`,
        }}
      >
        <BlockUIFactory id={id} isSelected={isSelected} />
        {isSelected ? <BlockResizers id={id} /> : null}
        {isSelected ? <BlockRotators id={id} /> : null}
        {isSelected && block.type === "webcam" ? <CropButton id={id} /> : null}
      </div>
    </>
  );
}

export function CropButton({ id }: { id: string }) {
  const [, setShowCropModal] = useAtom(showCropModalAtom);
  const size = 24;

  return (
    <div
      className="absolute border-2 rounded-2xl border-blue-500 pointer-events-auto bg-black cursor-pointer"
      style={{
        left: -size / 2,
        bottom: -size / 2,
        width: size,
        height: size,
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        setShowCropModal(id);
      }}
    ></div>
  );
}

export function BlockRender({ id }: { id: string }) {
  const [blockMap] = useAtom(BlockMapAtom);
  const block = blockMap[id];
  const [selectedBlockIds] = useAtom(SelectedBlockIdsAtom);
  const isSelected = selectedBlockIds.includes(id);

  return (
    <div
      className={`absolute border-2 ${isSelected ? "border-blue-500" : "border-transparent"} touch-none pointer-events-auto`}
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
        zIndex: block.zIndex,
        mixBlendMode: block.blend || "normal",
        transform: `rotate(${block.rotation}rad)`,
      }}
    >
      <BlockRenderFactory id={id} isSelected={isSelected} />
    </div>
  );
}

export function BlockUIFactory({
  id,
  isSelected,
}: {
  id: string;
  isSelected: boolean;
}) {
  const [blockMap] = useAtom(BlockMapAtom);
  const [showCameraBlock] = useAtom(showCameraBlockAtom);
  const block = blockMap[id];

  switch (block.type) {
    case "image":
      return null;
    case "webcam":
      return showCameraBlock ? (
        <WebcamBlockUI
          block={block as WebcamBlockType}
          isSelected={isSelected}
        />
      ) : null;
    default:
      return null;
  }
}

export function BlockRenderFactory({
  id,
  isSelected,
}: {
  id: string;
  isSelected: boolean;
}) {
  const [blockMap] = useAtom(BlockMapAtom);
  const [showCameraBlock] = useAtom(showCameraBlockAtom);
  const block = blockMap[id];

  switch (block.type) {
    case "image":
      return <ImageBlock block={block as ImageBlockType} />;
    case "webcam":
      return showCameraBlock ? (
        <WebcamBlockRender
          block={block as WebcamBlockType}
          isSelected={isSelected}
        />
      ) : null;
    default:
      return null;
  }
}

export function RenderLayer() {}

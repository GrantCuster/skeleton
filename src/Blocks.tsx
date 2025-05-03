import { useAtom } from "jotai";
import { BlockIdsAtom, BlockMapAtom, SelectedBlockIdsAtom } from "./atoms";
import { ImageBlockType, WebcamBlockType } from "./types";
import { ImageBlock } from "./ImageBlock";
import { WebcamBlockRender, WebcamBlockUI } from "./WebcamBlock";
import { BlockRotators } from "./BlockRotators";

export function Blocks() {
  const [blockIds] = useAtom(BlockIdsAtom);
  return (
    <>
      <div className="absolute z-0">
        <div className="absolute z-0">
          {blockIds.map((id) => {
            return <BlockRender key={id} id={id} />;
          })}
        </div>
        <div className="absolute z-5">
          {blockIds.map((id) => {
            return <BlockUI key={id} id={id} />;
          })}
        </div>
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
        className={`absolute touch-none pointer-events-auto`}
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
        {isSelected ? <BlockRotators id={id} /> : null}
      </div>
    </>
  );
}

export function BlockRender({ id }: { id: string }) {
  const [blockMap] = useAtom(BlockMapAtom);
  const block = blockMap[id];
  const [selectedBlockIds] = useAtom(SelectedBlockIdsAtom);
  const isSelected = selectedBlockIds.includes(id);

  return (
    <div
      className={`absolute touch-none pointer-events-auto`}
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

export function BlockUIFactory({ id }: { id: string; isSelected: boolean }) {
  const [blockMap] = useAtom(BlockMapAtom);
  const block = blockMap[id];

  switch (block.type) {
    case "image":
      return null;
    case "webcam":
      return <WebcamBlockUI />;
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
  const block = blockMap[id];

  switch (block.type) {
    case "image":
      return <ImageBlock block={block as ImageBlockType} />;
    case "webcam":
      return (
        <WebcamBlockRender
          block={block as WebcamBlockType}
          isSelected={isSelected}
        />
      );
    default:
      return null;
  }
}

export function RenderLayer() { }

import { useAtom } from "jotai";
import {
  CameraAtom,
  SelectedBoxAtom,
} from "./atoms";
import { BlockType } from "./types";
import { SingleBlockResizer } from "./SingleBlockResizer";
import { MultipleBlockResizer } from "./MultipleBlockResizer";
import { SingleBlockRotator } from "./SingleBlockRotator";
import { MultipleBlockRotator } from "./MultipleBlockRotator";

export function BlockSelected() {
  const [blockSelector] = useAtom(SelectedBoxAtom);
  const [camera] = useAtom(CameraAtom);

  return blockSelector ? (
    <>
      <div
        className="absolute pointer-events-none border-[2px] border-blue-500"
        style={{
          left: blockSelector.x,
          top: blockSelector.y,
          width: blockSelector.width,
          height: blockSelector.height,
          transform: `rotate(${blockSelector.rotation}rad)`,
          borderWidth: Math.max(2, 2 / camera.z),
        }}
      >
        {blockSelector.length === 1 ? (
          <>
            <SingleBlockResizer />
            <SingleBlockRotator />
          </>
        ) : (
          <>
            <MultipleBlockResizer blockSelector={blockSelector} />
            <MultipleBlockRotator blockSelector={blockSelector} />
          </>
        )}
      </div>
    </>
  ) : null;
}



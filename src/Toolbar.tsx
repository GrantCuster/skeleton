import { useAtom } from "jotai";
import { useEffect, useMemo } from "react";
import {
  BlockIdsAtom,
  BlockMapAtom,
  ModeAtom,
  SelectedBlockIdsAtom,
  showCameraBlockAtom,
} from "./atoms";
import { useDevices } from "./useDevices";
import { useStream } from "./useStream";
import { FlipHorizontal2, FlipVertical2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { makeZIndex } from "./utils";
import { BlendTypes, ImageBlockType } from "./types";
import { blendOptions } from "./consts";

export function Toolbar() {
  const [mode, setMode] = useAtom(ModeAtom);
  const [blockIds, setBlockIds] = useAtom(BlockIdsAtom);
  const [blockMap, setBlockMap] = useAtom(BlockMapAtom);
  const [selectedBlockIds] = useAtom(SelectedBlockIdsAtom);
  const {
    devices,
    selectedDeviceIndex,
    setSelectedDeviceIndex,
    selectedDeviceLabel,
    cameraSettings,
    setCameraSettings,
  } = useDevices();
  useStream();
  const [showCameraBlock, setShowCameraBlock] = useAtom(showCameraBlockAtom);

  useEffect(() => {
    function handleModifierDown(event: KeyboardEvent) {}
    function handleModifierUp(event: KeyboardEvent) {}
    window.addEventListener("keydown", handleModifierDown);
    window.addEventListener("keyup", handleModifierUp);
    return () => {
      window.removeEventListener("keydown", handleModifierDown);
      window.removeEventListener("keyup", handleModifierUp);
    };
  }, [mode, setMode]);

  const cameraBlockId = useMemo(() => {
    return blockIds.find((id: string) => {
      const block = blockMap[id];
      return block.type === "webcam" ? block : null;
    });
  }, [blockIds, blockMap]);

  const cameraBlockSelected = useMemo(() => {
    return selectedBlockIds.some((id) => {
      const block = blockMap[id];
      return block.type === "webcam" ? block : null;
    });
  }, [selectedBlockIds, blockMap]);
  const selectedBlock =
    selectedBlockIds.length === 1 ? blockMap[selectedBlockIds[0]] : null;

  return (
    <>
      <div className="absolute left-0 bottom-0 w-full flex justify-end flex-wrap">
        <label className="px-3 py-2 pointer-events-auto bg-neutral-800 hover:bg-neutral-700 flex gap-2 justify-center items-center select-none">
          <input
            className="-top-px"
            type="checkbox"
            checked={showCameraBlock}
            onChange={() => setShowCameraBlock(!showCameraBlock)}
          />
          <div>show camera</div>
        </label>
        {selectedBlockIds.length > 0 ? (
          <div className="px-3 py-2">{`${selectedBlockIds.length} selected`}</div>
        ) : null}
        {selectedBlock ? (
          <div className="px-3 py-2">
            {Math.round(selectedBlock.x)}, {Math.round(selectedBlock.y)}{" "}
            {Math.round(selectedBlock.width)}x{Math.round(selectedBlock.height)}
          </div>
        ) : null}
        {cameraBlockSelected ? (
          <>
            {devices.length > 0 ? (
              devices.length > 1 ? (
                <select
                  value={selectedDeviceIndex || ""}
                  onChange={(e) =>
                    setSelectedDeviceIndex(Number(e.target.value))
                  }
                  className="px-3 pointer-events-auto py-2 bg-neutral-800 focus:outline-none"
                >
                  {devices.map((device, index) => (
                    <option
                      value={index}
                      key={device.deviceId}
                      className="px-3 py-2 bg-neutral-800"
                    >
                      {device.label || `Camera $ {device.deviceId}`}
                    </option>
                  ))}
                </select>
              ) : null
            ) : null}
            <select
              value={blockMap[cameraBlockId!].blend}
              onChange={(e) =>
                setBlockMap((prev) => ({
                  ...prev,
                  [cameraBlockId!]: {
                    ...prev[cameraBlockId!],
                    blend: e.target.value as BlendTypes,
                  },
                }))
              }
              className="px-3 pointer-events-auto py-2 bg-neutral-800 focus:outline-none"
            >
              {blendOptions.map((item) => (
                <option
                  value={item}
                  key={item}
                  className="px-3 py-2 bg-neutral-800"
                >
                  {item}
                </option>
              ))}
            </select>

            <button
              className="px-3 py-2 pointer-events-auto bg-neutral-800 hover:bg-neutral-700 flex justify-center items-center"
              onClick={() => {
                if (selectedDeviceLabel) {
                  setCameraSettings((prev) => ({
                    ...prev,
                    [selectedDeviceLabel]: {
                      ...prev[selectedDeviceLabel],
                      flipHorizontal: !cameraSettings.flipHorizontal,
                    },
                  }));
                }
              }}
            >
              <FlipHorizontal2 size={14} />
            </button>
            <button
              className="px-3 py-2 pointer-events-auto bg-neutral-800 hover:bg-neutral-700 flex justify-center items-center"
              onClick={() => {
                if (selectedDeviceLabel) {
                  setCameraSettings((prev) => ({
                    ...prev,
                    [selectedDeviceLabel]: {
                      ...prev[selectedDeviceLabel],
                      flipVertical: !cameraSettings.flipVertical,
                    },
                  }));
                }
              }}
            >
              <FlipVertical2 size={14} />
            </button>
            <button
              className="px-3 py-2 pointer-events-auto bg-neutral-800 hover:bg-neutral-700 flex justify-center items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (!cameraBlockId) return;
                const block = blockMap[cameraBlockId];
                const canvas = document.getElementById(
                  "canvas-" + block.id,
                ) as HTMLCanvasElement;
                const dataUrl = canvas.toDataURL();
                const newId = uuid();
                const newBlock = {
                  id: newId,
                  x: block.x,
                  y: block.y,
                  width: block.width,
                  height: block.height,
                  rotation: block.rotation,
                  src: dataUrl,
                  blend: block.blend,
                  type: "image",
                  zIndex: makeZIndex(),
                } as ImageBlockType;
                setBlockIds((prev) => [...prev, newId]);
                setBlockMap((prev) => ({
                  ...prev,
                  [newId]: newBlock,
                  [block.id]: {
                    ...block,
                    x: block.x + 12,
                    y: block.y + 12,
                    zIndex: makeZIndex() + 1,
                  },
                }));
              }}
            >
              Stamp
            </button>
          </>
        ) : null}
      </div>
    </>
  );
}

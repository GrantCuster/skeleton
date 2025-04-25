import { useAtom } from "jotai";
import { useEffect } from "react";
import { ModeAtom } from "./atoms";
import { useDevices } from "./useDevices";
import { useStream } from './useStream';
import { FlipHorizontal2, FlipVertical2 } from "lucide-react";

export function Toolbar() {
  const [mode, setMode] = useAtom(ModeAtom);
  const {
    devices,
    selectedDeviceIndex,
    setSelectedDeviceIndex,
    selectedDeviceLabel,
    cameraSettings,
    setCameraSettings,
  } = useDevices();
  useStream();

  useEffect(() => {
    function handleModifierDown(event: KeyboardEvent) { }
    function handleModifierUp(event: KeyboardEvent) { }
    window.addEventListener("keydown", handleModifierDown);
    window.addEventListener("keyup", handleModifierUp);
    return () => {
      window.removeEventListener("keydown", handleModifierDown);
      window.removeEventListener("keyup", handleModifierUp);
    };
  }, [mode, setMode]);

  return (
    <>
      <div className="w-full">
        <div className="flex">
          <div className="grow">
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
              ) : (
                <div className="px-3 py-2">
                  {devices[0].label || `Camera ${devices[0].deviceId}`}
                </div>
              )
            ) : null}
          </div>
          <div className="flex">
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
          </div>
        </div>
      </div>
    </>
  );
}

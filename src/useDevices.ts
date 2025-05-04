import { useState, useRef, useEffect } from "react";
import { idealResolution } from "./consts";
import { activeStreamsAtom, devicesAtom } from "./atoms";
import { useAtom } from "jotai";

// const preferredDeviceStorageName = "preferredDeviceLabel";

export function useDevices() {
  const [devices, setDevices] = useAtom(devicesAtom);
  const [activeStreams, setActiveStreams] = useAtom(activeStreamsAtom);
  // const [stream, setStream] = useAtom(mediaStreamAtom);

  async function startStream(deviceId: string) {
    if (!deviceId) return;
    if (activeStreams[deviceId]) return;
    try {
      setActiveStreams((prev) => ({
        ...prev,
        [deviceId]: {
          stream: null,
          videoSize: null,
          refs: {
            video: null,
            canvas: null,
            drawRequest: null,
          },
        },
      }));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: idealResolution.width },
        },
      });
      setActiveStreams((prev) => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          stream: stream,
        },
      }));
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  }

  // on load
  useEffect(() => {
    const getCameras = async () => {
      try {
        // Trigger the browser to ask for permission to use the camera
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: idealResolution.width },
          },
        });
        const devices = await navigator.mediaDevices.enumerateDevices();
        let videoDevices = devices.filter(
          (device) => device.kind === "videoinput",
        );

        // // use preferred device if it exists
        // // can't count on device id or order being consistent
        // const preferredDeviceLabel = localStorage.getItem(
        //   preferredDeviceStorageName,
        // );
        setDevices(videoDevices);
        // if (preferredDeviceLabel) {
        //   const preferredDeviceIndex = videoDevices.findIndex(
        //     (device) => device.label === preferredDeviceLabel,
        //   );
        //   if (preferredDeviceIndex !== -1) {
        //     // setSelectedDeviceIndex(preferredDeviceIndex);
        //   }
        // }
      } catch (e) {
        console.error(e);
      }
    };
    getCameras();
  }, []);

  return {
    devices,
    startStream,
  };
}

export const maxSize = 512;

export const defaultCameraSettings = {
  deviceId: '',
  flipHorizontal: false,
  flipVertical: false,
  videoSize: { width: 0, height: 0 },
  cropBox: null,
  showCrop: false
};

export const idealResolution = {
  width: 3840,
  height: 2160
}

export const blendOptions = [
  "darken",
  "lighten",
  "multiply",
  "screen",
  "normal",
  "difference",
];

export const offsetLookup = {
  "1/4": 0.25,
  "1/2": 0.5,
  "3/4": 0.75,
  "1": 1,
}

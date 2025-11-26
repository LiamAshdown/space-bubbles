import { pixiPipes } from "@assetpack/core/pixi";
import { ffmpeg } from "@assetpack/core/ffmpeg";

export default {
  entry: "./raw-assets",
  output: "./public/assets/",
  cache: true,
  pipes: [
    ffmpeg({
      inputs: [".mp3", ".ogg", ".wav"],
      outputs: [
        {
          formats: [".mp3"],
          recompress: false,
          options: {
            audioBitrate: 96,
            audioChannels: 1,
            audioFrequency: 48000,
          },
        },
        {
          formats: [".ogg"],
          recompress: false,
          options: {
            audioBitrate: 32,
            audioChannels: 1,
            audioFrequency: 22050,
          },
        },
      ],
    }),
    ...pixiPipes({
      cacheBust: false,
      texturePacker: {
        texturePacker: {
          removeFileExtension: true,
          autodetectAnimations: true,
        },
      },
      manifest: {
        output: "./src/manifest.json",
      },
    }),
  ],
};

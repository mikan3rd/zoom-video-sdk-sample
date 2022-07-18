import ZoomVideo from "@zoom/videosdk";
import type { AppProps } from "next/app";

import { devConfig } from "../config/dev";
import ZoomContext from "../context/zoom-context";
import { generateVideoToken } from "../utils/util";

import "antd/dist/antd.css";

import "../styles/globals.css";
import "../styles/App.css";

import "../styles/loading-layer.scss";
import "../styles/chat.scss";
import "../styles/chat-message-item.scss";
import "../styles/chat-receiver.scss";
import "../styles/command.scss";
import "../styles/cmd-message-item.scss";
import "../styles/cmd-receiver.scss";
import "../styles/home.scss";
import "../styles/preview.scss";
import "../styles/video.scss";
import "../styles/avatar.scss";
import "../styles/call-out-model.scss";
import "../styles/camera.scss";
import "../styles/microphone.scss";
import "../styles/pagination.scss";
import "../styles/recording.scss";
import "../styles/screen-share.scss";
import "../styles/video-footer.scss";

type MeegingArgsType = {
  topic: string;
  signature: string;
  name: string;
  password?: string;
  enforceGalleryView?: string;
};

function MyApp({ Component, pageProps }: AppProps) {
  const params: Partial<MeegingArgsType> = Object.fromEntries(new URLSearchParams(location.search));

  const config = {
    ...devConfig,
    ...params,
  };

  if (typeof config.enforceGalleryView === "string") {
    config.enforceGalleryView = config.enforceGalleryView === "true";
  }

  if (config.signature === undefined && config.sdkKey !== undefined && config.sdkSecret !== undefined) {
    config.signature = generateVideoToken(config.sdkKey, config.sdkSecret, config.topic, config.password, "", "");
  }

  console.info(config);

  if (config.signature === undefined) {
    throw new Error("signature is required");
  }

  if (typeof config.enforceGalleryView === "string") {
    throw new Error("enforceGalleryView must be boolean");
  }

  const zmClient = ZoomVideo.createClient();

  return (
    <ZoomContext.Provider value={zmClient}>
      <Component
        {...pageProps}
        topic={config.topic}
        signature={config.signature}
        name={config.name}
        password={config.password}
        enforceGalleryView={config.enforceGalleryView}
      />
    </ZoomContext.Provider>
  );
}

export default MyApp;

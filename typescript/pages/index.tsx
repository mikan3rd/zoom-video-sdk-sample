import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import React, {
  useEffect,
  useContext,
  useState,
  useCallback,
  useReducer,
} from "react";
import ZoomVideo, { ConnectionState, event_connection_change, event_media_sdk_change } from "@zoom/videosdk";
import { message, Modal } from "antd";
import ZoomContext from "../context/zoom-context";
import { ChatClient, MediaStream } from "../types/index-types";
import produce from "immer";

interface AppProps {
  meetingArgs: {
    sdkKey: string;
    topic: string;
    signature: string;
    name: string;
    password?: string;
  };
}
const mediaShape = {
  audio: {
    encode: false,
    decode: false,
  },
  video: {
    encode: false,
    decode: false,
  },
  share: {
    encode: false,
    decode: false,
  },
};
const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case "audio-encode": {
      draft.audio.encode = action.payload;
      break;
    }
    case "audio-decode": {
      draft.audio.decode = action.payload;
      break;
    }
    case "video-encode": {
      draft.video.encode = action.payload;
      break;
    }
    case "video-decode": {
      draft.video.decode = action.payload;
      break;
    }
    case "share-encode": {
      draft.share.encode = action.payload;
      break;
    }
    case "share-decode": {
      draft.share.decode = action.payload;
      break;
    }
    default:
      break;
  }
}, mediaShape);

const Home: NextPage<AppProps> = (props) => {

  const {
    meetingArgs: { sdkKey, topic, signature, name, password },
  } = props;
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("");
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("closed");
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [chatClient, setChatClient] = useState<ChatClient | null>(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState<boolean>(true);
  const zmClient = useContext(ZoomContext);

  useEffect(() => {
    const init = async () => {
      await zmClient.init("en-US", `${window.location.origin}/lib`, 'zoom.us');
      try {
        setLoadingText("Joining the session...");
        await zmClient.join(topic, signature, name, password);
        const stream = zmClient.getMediaStream();
        setMediaStream(stream);
	      setIsSupportGalleryView(stream.isSupportMultipleVideos());
        const chatClient = zmClient.getChatClient();
        setChatClient(chatClient);
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        message.error(e.reason);
      }
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [sdkKey, signature, zmClient, topic, name, password]);
  const onConnectionChange = useCallback(
    (payload: Parameters<typeof event_connection_change>[0]) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus("connecting");
        const { reason } = payload;
        if (reason === "failover") {
          setLoadingText("Session Disconnected,Try to reconnect");
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus("connected");
        if (isFailover) {
          setIsLoading(false);
        }
      } else if (payload.state === ConnectionState.Closed) {
        setStatus("closed");
        if (payload.reason === "ended by host") {
          Modal.warning({
            title: "Meeting ended",
            content: "This meeting has been ended by host",
          });
        }
      }
    },
    [isFailover]
  );
  const onMediaSDKChange = useCallback((payload: Parameters<typeof event_media_sdk_change>[0]) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === "success" });
  }, []);
  const onLeaveOrJoinSession = useCallback(async () => {
    if (status === "closed") {
      setIsLoading(true);
      await zmClient.join(topic, signature, name, password);
      setIsLoading(false);
    } else if (status === "connected") {
      await zmClient.leave();
      message.warn("You have left the session.");
    }
  }, [zmClient, status, topic, signature, name, password]);
  useEffect(() => {
    zmClient.on("connection-change", onConnectionChange);
    zmClient.on("media-sdk-change", onMediaSDKChange);
    return () => {
      zmClient.off("connection-change", onConnectionChange);
      zmClient.off("media-sdk-change", onMediaSDKChange);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange]);

  return (
    <div>TEST</div>
  )
}

export default Home

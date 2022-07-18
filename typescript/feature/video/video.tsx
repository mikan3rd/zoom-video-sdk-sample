import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

import classnames from "classnames";
import _ from "lodash";

import ZoomMediaContext from "../../context/media-context";
import ZoomContext from "../../context/zoom-context";
import { useSizeCallback } from "../../hooks/useSizeCallback";
import { isSupportWebCodecs } from "../../utils/platform";
import { isShallowEqual } from "../../utils/util";

import Avatar from "./components/avatar";
import Pagination from "./components/pagination";
import VideoFooter from "./components/video-footer";
import { useActiveVideo } from "./hooks/useAvtiveVideo";
import { useCanvasDimension } from "./hooks/useCanvasDimension";
import { useGalleryLayout } from "./hooks/useGalleryLayout";
import { usePagination } from "./hooks/usePagination";
import { useShare } from "./hooks/useShare";

const VideoContainer: React.FunctionComponent = (props) => {
  const zmClient = useContext(ZoomContext);
  const {
    mediaStream,
    video: { decode: isVideoDecodeReady },
  } = useContext(ZoomMediaContext);
  const videoRef = useRef<HTMLCanvasElement | null>(null);
  const shareRef = useRef<HTMLCanvasElement | null>(null);
  const selfShareRef = useRef<(HTMLCanvasElement & HTMLVideoElement) | null>(null);
  const shareContainerRef = useRef<HTMLDivElement | null>(null);
  const [containerDimension, setContainerDimension] = useState({
    width: 0,
    height: 0,
  });
  const [shareViewDimension, setShareViewDimension] = useState({
    width: 0,
    height: 0,
  });
  const canvasDimension = useCanvasDimension(mediaStream, videoRef);
  const activeVideo = useActiveVideo(zmClient);
  const { page, pageSize, totalPage, totalSize, setPage } = usePagination(zmClient, canvasDimension);
  const { visibleParticipants, layout: videoLayout } = useGalleryLayout(
    zmClient,
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    canvasDimension,
    {
      page,
      pageSize,
      totalPage,
      totalSize,
    },
  );
  const { isRecieveSharing, isStartedShare, sharedContentDimension } = useShare(zmClient, mediaStream, shareRef);
  const isSharing = isRecieveSharing || isStartedShare;
  useEffect(() => {
    if (isSharing && shareContainerRef.current !== null) {
      const { width, height } = sharedContentDimension;
      const { width: containerWidth, height: containerHeight } = containerDimension;
      const ratio = Math.min(containerWidth / width, containerHeight / height, 1);
      setShareViewDimension({
        width: Math.floor(width * ratio),
        height: Math.floor(height * ratio),
      });
    }
  }, [isSharing, sharedContentDimension, containerDimension]);

  const onShareContainerResize = useCallback(({ width, height }: { width: number; height: number }) => {
    _.throttle(() => {
      setContainerDimension({ width, height });
    }, 50).call(this);
  }, []);
  useSizeCallback(shareContainerRef.current, onShareContainerResize);
  useEffect(() => {
    if (!isShallowEqual(shareViewDimension, sharedContentDimension)) {
      mediaStream?.updateSharingCanvasDimension(shareViewDimension.width, shareViewDimension.height);
    }
  }, [mediaStream, sharedContentDimension, shareViewDimension]);

  return (
    <div className="viewport">
      <div
        className={classnames("share-container", {
          "in-sharing": isSharing,
        })}
        ref={shareContainerRef}
      >
        <div
          className="share-container-viewport"
          style={{
            width: `${shareViewDimension.width}px`,
            height: `${shareViewDimension.height}px`,
          }}
        >
          <canvas className={classnames("share-canvas", { hidden: isStartedShare })} ref={shareRef} />
          {isSupportWebCodecs() ? (
            <video
              className={classnames("share-canvas", {
                hidden: isRecieveSharing,
              })}
              ref={selfShareRef}
            />
          ) : (
            <canvas
              className={classnames("share-canvas", {
                hidden: isRecieveSharing,
              })}
              ref={selfShareRef}
            />
          )}
        </div>
      </div>
      <div
        className={classnames("video-container", {
          "in-sharing": isSharing,
        })}
      >
        <canvas className="video-canvas" id="video-canvas" width="800" height="600" ref={videoRef} />
        <ul className="avatar-list">
          {visibleParticipants.map((user, index) => {
            if (index > videoLayout.length - 1) {
              return null;
            }
            const dimension = videoLayout[index];
            if (dimension === undefined) {
              return null;
            }
            const { width, height, x, y } = dimension;
            const { height: canvasHeight } = canvasDimension;
            return (
              <Avatar
                participant={user}
                key={user.userId}
                isActive={activeVideo === user.userId}
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  top: `${canvasHeight - y - height}px`,
                  left: `${x}px`,
                }}
              />
            );
          })}
        </ul>
      </div>
      <VideoFooter className="video-operations" sharing shareRef={selfShareRef} />
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} setPage={setPage} inSharing={isSharing} />}
    </div>
  );
};

export default VideoContainer;

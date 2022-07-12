import React from 'react';
import Icon from '@ant-design/icons';
import IconAdvanced from './svgs/icon-advanced.svg';
import IconChat from './svgs/icon-chat.svg';
import IconGroup from './svgs/icon-group.svg';
import IconHeadset from './svgs/icon-headset.svg';
import IconMeeting from './svgs/icon-meeting.svg';
import IconPause from './svgs/icon-pause.svg';
import IconRemoteControl from './svgs/icon-remote-control.svg';
import IconResume from './svgs/icon-resume.svg';
import IconShare from './svgs/icon-share.svg';
import IconSpotlight from './svgs/icon-spotlight.svg';
import IconStart from './svgs/icon-start.svg';
import IconStop from './svgs/icon-stop.svg';
const iconComponentMap: { [key: string]: any } = {
  'icon-advanced': IconAdvanced,
  'icon-chat': IconChat,
  'icon-group': IconGroup,
  'icon-headset': IconHeadset,
  'icon-meeting': IconMeeting,
  'icon-pause': IconPause,
  'icon-remote-control': IconRemoteControl,
  'icon-resume': IconResume,
  'icon-share': IconShare,
  'icon-spotlight': IconSpotlight,
  'icon-start': IconStart,
  'icon-stop': IconStop
};
interface IconFontProps {
  type: string;
  style?: any;
}
export const IconFont = (props: IconFontProps) => {
  const { type, style } = props;
  const component = iconComponentMap[type];
  return component ? (
    <Icon component={component} style={{ ...(style || {}) }} />
  ) : null;
};

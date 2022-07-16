import '../styles/globals.css'
import type { AppProps } from 'next/app'
import "antd/dist/antd.css";

import { devConfig } from '../config/dev';
import { generateVideoToken } from '../utils/util';
import ZoomVideo from '@zoom/videosdk';
import ZoomContext from '../context/zoom-context';

function MyApp({ Component, pageProps }: AppProps) {

let meetingArgs: any = Object.fromEntries(new URLSearchParams(location.search));
if (
  !meetingArgs.sdkKey ||
  !meetingArgs.topic ||
  !meetingArgs.name ||
  !meetingArgs.signature
) {
  meetingArgs = devConfig;
}
if (!meetingArgs.signature && meetingArgs.sdkSecret && meetingArgs.topic) {
  meetingArgs.signature = generateVideoToken(
    meetingArgs.sdkKey,
    meetingArgs.sdkSecret,
    meetingArgs.topic,
    meetingArgs.password,
    'jack4',
    'jack'
  );
}
console.log('meetingArgs', meetingArgs);
const zmClient = ZoomVideo.createClient();

  return (
    <ZoomContext.Provider value={zmClient}>
  <Component {...pageProps} meetingArgs={meetingArgs as any} />
  </ZoomContext.Provider>)
}

export default MyApp

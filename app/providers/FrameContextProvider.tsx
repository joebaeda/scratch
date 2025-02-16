import sdk, { FrameContext, SafeAreaInsets } from '@farcaster/frame-sdk';
import React from 'react';

import { useFrameSplash } from './FrameSplashProvider';
import Loading from '../components/Loading';

const FAKE_FRAME_CONTEXT: FrameContext | undefined =
  process.env.NODE_ENV === 'development'
    ? {
        user: {
          fid: 1287,
          username: "Joe bae",
          pfpUrl:
            'https://i.seadn.io/gcs/files/ed56e6b9a1b22720ce7490524db333e0.jpg?w=500&auto=format',
        },
        client: {
          clientFid: 9152,
          added: false,
        },
        // @ts-expect-error-next-line
        fakePayload: true,
      }
    : undefined;

type FrameContextProviderContextValue = {
  fid: number;
  username: string | undefined;
  pfpUrl: string | undefined;
  url: string | undefined;
  token: string | undefined;
  added: boolean;
  safeAreaInsets?: SafeAreaInsets; 
};

const FrameContextProviderContext =
  React.createContext<FrameContextProviderContextValue>([] as never);

function FrameContextProvider({ children }: React.PropsWithChildren) {
  const [noFrameContextFound, setNoFrameContextFound] =
    React.useState<boolean>(false);

  const { dismiss } = useFrameSplash();

  const [frameContext, setFrameContext] = React.useState<
    FrameContext | undefined
  >(FAKE_FRAME_CONTEXT);

  const checkFrameContext = React.useCallback(async () => {
    const ctx: FrameContext = await sdk.context;

    if (
      typeof ctx !== 'undefined' &&
      ctx !== null &&
      typeof frameContext === 'undefined'
    ) {
      setFrameContext(ctx);
    } else {
      setNoFrameContextFound(true);
    }

    dismiss();
  }, [dismiss, frameContext]);

  React.useEffect(() => {
    if (typeof frameContext === 'undefined') {
      checkFrameContext();
    }
  }, [checkFrameContext, frameContext]);

  if (noFrameContextFound) {
    return <Loading />;
  }

  if (typeof frameContext === 'undefined') {
    return <Loading />;
  }

  return (
    <FrameContextProviderContext.Provider
      value={{ fid: frameContext.user.fid, username: frameContext.user.username, pfpUrl: frameContext.user.pfpUrl, url: frameContext.client.notificationDetails?.url, token: frameContext.client.notificationDetails?.token, added: frameContext.client.added, safeAreaInsets: frameContext.client.safeAreaInsets }}
    >
      {children}
    </FrameContextProviderContext.Provider>
  );
}

export const useViewer = () => {
  return React.useContext(FrameContextProviderContext);
};

export { FrameContextProvider };
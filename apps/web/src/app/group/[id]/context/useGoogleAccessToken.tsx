'use client';

import { createContext, useContext, ReactNode } from 'react';

type Props = { googleAccessToken : string };

const PropsContext = createContext<Props | null>(null);

export function useGoogleAccessToken() {
  return useContext(PropsContext);
}

export function GoogleAccessTokenProvider({ props, children }: { props : Props; children: ReactNode }) {
  return <PropsContext.Provider value={props}>{children}</PropsContext.Provider>;
}
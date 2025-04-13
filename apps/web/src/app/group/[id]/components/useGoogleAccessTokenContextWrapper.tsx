// app/components/UserProviderWrapper.tsx
import { GoogleAccessTokenProvider } from '../context/useGoogleAccessToken';

export default function GoogleAccessTokenProviderWrapper({
  children,
  props,
}: {
  children: React.ReactNode;
  props: { googleAccessToken : string };
}) {
  return <GoogleAccessTokenProvider props={props}>{children}</GoogleAccessTokenProvider>;
}

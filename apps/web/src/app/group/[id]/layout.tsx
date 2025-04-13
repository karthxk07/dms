
import { cookies } from "next/headers";
import GoogleAccessTokenProviderWrapper from "./components/useGoogleAccessTokenContextWrapper";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Simulate server-side data fetching

  const cookiesStore = await cookies();
  let googleAccessToken = cookiesStore.get("google_accessToken")?.value ;

  console.log("server:",googleAccessToken);
  googleAccessToken  = googleAccessToken!=undefined ? googleAccessToken : "";
  

  return (
    <html>
      <body>
        <GoogleAccessTokenProviderWrapper props={{googleAccessToken}}>{children}</GoogleAccessTokenProviderWrapper>
      </body>
    </html>
  );
}


export const runtime = 'nodejs'; // ensure it's not edge



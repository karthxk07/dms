
import { cookies } from "next/headers";
import GoogleAccessTokenProviderWrapper from "./components/useGoogleAccessTokenContextWrapper";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Simulate server-side data fetching

  const cookiesStore = await cookies();
  let googleAccessToken = cookiesStore.get("google_accessToken")?.value ;

  googleAccessToken  = googleAccessToken!=undefined ? googleAccessToken : "";
  console.log("server:",googleAccessToken);
  

  return (
    <html>
      <body>
        <GoogleAccessTokenProviderWrapper props={{googleAccessToken}}>{children}</GoogleAccessTokenProviderWrapper>
      </body>
    </html>
  );
}




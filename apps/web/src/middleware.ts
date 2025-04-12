import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import axios from "axios";

export async function middleware(request: NextRequest) {

  console.log(request.headers.get("cookie"));

  try {
    // Fetch user authentication status
    if(request.headers.get("cookie")){
      const response = await axios.get(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/user/getUser`,
      {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      withCredentials: true,

      }
     
           );
    console.log("Response:",response);

      if (response.status === 200) {
        console.log("Good response");
        console.log("pathname :" , request.nextUrl.pathname);
        // User is authenticated, redirect away from auth page if necessary
      if (request.nextUrl.pathname === "/auth") {
          console.log("here");
          return NextResponse.redirect(new URL("/", request.url)); // Redirect to home/dashboard
      }
      return NextResponse.next();
    }
    }
  } catch (error) {
    console.error("Authentication middleware error:",error);
  }

  // If user is not authenticated, redirect to auth page
  if (request.nextUrl.pathname !== "/auth") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

// Configure which routes should be protected by this middleware
export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

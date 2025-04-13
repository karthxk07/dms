import GroupFilesDashboard from "./page";
import { cookies } from "next/headers";


export default async function GroupLayout(){

    const cookiesStore = await cookies();
    const googleAccessToken = cookiesStore.get("google_accessToken")?.value ;

    const params = googleAccessToken ? {googleAccessToken} : {googleAccessToken : ""};

return <>
<GroupFilesDashboard params={params}/>
</>
}
import GroupFilesDashboard from "./page";
import { cookies } from "next/headers";


export default async function GroupLayout(){

    const cookiesStore = await cookies();
    const google_accessToken = cookiesStore.get("google_accessToken");
return <>
<GroupFilesDashboard googleAccessToken = {google_accessToken}/>
</>
}
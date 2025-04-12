'use server'
 
import { cookies } from 'next/headers'
 
export async function get_googleToken() {
  const cookieStore = await cookies()
 
  // Get cookie
  return cookieStore.get('google_accessToken')?.value;

}

import {createBrowserClient} from "@supabase/ssr";
import { useSession } from "@clerk/nextjs";

export function createClient() {
    const { session }= useSession();
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            accessToken: async () => session?.getToken() ?? null,
        }
    );
}
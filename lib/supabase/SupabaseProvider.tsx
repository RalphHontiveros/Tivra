import { useSession } from "@clerk/nextjs"
import { SupabaseClient, createClient } from "@supabase/supabase-js" 
import { useEffect, useState, createContext, useContext } from "react"


type SupabaseContextType = {
    supabase: SupabaseClient | null;
    isLoaded: boolean;
};
const Context = createContext<SupabaseContext>({
    supabese: null,
    isLoaded: false,
});

export default function SupabaseProvider({
    children,
}: { 
    children: React.ReactNode;
}) {
    const {session} = useSession()
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
    const [isLoaded, setIsLoaded] = useState<boolean>(false)

    useEffect(() => {
        if (!session) return
        const client = createClient(
             process.env.NEXT_PUBLIC_SUPABASE_URL!,
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
             {
                accessToken: async () => session?.getToken() ?? null,
             }
        );

        setSupabase(client);
        setIsLoaded(true);
    }, [session]);

    return (
    <Context.Provider value={{supabase, isLoaded}}>
        {isLoaded ? <div> Loading...</div> :children}
        </Context.Provider>
    );
}


export const useSupabase = () => {
    const context = useContext(Context)
    if (context === undefined) {
        throw new Error("useSupabase must be used within a SupabaseProvider");
    }

    return
}
    
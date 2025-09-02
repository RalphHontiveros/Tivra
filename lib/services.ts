import {createClient} from "@/lib/supabase/client";

const supabase = createClient();

export const boardService = {
    async getBoards(userId: string) {
        const {data, error} = await supabase
        .from("boards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", {ascending: false});

        if (error) throw error

        return data || [];
    },

    async createBoard(
        board: Omit<Board, "id" | "created_at" | "updated_at">
        
    ): Promise<Board> {
           const {data, error} = await supabase
           .from("boards")
           .insert(board)
           .select()
           .single();

           if (error) throw error;

        return data;
    },
};
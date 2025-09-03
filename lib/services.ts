import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

// ---------------- Types ----------------
export interface Board {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  created_at: string;
}

// ---------------- Board Service ----------------
export const boardService = {
  async getBoards(userId: string): Promise<Board[]> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching boards:", error.message);
      throw error;
    }

    return data ?? [];
  },

  async createBoard(
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) {
      console.error("Error creating board:", error.message);
      throw error;
    }

    return data;
  },
};

// ---------------- Column Service ----------------
export const columnService = {
  async createColumn(
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) {
      console.error("Error creating column:", error.message);
      throw error;
    }

    return data;
  },
};

// ---------------- Combined Service ----------------
export const boardDataService = {
  async createBoardWithDefault(boardData: {
    title: string;
    description?: string;
    color?: string;
    userId: string;
  }) {
    // Create the board first
    const board = await boardService.createBoard({
      title: boardData.title,
      description: boardData.description ?? null,
      color: boardData.color ?? "bg-blue-500",
      user_id: boardData.userId,
    });

    // Create default columns
    const defaultColumns = [
      { title: "To Do", board_id: board.id },
      { title: "In Progress", board_id: board.id },
      { title: "Review", board_id: board.id }, // fixed typo
      { title: "Done", board_id: board.id },
    ];

    await Promise.all(
      defaultColumns.map((col) => columnService.createColumn(col))
    );

    return board;
  },
};

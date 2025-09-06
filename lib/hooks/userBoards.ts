"use client";

import { useUser } from "@clerk/nextjs";
import { boardDataService } from "../services";
import { useState } from "react";
import { Board } from "../supabase/models";


export function useBoards() {
    const {user} = useUser()
    const {boards, setBoards} = useState<Board[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function createBoard(boardData: {
        title: string;
        description?: string;
        color?: string;
    }) {
        
        if (!user) throw new Error("User not authenticated");

        try{
            const newBoard = await boardDataService.createBoardWithDefault({
                ...boardData,
                userId: user?.id
            });
            setBoards((prev) => [...prev, newBoard]);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create baord.");
        }
    }

    return { boards, loading, error, createBoard};
}
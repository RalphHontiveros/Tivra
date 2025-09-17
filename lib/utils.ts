// Move a column to a target index in the columns array
import { ColumnWithTasks } from "@/lib/supabase/models";

export function moveColumnToIndex(columns: ColumnWithTasks[], columnId: string, targetIdx: number): ColumnWithTasks[] {
  const colIdx = columns.findIndex((c) => c.id === columnId);
  if (colIdx === -1 || targetIdx < 0 || targetIdx >= columns.length || colIdx === targetIdx) return columns;
  const newCols = [...columns];
  const [removed] = newCols.splice(colIdx, 1);
  newCols.splice(targetIdx, 0, removed);
  return newCols;
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

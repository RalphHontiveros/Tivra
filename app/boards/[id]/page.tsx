"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { Archive, Calendar, MoreHorizontal, Plus, Search, X } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ====================================================
// 🔹 Sortable Task Card
// ====================================================
function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : undefined,
  };

  const labels = task.labels || [];
  const checklist = task.checklist || [];
  const checklistDone = checklist.filter(c => c.done).length;
  const dueDateStatus = task.due_date ? (() => {
    const now = new Date();
    const due = new Date(task.due_date);
    if (due < now) return "text-red-500";
    if ((due.getTime() - now.getTime()) < 86400000) return "text-yellow-500";
    return "text-gray-500";
  })() : "";

  return (
    <motion.div
  ref={setNodeRef}
  layout
  style={styles}
  {...listeners}
  {...attributes}
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -6 }}
  transition={{ duration: 0.2, ease: "easeInOut" }}
>
  <Card className="cursor-grab hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full">
    <CardContent className="p-3 sm:p-4 lg:p-5">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {labels.map((label, i) => (
              <span
                key={i}
                className={`h-2 sm:h-2.5 w-8 sm:w-10 rounded-full ${label.color}`}
                title={label.name}
              ></span>
            ))}
          </div>
        )}

        {/* Title & Priority */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug break-words">
            {task.title}
          </h4>
          <PriorityPill p={task.priority} />
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {task.description || "No description provided."}
        </p>

        {/* Checklist */}
        {checklist.length > 0 && (
          <div className="flex flex-col gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Checklist</span>
                <span className="text-xs font-semibold">
                  {checklistDone}/{checklist.length}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {checklist.map((c, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full ${
                      c.done ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Assignee & Due Date */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm">
          {/* Assignee */}
          <div className="flex items-center gap-2 min-w-0">
            {task.assignee ? (
              <Avatar name={task.assignee} />
            ) : (
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200 dark:bg-gray-700" />
            )}
            <span className="truncate text-gray-700 dark:text-gray-300">
              {task.assignee ?? "Unassigned"}
            </span>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-md text-xs font-medium ${
                dueDateStatus === "text-red-500"
                  ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                  : dueDateStatus === "text-yellow-500"
                  ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              }`}
            >
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline">{new Date(task.due_date).toLocaleDateString()}</span>
              <span className="xs:hidden">{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
</motion.div>

  );
}

// ====================================================
// 🔹 Small Helper Components
// ====================================================

function PriorityPill({ p }: { p: "low" | "medium" | "high" }) {
  const map: Record<string, string> = {
    low: "bg-emerald-500/90 text-white",
    medium: "bg-yellow-400 text-black",
    high: "bg-red-500 text-white",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[p]}`}>
      {p[0].toUpperCase() + p.slice(1)}
    </span>
  );
}

function Avatar({ name }: { name?: string | null }) {
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0, 2).join("");
  return (
    <div className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-200 text-xs font-semibold text-slate-800 shadow-sm">
      {initials}
    </div>
  );
}

// -----------------------------
// Droppable Column wrapper
// -----------------------------

function DroppableColumn({
    column,
    index,
    columnsLength,
    children,
    onCreateTask,
    onEditColumn,
    onCopyColumn,
    onMoveColumn,
    onMoveAllCards,
    onArchiveColumn,
    onArchiveAllCards,
    onDeleteColumn,
  }: {
    column: ColumnWithTasks;
    index: number;
    columnsLength: number;
    children: React.ReactNode;
    onCreateTask: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onEditColumn: (c: ColumnWithTasks) => void;
    onCopyColumn: (c: ColumnWithTasks) => void;
    onMoveColumn: (column: ColumnWithTasks, targetIndex: number) => void;
    onMoveAllCards?: (fromColumnId: string, toColumnIdx: number) => void;
    onArchiveColumn: (columnId: string) => void;
    onArchiveAllCards: (columnId: string) => void;
    onDeleteColumn: (columnId: string) => void;
  }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [menuOpen, setMenuOpen] = useState(false);

  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<string>("");

  const [moveAllDialogOpen, setMoveAllDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>("");

  const availableRows = useMemo(() => {
    return Array.from({ length: columnsLength }, (_, i) => i).filter(i => i !== index);
  }, [columnsLength, index]);

  return (
    <motion.div
      ref={setNodeRef}
      layout
      initial={{ opacity: 0.9, scale: 0.995 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className={`w-full sm:w-72 lg:w-80 flex-shrink-0 ${isOver ? "bg-blue-50 rounded-xl" : ""}`}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${isOver ? "ring-2 ring-blue-300" : ""}`}>
        <div className="p-3 sm:p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
              {column.title}
            </h3>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {column.tasks.length}
            </Badge>
          </div>
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen((v) => !v)}>
              <MoreHorizontal />
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-52 bg-white dark:bg-gray-800 border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditColumn(column);
                  }}
                >
                  Edit list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    document.getElementById('add-list-btn')?.click();
                  }}
                >
                  Add another list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    onCopyColumn(column);
                  }}
                >
                  Copy list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    onArchiveColumn(column.id);
                  }}
                >
                  Archive list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    setMoveAllDialogOpen(true);
                  }}
                >
                  Move all cards in this list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    onArchiveAllCards(column.id);
                  }}
                >
                  Archive all cards in this list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    setMoveDialogOpen(true);
                  }}
                >
                  Move list
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    alert('Watch: Not implemented yet');
                  }}
                >
                  Watch
                </button>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    alert('Change list color: Not implemented yet');
                  }}
                >
                  Change list color
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  className="w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteColumn(column.id);
                  }}
                >
                  Delete list
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="p-3 space-y-3">
          {children}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full mt-1 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Plus className="mr-2" />
                Add task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[480px] mx-auto">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <p className="text-sm text-gray-600">Add a task to this board</p>
              </DialogHeader>
              <form className="space-y-4" onSubmit={onCreateTask}>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input id="title" name="title" placeholder="Enter task title" required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea id="description" name="description" rows={3} placeholder="Describe the task..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Label>Assignee</Label>
                    <Input id="assignee" name="assignee" placeholder="Name or email" />
                  </div>
                  <div>
                    <Label>Due date</Label>
                    <Input id="dueDate" name="dueDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Move List Dialog */}
          <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
              <DialogHeader>
                <DialogTitle>Move list</DialogTitle>
                <p className="text-sm text-gray-600">Select the target row to move this list</p>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  if (!targetRow || targetRow === "none") return;
                  onMoveColumn(column, Number(targetRow));
                  setMoveDialogOpen(false);
                  setTargetRow("");
                }}
              >
                <div className="space-y-2">
                  <Label>Target row</Label>
                  <Select value={targetRow} onValueChange={setTargetRow} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select row" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRows.length === 0 ? (
                        <SelectItem value="none" disabled>No other row available</SelectItem>
                      ) : (
                        availableRows.map(i => (
                          <SelectItem key={i} value={String(i)}>
                            Row {i + 1}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setMoveDialogOpen(false)} type="button">Cancel</Button>
                  <Button type="submit" disabled={!targetRow || targetRow === "none"}>Move</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Move All Cards Dialog */}
          <Dialog open={moveAllDialogOpen} onOpenChange={setMoveAllDialogOpen}>
            <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
              <DialogHeader>
                <DialogTitle>Move all cards in this list</DialogTitle>
                <p className="text-sm text-gray-600">Select the target list to move all cards</p>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={e => {
                  e.preventDefault();
                  if (!targetColumnId || targetColumnId === String(index)) return;
                  if (typeof onMoveAllCards === "function") {
                    onMoveAllCards(column.id, Number(targetColumnId));
                  }
                  setMoveAllDialogOpen(false);
                  setTargetColumnId("");
                }}
              >
                <div className="space-y-2">
                  <Label>Target list</Label>
                  <Select value={targetColumnId} onValueChange={setTargetColumnId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select list" />
                    </SelectTrigger>
                    <SelectContent>
                      {columnsLength <= 1 ? (
                        <SelectItem value="none" disabled>No other list available</SelectItem>
                      ) : (
                        Array.from({ length: columnsLength }, (_, i) => i)
                          .filter(i => i !== index)
                          .map(i => (
                            <SelectItem key={i} value={String(i)}>
                              List {i + 1}
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setMoveAllDialogOpen(false)} type="button">Cancel</Button>
                  <Button type="submit" disabled={!targetColumnId || targetColumnId === "none" || targetColumnId === String(index)}>Move All</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  );
  // ...existing code...
}

// -----------------------------
// Drag overlay card for visual feedback
// -----------------------------
function TaskOverlay({ task }: { task: Task }) {
  const labels = task.labels || [
    { color: "bg-green-500", name: "Feature" },
    { color: "bg-purple-500", name: "UI" },
  ];
  const checklist = task.checklist || [
    { text: "Design UI", done: true },
    { text: "Write logic", done: false },
  ];
  const checklistDone = checklist.filter(c => c.done).length;
  const dueDateStatus = task.due_date ? (() => {
    const now = new Date();
    const due = new Date(task.due_date);
    if (due < now) return "text-red-500";
    if ((due.getTime() - now.getTime()) < 86400000) return "text-yellow-500";
    return "text-gray-500";
  })() : "";

  return (
    <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="w-72 sm:w-80">
      <Card className="shadow-2xl">
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            {/* Labels */}
            <div className="flex gap-1 mb-1">
              {labels.map((label, i) => (
                <span key={i} className={`h-2 w-6 sm:w-8 rounded ${label.color} text-[0px]`} title={label.name}></span>
              ))}
            </div>
            {/* Title & Priority */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">{task.title}</h4>
              <PriorityPill p={task.priority} />
            </div>
            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 sm:line-clamp-3">{task.description || "No description"}</p>
            {/* Checklist */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Checklist:</span>
              <span className="text-xs font-semibold">{checklistDone}/{checklist.length}</span>
              <div className="flex gap-1">
                {checklist.map((c, i) => (
                  <span key={i} className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${c.done ? "bg-green-500" : "bg-gray-300"}`}></span>
                ))}
              </div>
            </div>
            {/* Assignee & Due Date */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 min-w-0">
                {task.assignee ? <Avatar name={task.assignee} /> : null}
                <span className="truncate">{task.assignee ?? "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className={`h-3 w-3 ${dueDateStatus}`} />
                    <span className={`${dueDateStatus} hidden sm:inline`}>{new Date(task.due_date).toLocaleDateString()}</span>
                    <span className={`${dueDateStatus} sm:hidden`}>{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// -----------------------------
// Main board page
// -----------------------------
export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const {
    board,
    columns,
    createColumn,
    updateBoard,
    createRealTask,
    setColumns,
    moveTask,
    updateColumn,
    copyColumn,
    archiveColumn,
    deleteColumn,
  } = useBoard(id);

  // Handler for dropdown Copy list
  function handleCopyColumn(column: ColumnWithTasks) {
    copyColumn(column);
  }

 /* -------------------- UI State -------------------- */
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardColor, setNewBoardColor] = useState<string | undefined>(undefined);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  const [archiveColumnId, setArchiveColumnId] = useState<string | null>(null);
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);
  const [archiveAllCardsId, setArchiveAllCardsId] = useState<string | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [archiveAllCardsLoading, setArchiveAllCardsLoading] = useState(false);

  const [showArchived, setShowArchived] = useState(false);
  const [archivedColumns, setArchivedColumns] = useState<ColumnWithTasks[]>([]);
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);

  const [query, setQuery] = useState("");

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  /* -------------------- Derived State -------------------- */
  const totalTasks = useMemo(() => columns.reduce((s, c) => s + c.tasks.length, 0), [columns]);

  const filteredColumns = useMemo(() => {
    if (!query.trim()) return columns;
    const q = query.toLowerCase();
    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => (t.title + " " + (t.description || "")).toLowerCase().includes(q)),
    }));
  }, [columns, query]);

  /* -------------------- Handlers -------------------- */
  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsCreatingColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!editingColumn || !editingColumnTitle.trim()) return;
    await updateColumn(editingColumn.id, editingColumnTitle.trim());
    setIsEditingColumn(false);
    setEditingColumn(null);
    setEditingColumnTitle("");
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const taskData = {
      title: String(form.get("title") || "").trim(),
      description: String(form.get("description") || "").trim() || undefined,
      assignee: String(form.get("assignee") || "").trim() || undefined,
      dueDate: String(form.get("dueDate") || "") || undefined,
      priority: (String(form.get("priority") || "medium") as "low" | "medium" | "high"),
    };
    if (!taskData.title) return;
    const target = columns[0];
    if (!target) {
      return;
    }
    await createRealTask(target.id, taskData);
  }

  function handleEditColumnOpen(column: ColumnWithTasks) {
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
    setIsEditingColumn(true);
  }

  async function handleArchiveColumn() {
    if (!archiveColumnId) return;
    setArchiveLoading(true);
    try {
      // Find the column to archive
      const columnToArchive = columns.find(col => col.id === archiveColumnId);
      if (!columnToArchive) return;

      // Add to archived columns
      setArchivedColumns(prev => [...prev, columnToArchive]);
      
      // Remove from active columns
      setColumns(prev => prev.filter(col => col.id !== archiveColumnId));
      
      setArchiveColumnId(null);
    } catch (err) {
      console.error('Failed to archive column:', err);
    } finally {
      setArchiveLoading(false);
    }
  }

  async function handleDeleteColumn() {
    if (!deleteColumnId) return;
    setDeleteLoading(true);
    try {
      await deleteColumn(deleteColumnId);
      setDeleteColumnId(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleArchiveAllCards() {
    if (!archiveAllCardsId) return;
    setArchiveAllCardsLoading(true);
    try {
      // Find the column and get all its tasks
      const column = columns.find(col => col.id === archiveAllCardsId);
      if (column && column.tasks.length > 0) {
        // Add tasks to archived tasks
        setArchivedTasks(prev => [...prev, ...column.tasks]);
        
        // Remove tasks from the column
        setColumns(prev => prev.map(col => 
          col.id === archiveAllCardsId 
            ? { ...col, tasks: [] }
            : col
        ));
      }
      
      setArchiveAllCardsId(null);
    } catch (err) {
      console.error('Failed to archive all cards:', err);
    } finally {
      setArchiveAllCardsLoading(false);
    }
  }

  async function loadArchivedItems() {
    // No need to load from database since we're using local state
    // The archived items are already in state
    console.log("Loading archived items from local state");
  }

  async function restoreColumn(columnId: string) {
    try {
      // Find the archived column
      const archivedColumn = archivedColumns.find(col => col.id === columnId);
      if (!archivedColumn) return;

      // Add back to active columns
      setColumns(prev => [...prev, archivedColumn]);
      
      // Remove from archived columns
      setArchivedColumns(prev => prev.filter(col => col.id !== columnId));
    } catch (err) {
      console.error("Failed to restore column:", err);
    }
  }

  async function restoreTask(taskId: string) {
    try {
      // Find the archived task
      const archivedTask = archivedTasks.find(task => task.id === taskId);
      if (!archivedTask) return;

      // Find the first column to add the task back to
      if (columns.length > 0) {
        const firstColumn = columns[0];
        setColumns(prev => prev.map(col => 
          col.id === firstColumn.id 
            ? { ...col, tasks: [...col.tasks, archivedTask] }
            : col
        ));
      }
      
      // Remove from archived tasks
      setArchivedTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error("Failed to restore task:", err);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = columns.flatMap(c => c.tasks).find(t => t.id === taskId);
    if (task) setActiveTask(task);
  }

  function handleMoveColumn(column: ColumnWithTasks, targetIndex: number) {
  setColumns(prev => {
    const next = [...prev];
    const currentIndex = next.findIndex(c => c.id === column.id);
    if (currentIndex === -1) return prev;

    const [removed] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, removed);
    return next;
  });
}

function handleMoveAllCards(fromColumnId: string, toColumnIdx: number) {
  setColumns(prev => {
    const next = [...prev];
    const fromCol = next.find(c => c.id === fromColumnId);
    const toCol = next[toColumnIdx];
    if (!fromCol || !toCol) return prev;
    toCol.tasks = [...toCol.tasks, ...fromCol.tasks];
    fromCol.tasks = [];
    return next;
  });
}

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    const sourceColumn = columns.find(c => c.tasks.some(t => t.id === activeId));
    const targetColumn = columns.find(c => c.tasks.some(t => t.id === overId));
    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex(t => t.id === activeId);
      const overIndex = targetColumn.tasks.findIndex(t => t.id === overId);
      if (activeIndex !== overIndex) {
        setColumns((prev) => {
          const next = prev.map(col => ({ ...col, tasks: [...col.tasks] }));
          const col = next.find(c => c.id === sourceColumn.id)!;
          const tasks = col.tasks;
          const [removed] = tasks.splice(activeIndex, 1);
          tasks.splice(overIndex, 0, removed);
          col.tasks = tasks;
          return next;
        });
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }
    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find(col => col.id === overId);
    if (targetColumn) {
      const sourceColumn = columns.find(col => col.tasks.some(t => t.id === taskId));
      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      const sourceColumn = columns.find(col => col.tasks.some(t => t.id === taskId));
      const targetColumn = columns.find(col => col.tasks.some(t => t.id === overId));
      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(t => t.id === taskId);
        const newIndex = targetColumn.tasks.findIndex(t => t.id === overId);
        if (oldIndex !== newIndex || sourceColumn.id !== targetColumn.id) {
          await moveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
    setActiveTask(null);
  }

  async function handleBoardUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!board || !newBoardTitle.trim()) return;
    await updateBoard(board.id, { title: newBoardTitle.trim(), color: newBoardColor || board.color });
    setIsEditingBoard(false);
  }

  /* -------------------- Render -------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors">
      <Navbar
        boardTitle={board?.title}
        onEditBoard={() => {
          setNewBoardTitle(board?.title ?? "");
          setNewBoardColor(board?.color ?? undefined);
          setIsEditingBoard(true);
        }}
  // onFilterClick={() => setFilterOpen(true)}
  filterCount={0}
      />

  <div className="container mx-auto px-2 sm:px-4">
        {/* Sticky toolbar */}
        <div className="sticky top-16 sm:top-20 z-30 bg-white/60 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-3 sm:p-4 border mb-4 sm:mb-6 flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${board?.color ?? "bg-indigo-500"}`} />
              <div className="min-w-0">
                <h2 className="font-bold text-base sm:text-lg truncate">{board?.title ?? "Board"}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{totalTasks} tasks • {columns.length} lists</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 pr-3 py-2 rounded-full"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Plus className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Task</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-[480px] mx-auto">
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleCreateTask}>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input id="title" name="title" placeholder="Task title" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea id="description" name="description" rows={3} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label>Assignee</Label>
                      <Input id="assignee" name="assignee" />
                    </div>
                    <div>
                      <Label>Due</Label>
                      <Input id="dueDate" name="dueDate" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

              <Button variant="outline" onClick={() => setIsCreatingColumn(true)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New List</span>
                <span className="sm:hidden">List</span>
              </Button>

              <Button 
                variant={showArchived ? "default" : "outline"}
                onClick={() => {
                  setShowArchived(!showArchived);
                  if (!showArchived) {
                    loadArchivedItems();
                  }
                }}
                className="flex-1 sm:flex-none"
              >
                <Archive className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {showArchived ? "Hide Archived" : "Show Archived"}
                </span>
                <span className="sm:hidden">
                  {showArchived ? "Hide" : "Archive"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Board content */}
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
          className="flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto py-4 px-1 -mx-1 sm:px-2 sm:-mx-2 board-scroll"
          style={{ scrollSnapType: "x mandatory" }}
        >
            {filteredColumns.length === 0 && (
              <div className="flex items-center justify-center w-full py-12 sm:py-20">
                <Card className="w-full max-w-2xl text-center p-6 sm:p-8">
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">No lists yet</CardTitle>
                    <CardDescription className="text-sm sm:text-base">Add a list to get started.</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-4">
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => setIsCreatingColumn(true)} className="text-sm sm:text-base">
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Add first list</span>
                        <span className="sm:hidden">Add list</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {filteredColumns.map((col, idx) => (
              <DroppableColumn
                key={col.id}
                column={col}
                index={idx}
                columnsLength={filteredColumns.length}
                onCreateTask={handleCreateTask}
                onEditColumn={handleEditColumnOpen}
                onCopyColumn={handleCopyColumn}
                onMoveAllCards={handleMoveAllCards}
                onMoveColumn={handleMoveColumn}
                onArchiveColumn={setArchiveColumnId}
                onArchiveAllCards={setArchiveAllCardsId}
                onDeleteColumn={setDeleteColumnId}
              >
                <SortableContext
                  items={col.tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {col.tasks.map((task) => (
                      <SortableTask key={task.id} task={task} />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            ))}


            {/* add column CTA removed, now in dropdown */}
            <button id="add-list-btn" style={{ display: 'none' }} onClick={() => setIsCreatingColumn(true)} />

            <DragOverlay>
              {activeTask ? <TaskOverlay task={activeTask} /> : null}
            </DragOverlay>
          </div>
        </DndContext>

      </div>

      {/* Dialogs - Create Column */}
      <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
        <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
          <DialogHeader>
            <DialogTitle>Create new list</DialogTitle>
            <p className="text-sm text-gray-600">Add a column (list) to organize tasks</p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateColumn}>
            <div className="space-y-2">
              <Label>List title</Label>
              <Input value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreatingColumn(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog - Edit Column */}
      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit list</DialogTitle>
            <p className="text-sm text-gray-600">Rename your list</p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label>List title</Label>
              <Input value={editingColumnTitle} onChange={(e) => setEditingColumnTitle(e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsEditingColumn(false); setEditingColumn(null); }}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog - Edit Board */}
      <Dialog open={isEditingBoard} onOpenChange={setIsEditingBoard}>
        <DialogContent className="w-[95vw] max-w-[480px] mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Board</DialogTitle>
            <p className="text-sm text-gray-600">Update board title and color</p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleBoardUpdate}>
            <div className="space-y-2">
              <Label>Board title</Label>
              <Input value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Board color</Label>
              <div className="grid grid-cols-6 gap-2">
                {["bg-blue-500","bg-green-500","bg-yellow-400","bg-red-500","bg-purple-500","bg-indigo-500","bg-pink-500","bg-slate-500"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setNewBoardColor(c)}
                    className={`w-8 h-8 rounded-full ${c} ${newBoardColor === c ? "ring-2 ring-offset-2 ring-slate-900" : ""}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditingBoard(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog - Archive Column */}
      <Dialog open={!!archiveColumnId} onOpenChange={() => setArchiveColumnId(null)}>
        <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
          <DialogHeader>
            <DialogTitle>Archive List</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to archive this list? It will be hidden from the board but can be restored later.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setArchiveColumnId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleArchiveColumn}
              disabled={archiveLoading}
            >
              {archiveLoading ? "Archiving..." : "Archive"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!archiveAllCardsId} onOpenChange={() => setArchiveAllCardsId(null)}>
        <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
          <DialogHeader>
            <DialogTitle>Archive All Cards</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to archive all cards in this list? They will be hidden from the board but can be restored later.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setArchiveAllCardsId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleArchiveAllCards}
              disabled={archiveAllCardsLoading}
            >
              {archiveAllCardsLoading ? "Archiving..." : "Archive All Cards"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Delete Column */}
      <Dialog open={!!deleteColumnId} onOpenChange={() => setDeleteColumnId(null)}>
        <DialogContent className="w-[95vw] max-w-[420px] mx-auto">
          <DialogHeader>
            <DialogTitle>Delete List</DialogTitle>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this list? This action cannot be undone and will permanently remove the list and all its tasks.
            </p>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteColumnId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteColumn}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog - Archived Items */}
      <Dialog open={showArchived} onOpenChange={setShowArchived}>
        <DialogContent className="w-[98vw] sm:w-[95vw] max-w-7xl mx-auto h-[90vh] sm:h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Archive className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="truncate">Archived Items</span>
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              Manage your archived lists and tasks. Restore items to bring them back to your board.
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              {/* Archived Lists Section */}
              {archivedColumns.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Archived Lists</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{archivedColumns.length} list{archivedColumns.length !== 1 ? 's' : ''} archived</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      {archivedColumns.reduce((total, col) => total + col.tasks.length, 0)} total tasks
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {archivedColumns.map((column) => (
                      <Card key={column.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-white dark:bg-gray-800">
                        <CardContent className="p-3 sm:p-4 lg:p-5">
                          <div className="flex items-start justify-between mb-3 sm:mb-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base mb-1 truncate">
                                {column.title}
                              </h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                  {column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span>Archived</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex-shrink-0">
                              List
                            </Badge>
                          </div>
                          
                          {column.tasks.length > 0 && (
                            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Tasks in this list:</p>
                              <div className="space-y-1">
                                {column.tasks.slice(0, 3).map((task) => (
                                  <div key={task.id} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                                    <span className="truncate">{task.title}</span>
                                  </div>
                                ))}
                                {column.tasks.length > 3 && (
                                  <div className="text-xs text-gray-400">
                                    +{column.tasks.length - 3} more task{column.tasks.length - 3 !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => restoreColumn(column.id)}
                              className="flex-1 text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/20"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <span className="hidden sm:inline">Restore List</span>
                              <span className="sm:hidden">Restore</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteColumnId(column.id)}
                              className="flex-1 text-xs"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span className="hidden sm:inline">Delete</span>
                              <span className="sm:hidden">Delete</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Archived Tasks Section */}
              {archivedTasks.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Archived Tasks</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{archivedTasks.length} task{archivedTasks.length !== 1 ? 's' : ''} archived</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      Individual tasks
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {archivedTasks.map((task) => (
                      <Card key={task.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500 bg-white dark:bg-gray-800">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm mb-1 line-clamp-2">
                                {task.title}
                              </h5>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                                {task.description || "No description"}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-400">
                                {task.assignee && (
                                  <span className="flex items-center gap-1">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                      {task.assignee.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate">{task.assignee}</span>
                                  </span>
                                )}
                                {task.due_date && (
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span className="hidden sm:inline">{new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span className="sm:hidden">{new Date(task.due_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex-shrink-0">
                              Task
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => restoreTask(task.id)}
                            className="w-full text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 dark:hover:bg-green-900/20"
                          >
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="hidden sm:inline">Restore Task</span>
                            <span className="sm:hidden">Restore</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {archivedColumns.length === 0 && archivedTasks.length === 0 && (
                <div className="text-center py-8 sm:py-16">
                  <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <Archive className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">No Archived Items</h4>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed px-4">
                    When you archive lists or tasks, they'll appear here for easy restoration. 
                    Your archived items are safely stored and can be restored anytime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
import { Calendar, MoreHorizontal, Plus, Search } from "lucide-react";
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

// -----------------------------
// Small helper components

// -----------------------------
// SortableTask component
// -----------------------------
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

  // Labels and checklist fallback
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
      transition={{ duration: 0.15 }}
    >
      <Card className="cursor-grab hover:shadow-lg transition-shadow">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-2">
            {/* Labels */}
            <div className="flex gap-1 mb-1">
              {labels.map((label, i) => (
                <span key={i} className={`h-2 w-8 rounded ${label.color} text-[0px]`} title={label.name}></span>
              ))}
            </div>
            {/* Title & Priority */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {task.title}
              </h4>
              <div className="flex items-center gap-2">
                <PriorityPill p={task.priority} />
              </div>
            </div>
            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
              {task.description || "No description"}
            </p>
            {/* Checklist */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Checklist:</span>
              <span className="text-xs font-semibold">{checklistDone}/{checklist.length}</span>
              <div className="flex gap-1">
                {checklist.map((c, i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${c.done ? "bg-green-500" : "bg-gray-300"}`}></span>
                ))}
              </div>
            </div>
            {/* Assignee & Due Date */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2 min-w-0">
                {task.assignee ? <Avatar name={task.assignee} /> : <div className="w-7" />}
                <div className="truncate">{task.assignee ?? "Unassigned"}</div>
              </div>
              <div className="flex items-center gap-2">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className={`h-3 w-3 ${dueDateStatus}`} />
                    <span className={dueDateStatus}>{new Date(task.due_date).toLocaleDateString()}</span>
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
    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-xs font-semibold text-slate-800 shadow-sm">
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
  }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [menuOpen, setMenuOpen] = useState(false);
  // Move List dialog state
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [targetRow, setTargetRow] = useState<string>("");
  // Move all cards dialog state
  const [moveAllDialogOpen, setMoveAllDialogOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>("");

  // Helper: get available row positions except current
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
      className={`w-full lg:flex-shrink-0 lg:w-80 ${isOver ? "bg-blue-50 rounded-xl" : ""}`}
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
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border rounded shadow-lg z-50">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditColumn(column);
                  }}
                >
                  Edit list
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    document.getElementById('add-list-btn')?.click();
                  }}
                >
                  Add another list
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    onCopyColumn(column);
                  }}
                >
                  Copy list
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    alert('Archive list: Not implemented yet');
                  }}
                >
                  Archive list
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    setMoveAllDialogOpen(true);
                  }}
                >
                  Move all cards in this list
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    setMoveDialogOpen(true);
                  }}
                >
                  Move list
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    alert('Watch: Not implemented yet');
                  }}
                >
                  Watch
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    setMenuOpen(false);
                    alert('Change list color: Not implemented yet');
                  }}
                >
                  Change list color
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
  // Trello-like features: labels, checklist, due date status
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
    <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="w-80">
      <Card className="shadow-2xl">
        <CardContent className="p-3">
          <div className="flex flex-col gap-2">
            {/* Labels */}
            <div className="flex gap-1 mb-1">
              {labels.map((label, i) => (
                <span key={i} className={`h-2 w-8 rounded ${label.color} text-[0px]`} title={label.name}></span>
              ))}
            </div>
            {/* Title & Priority */}
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{task.title}</h4>
              <PriorityPill p={task.priority} />
            </div>
            {/* Description */}
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">{task.description || "No description"}</p>
            {/* Checklist */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Checklist:</span>
              <span className="text-xs font-semibold">{checklistDone}/{checklist.length}</span>
              <div className="flex gap-1">
                {checklist.map((c, i) => (
                  <span key={i} className={`h-2 w-2 rounded-full ${c.done ? "bg-green-500" : "bg-gray-300"}`}></span>
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
                    <span className={dueDateStatus}>{new Date(task.due_date).toLocaleDateString()}</span>
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
  } = useBoard(id);

  // Handler for dropdown Copy list
  function handleCopyColumn(column: ColumnWithTasks) {
    copyColumn(column);
  }

  // UI state
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardColor, setNewBoardColor] = useState<string | undefined>(undefined);

  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(null);
  const [editingColumnTitle, setEditingColumnTitle] = useState("");

  // const [filterOpen, setFilterOpen] = useState(false); // Removed unused state
  const [query, setQuery] = useState("");

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // derived
  const totalTasks = useMemo(() => columns.reduce((s, c) => s + c.tasks.length, 0), [columns]);

  // simple filter (search on title/description)
  const filteredColumns = useMemo(() => {
    if (!query.trim()) return columns;
    const q = query.toLowerCase();
    return columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => (t.title + " " + (t.description || "")).toLowerCase().includes(q)),
    }));
  }, [columns, query]);

  // handlers
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
    // create in first column by default
    const target = columns[0];
    if (!target) {
      // optional: show toast or validation
      return;
    }
    await createRealTask(target.id, taskData);
  }

  function handleEditColumnOpen(column: ColumnWithTasks) {
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
    setIsEditingColumn(true);
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
      // maybe dropped over a task: find its column and new index
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

  <div className="container mx-auto">
        {/* Sticky toolbar */}
        <div className="sticky top-20 z-30 bg-white/60 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-3 border mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${board?.color ?? "bg-indigo-500"}`} />
              <div className="min-w-0">
                <h2 className="font-bold text-lg truncate">{board?.title ?? "Board"}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{totalTasks} tasks • {columns.length} lists</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10 pr-3 py-2 rounded-full"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <Plus />
                  Add Task
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

            <Button variant="outline" onClick={() => setIsCreatingColumn(true)}>New List</Button>
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
          <div className="flex gap-6 overflow-x-auto">
            {filteredColumns.length === 0 && (
              <div className="flex items-center justify-center w-full py-20">
                <Card className="w-full max-w-2xl text-center p-8">
                  <CardHeader>
                    <CardTitle>No lists yet</CardTitle>
                    <CardDescription>Add a list to get started.</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-4">
                    <div className="flex justify-center gap-2">
                      <Button onClick={() => setIsCreatingColumn(true)}><Plus /> Add first list</Button>
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
    </div>
  );
}

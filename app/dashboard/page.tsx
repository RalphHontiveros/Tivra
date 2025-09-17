"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";

// Hooks & Models
import { useBoards } from "@/lib/hooks/useBoards";
import { Board } from "@/lib/supabase/models";

// UI primitives (your project already has these)
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Icons
import {
  Filter,
  Grid,
  List,
  Plus,
  Rocket,
  Search as SearchIcon,
  ListTodo,
  Trash2,
  Archive,
  X,
} from "lucide-react";

/**
 * DashboardPage
 * A polished dashboard UI for managing boards
 */
export default function DashboardPage(): React.ReactElement {
  // Auth & boards
  const { user } = useUser();
  const {
    createBoard,
    deleteBoard,
    archiveBoard,
    boards = [],
    error,
    loading: boardsLoading,
  } = useBoards();

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterForm, setFilterForm] = useState({
    start: "" as string,
    end: "" as string,
    minTasks: "" as string,
    maxTasks: "" as string,
  });

  // action modals
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [archiveId, setArchiveId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Derived lists
  const boardsWithTaskCount = boards as (Board & { taskCount?: number })[];

  const archivedBoards = useMemo(
    () => boardsWithTaskCount.filter((b) => b.is_archived),
    [boardsWithTaskCount]
  );

  const activeBoards = useMemo(
    () => boardsWithTaskCount.filter((b) => !b.is_archived),
    [boardsWithTaskCount]
  );

  // Filtering logic (search + optional date range & task count)
  const filteredActive = useMemo(() => {
    return activeBoards.filter((b) => {
      // search
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !(b.description || "").toLowerCase().includes(q)) return false;
      }
      // date range
      if (filterForm.start) {
        const start = new Date(filterForm.start);
        if (new Date(b.created_at) < start) return false;
      }
      if (filterForm.end) {
        const end = new Date(filterForm.end);
        if (new Date(b.created_at) > end) return false;
      }
      // task count
      const tasks = Number(b.taskCount || 0);
      if (filterForm.minTasks) {
        if (tasks < Number(filterForm.minTasks)) return false;
      }
      if (filterForm.maxTasks) {
        if (tasks > Number(filterForm.maxTasks)) return false;
      }
      return true;
    });
  }, [activeBoards, search, filterForm]);

  const filteredArchived = useMemo(() => {
    return archivedBoards.filter((b) => {
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        if (!b.title.toLowerCase().includes(q) && !(b.description || "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [archivedBoards, search]);

  // Actions
  const clearFilters = () =>
    setFilterForm({ start: "", end: "", minTasks: "", maxTasks: "" });

  const handleCreateBoard = async () => {
    setCreateLoading(true);
    try {
      await createBoard({ title: "Untitled board" });
      // Ideally the hook updates state; if not, reload or re-fetch inside the hook.
    } finally {
      setCreateLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await deleteBoard(deleteId);
      setDeleteId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmArchiveToggle = async () => {
    if (!archiveId) return;
    setArchiveLoading(true);
    try {
      // toggle archive: if active -> archive, if archived -> restore
      const target = boardsWithTaskCount.find((b) => b.id === archiveId);
      const toArchive = !(target?.is_archived ?? false);
      await archiveBoard(archiveId, toArchive);
      setArchiveId(null);
    } finally {
      setArchiveLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl text-center">
          <h2 className="text-2xl font-semibold text-red-600">Error loading boards</h2>
          <p className="mt-2 text-sm text-gray-600">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-black pb-16">
      <Navbar />

      <main className="container mx-auto px-2 sm:px-6 lg:px-12 py-10">
        {/* Enhanced Header / Welcome */}
        <header className="mb-10 flex flex-col items-center justify-center text-center gap-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-900 dark:text-white tracking-tight drop-shadow-lg">
            Welcome back, {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress ?? "there"} <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
            Manage your boards and keep work moving.
          </p>
        </header>

        {/* Enhanced Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-indigo-100 dark:border-gray-800">
              <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Boards</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
                  {boardsWithTaskCount.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-600/90 flex items-center justify-center shadow">
                <ListTodo className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-green-100 dark:border-gray-800">
              <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Projects</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300">
                  {boardsWithTaskCount.filter((b) => !b.is_archived).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/90 flex items-center justify-center shadow">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-yellow-100 dark:border-gray-800">
              <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Archived Boards</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-yellow-700 dark:text-amber-300">
                  {boardsWithTaskCount.filter((b) => b.is_archived).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-500/90 flex items-center justify-center shadow">
                <Archive className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 border border-indigo-100 dark:border-gray-800">
              <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tasks (est.)</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
                  {boardsWithTaskCount.reduce((acc, b) => acc + (b.taskCount || 0), 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-indigo-500/90 flex items-center justify-center shadow">
                <List className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Enhanced Toolbar */}
        <section className="mb-8">
          <div className="sticky top-16 bg-white/40 dark:bg-gray-900/40 z-10 py-3 rounded-xl shadow-sm backdrop-blur-md border border-blue-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Left: Search */}
              <div className="flex-1 relative max-w-2xl">
                <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-blue-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search boards or descriptions..."
                  className="pl-10 pr-10 py-3 rounded-xl border-2 border-blue-100 focus:border-blue-300 shadow-md"
                  aria-label="Search boards"
                />
                {search && (
                  <button
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {/* active filter chips */}
                {(filterForm.start || filterForm.end || filterForm.minTasks || filterForm.maxTasks) && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {filterForm.start && <Badge className="px-2 py-1">From: {filterForm.start}</Badge>}
                    {filterForm.end && <Badge className="px-2 py-1">To: {filterForm.end}</Badge>}
                    {filterForm.minTasks && <Badge className="px-2 py-1">≥ {filterForm.minTasks} tasks</Badge>}
                    {filterForm.maxTasks && <Badge className="px-2 py-1">≤ {filterForm.maxTasks} tasks</Badge>}
                    <button
                      className="text-sm text-gray-500 underline ml-1"
                      onClick={() => clearFilters()}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg bg-white/80 dark:bg-gray-800/80 border p-[6px] shadow-md">
                  <button
                    className={`p-2 rounded-md ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    className={`p-2 rounded-md ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-600 dark:text-gray-300"}`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
                  <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>

                <Button variant="outline" size="sm" onClick={() => setActiveTab("archived")}>
                  <Archive className="mr-2 h-4 w-4" /> Archived
                </Button>

                <Button
                  onClick={handleCreateBoard}
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold"
                  disabled={createLoading}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createLoading ? "Creating..." : "Create Board"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Tabs */}
        <section>
          <div className="flex items-center gap-4 mb-8 justify-center">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "active" ? "bg-indigo-600 text-white" : "bg-white/60 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              onClick={() => setActiveTab("active")}
            >
              Active ({filteredActive.length})
            </button>
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "archived" ? "bg-indigo-600 text-white" : "bg-white/60 dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}
              onClick={() => setActiveTab("archived")}
            >
              Archived ({filteredArchived.length})
            </button>
          </div>

          {/* Active tab content */}
          {activeTab === "active" ? (
            <>
              {boardsLoading ? (
                <div className="text-center py-16 text-gray-500 text-lg">Loading boards…</div>
              ) : filteredActive.length === 0 ? (
                <div className="text-center py-16">
                  <Rocket className="mx-auto h-14 w-14 text-blue-300 animate-bounce" />
                  <p className="mt-5 text-lg text-gray-600 dark:text-gray-300">No active boards found.</p>
                  <div className="mt-8">
                    <Button onClick={handleCreateBoard} className="px-6 py-3 text-base">
                      <Plus className="mr-2 h-5 w-5" /> Create your first board
                    </Button>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  <AnimatePresence>
                    {filteredActive.map((board) => {
                      const tasks = board.taskCount ?? 0;
                      return (
                        <motion.div
                          key={board.id}
                          layout
                          initial={{ opacity: 0, y: 6, scale: 0.995 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.995 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Link href={`/boards/${board.id}`} className="block">
                            <Card className="bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-5 hover:shadow-2xl transition-transform hover:-translate-y-1 border border-blue-100 dark:border-gray-800 relative">
                              <CardHeader className="flex items-start justify-between p-0 gap-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow ${board.color ?? "bg-gray-200"}`} />
                                  <div>
                                    <CardTitle className="text-base font-bold text-gray-900 dark:text-white">
                                      {board.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                                      {board.description ?? ""}
                                    </CardDescription>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge className="px-2 py-1 text-xs">Active</Badge>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                    <div>Created {new Date(board.created_at).toLocaleDateString()}</div>
                                    <div>{tasks} tasks</div>
                                  </div>
                                </div>
                              </CardHeader>
                            </Card>
                          </Link>

                          {/* Card actions overlay (appear on hover) */}
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setArchiveId(board.id);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-sm font-medium shadow"
                              aria-label="Archive board"
                            >
                              <Archive className="h-4 w-4" />
                              Archive
                            </button>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteId(board.id);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium shadow"
                              aria-label="Delete board"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {/* Create card */}
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-stretch"
                  >
                    
                  </motion.div>
                </motion.div>
              ) : (
                // List view
                <div className="space-y-5">
                  {filteredActive.map((board) => (
                    <motion.div key={board.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link href={`/boards/${board.id}`}>
                        <Card className="p-5 hover:shadow-lg transition-shadow rounded-xl border border-blue-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-4 h-4 rounded-full border-2 border-white shadow ${board.color ?? "bg-gray-200"}`} />
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white text-base">{board.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{board.description}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-xs text-gray-500 dark:text-gray-400">{(board.taskCount ?? 0)} tasks</div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setArchiveId(board.id);
                                }}
                                className="p-2 rounded-lg hover:bg-yellow-100"
                                aria-label="Archive board"
                              >
                                <Archive className="h-4 w-4 text-yellow-600" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setDeleteId(board.id);
                                }}
                                className="p-2 rounded-lg hover:bg-red-100"
                                aria-label="Delete board"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Archived tab
            <>
              {filteredArchived.length === 0 ? (
                <div className="text-center py-12">
                  <Archive className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-300">No archived boards yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredArchived.map((board) => (
                    <motion.div key={board.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Card className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">{board.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{board.description}</div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <Badge className="px-2 py-1 text-xs">Archived</Badge>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  setArchiveId(board.id);
                                }}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm"
                              >
                                Restore
                              </button>

                              <button
                                onClick={() => setDeleteId(board.id)}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Archive confirm dialog */}
      <Dialog open={!!archiveId} onOpenChange={() => setArchiveId(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>{archiveId && (boardsWithTaskCount.find(b => b.id === archiveId)?.is_archived ? "Restore Board" : "Archive Board")}</DialogTitle>
            <p className="text-sm text-gray-600">
              {archiveId && (boardsWithTaskCount.find(b => b.id === archiveId)?.is_archived
                ? "Restore this board back to active projects?"
                : "Archive this board so it's removed from active projects?" )}
            </p>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setArchiveId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmArchiveToggle}
              disabled={archiveLoading}
            >
              {archiveLoading ? "Processing..." : (boardsWithTaskCount.find(b => b.id === archiveId)?.is_archived ? "Restore" : "Archive")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <p className="text-sm text-gray-600">This action cannot be undone. Are you sure you want to delete this board?</p>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Drawer/Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Filter Boards</DialogTitle>
            <p className="text-sm text-gray-600">Narrow down boards with date & task count filters.</p>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div>
              <Label>Start date</Label>
              <Input
                type="date"
                value={filterForm.start}
                onChange={(e) => setFilterForm((p) => ({ ...p, start: e.target.value }))}
              />
            </div>

            <div>
              <Label>End date</Label>
              <Input
                type="date"
                value={filterForm.end}
                onChange={(e) => setFilterForm((p) => ({ ...p, end: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Min tasks</Label>
                <Input
                  type="number"
                  min={0}
                  value={filterForm.minTasks}
                  onChange={(e) => setFilterForm((p) => ({ ...p, minTasks: e.target.value }))}
                />
              </div>
              <div>
                <Label>Max tasks</Label>
                <Input
                  type="number"
                  min={0}
                  value={filterForm.maxTasks}
                  onChange={(e) => setFilterForm((p) => ({ ...p, maxTasks: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-between items-center gap-3">
              <Button variant="outline" onClick={() => { clearFilters(); setIsFilterOpen(false); }}>Clear</Button>
              <div className="flex gap-2">
                <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

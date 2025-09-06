"use client"

import { Navbar } from "@/components/navbar"
import { useUser } from "@clerk/nextjs"
import { useBoards } from "@/lib/hooks/userBoards"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

// https://sincere-peacock-82.clerk.accounts.dev

export default function Dashboard() {
  const { user } = useUser()
  const {createBoard} = useBoards()

  const handleCreateBoard = async () => {
    await createBoard({ title: "New Board" });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <Navbar />

      {/* Dashboard content wrapper with padding to avoid navbar overlap */}
      <div className="pt-24 px-8 pb-8">
        {/* Welcome Card */}
        <div className="bg-gray-800/70 backdrop-blur-md rounded-2xl p-8 shadow-lg max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            Welcome Back{user ? `, ${user.firstName}` : ""}!
          </h1>
          <p className="mt-2 text-gray-300 text-lg sm:text-xl">
            Here is a quick overview of your dashboard
          </p>

          {/* Create Button */}
          <div className="mt-6">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors duration-300" onClick={handleCreateBoard}>
              + Create
            </button>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Card */}
          <div className="bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold">Tasks</h3>
            <p className="mt-2 text-gray-300">You have 12 pending tasks</p>
          </div>

          <div className="bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold">Projects</h3>
            <p className="mt-2 text-gray-300">You are managing 3 active projects</p>
          </div>

          <div className="bg-gray-800/70 backdrop-blur-md rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold">Notifications</h3>
            <p className="mt-2 text-gray-300">5 new updates waiting for you</p>
          </div>
        </div>
      </div>
    </div>
  )
}

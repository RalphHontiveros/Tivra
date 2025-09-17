"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckSquare,
  Users,
  Zap,
  Shield,
  ListTodo,
  Sun,
  Moon,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // keep theme class in sync with document (works with Tailwind dark mode class strategy)
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const features = [
    {
      icon: CheckSquare,
      title: "Task Management",
      description: "Organize your tasks with intuitive drag-and-drop boards",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together with your team in real-time",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built with Next.js 15 for optimal performance",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "Protected with enterprise-grade authentication",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-500">
      <Navbar />

      {/* Floating theme toggle */}
      <div className="fixed top-6 right-6 z-50">
        <button
          aria-label="Toggle theme"
          title="Toggle theme"
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="flex items-center gap-2 p-2 rounded-full shadow-lg bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="sr-only">Toggle theme</span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white mb-6">
              Organize work and life,
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                effortlessly.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
              Taskero helps teams move work forward. Collaborate, manage projects, and reach new productivity
              peaks — no limits, no hidden costs.
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              {!isSignedIn ? (
                <>
                  <Button
                    variant="default"
                    size="lg"
                    className="text-lg px-8 py-3 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:scale-[1.02] focus-visible:ring-4"
                  >
                    Watch Demo
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-6 py-3 font-medium"
                    aria-label="Learn more about Taskero"
                  >
                    Learn more
                  </Button>
                </>
              ) : (
                <a href="/dashboard">
                  <Button
                    variant="default"
                    size="lg"
                    className="text-lg px-8 py-3 shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:scale-[1.02]"
                  >
                    Go to Dashboard
                  </Button>
                </a>
              )}
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              <li>Boards •</li>
              <li>Calendar •</li>
              <li>Automations •</li>
              <li>Integrations •</li>
              <li>Permissions •</li>
              <li>Offline Mode</li>
            </ul>

            <div className="mt-10">
              <p className="text-xs text-gray-400">Trusted by teams at</p>
              <div className="flex gap-6 mt-4 items-center text-gray-500 dark:text-gray-400">
                <span className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800/60">Acme</span>
                <span className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800/60">Nebula</span>
                <span className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800/60">Atlas</span>
              </div>
            </div>
          </div>

          {/* Illustration / Mockup area */}
          <div className="relative">
            <div className="mx-auto w-full max-w-md lg:max-w-xl">
              <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                {/* simple mockup header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="p-6">
                  <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4">
                    {/* placeholder for a board mockup */}
                    <div className="flex gap-3 h-full">
                      <div className="w-1/3 bg-white/90 dark:bg-white/5 p-2 rounded-lg"> 
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
                      </div>
                      <div className="w-1/3 bg-white/90 dark:bg-white/5 p-2 rounded-lg">
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
                      </div>
                      <div className="w-1/3 bg-white/90 dark:bg-white/5 p-2 rounded-lg">
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* subtle spotlight */}
              <div className="absolute -left-6 -bottom-6 w-40 h-40 rounded-full blur-3xl bg-gradient-to-r from-blue-400 to-indigo-600 opacity-10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            Everything you need to stay organized
          </h2>
          <p className="text-md text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-3">
            Powerful features to help your team collaborate and get more done.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-2xl transition-shadow rounded-2xl bg-white dark:bg-gray-900 transform-gpu hover:-translate-y-1 focus-within:scale-100"
              aria-labelledby={`feature-${index}`}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                  <feature.icon className="h-7 w-7 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                </div>
                <CardTitle id={`feature-${index}`} className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Small testimonial / social proof */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 shadow-lg border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-lg text-gray-800 dark:text-gray-200">Taskero reduced our planning chaos — we ship faster and communicate better</p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">— Jamie L., Product Manager</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="px-6 py-2">Read stories</Button>
              <Button variant="default" className="px-6 py-2">Start free</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="relative rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-10 pointer-events-none" />
          <div className="relative z-10 rounded-3xl bg-white dark:bg-gray-900 p-10 shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">Start using Taskero today</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Join teams and individuals who are already using Taskero to stay organized.</p>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">🚀 Get Started</Button>
                <Button variant="ghost" size="lg" className="px-6 py-3">Contact Sales</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ListTodo className="h-7 w-7 text-blue-600 dark:text-blue-300" />
                <div>
                  <div className="text-lg font-bold">Taskero</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Organize work, ship faster</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Taskero. All rights reserved.</div>
            </div>

            <div className="flex gap-8">
              <div>
                <div className="font-semibold mb-2">Product</div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Features</li>
                  <li>Pricing</li>
                  <li>Integrations</li>
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-2">Company</div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>About</li>
                  <li>Careers</li>
                  <li>Press</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

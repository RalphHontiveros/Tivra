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
} from "lucide-react";
import Navbar from "@/components/navbar";

export default function HomePage() {
  const { isSignedIn } = useUser();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Organize work and life,{" "}
            <span className="text-blue-600">effortlessly.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Taskero helps teams move work forward. Collaborate, manage projects,
            and reach new productivity peaks — no limits, no hidden costs.
          </p>

          {/* Optional demo button only */}
          {!isSignedIn && (
            <div className="flex justify-center">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to stay organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features to help your team collaborate and get more done.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start using Taskero today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join teams and individuals who are already using Taskero to stay
            organized.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <ListTodo className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold">Taskero</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 Taskero. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

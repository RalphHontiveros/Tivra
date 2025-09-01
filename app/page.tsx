import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 min-h-screen flex flex-col items-center justify-center text-white">
        {/* Overlay effect for better readability */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to Taskero
          </h1>
          <p className="text-lg md:text-2xl mb-6">
            Organize your tasks efficiently and boost your productivity!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/boards"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </a>
            <a
              href="/about"
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </main>
    </>
  );
}

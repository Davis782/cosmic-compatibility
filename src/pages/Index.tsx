import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect Match with{" "}
            <span className="text-primary">LoveMeet</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Connect with like-minded individuals based on zodiac compatibility,
            shared interests, and genuine connections. Start your journey to find
            true love today.
          </p>
          <div className="flex gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="text-lg">
                Start Meeting People
              </Button>
            </Link>
            <Link to="/profile">
              <Button size="lg" variant="outline" className="text-lg">
                Create Profile
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
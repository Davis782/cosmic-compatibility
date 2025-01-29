import { Navbar } from "@/components/layout/Navbar";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-6">Browse Matches</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile cards will go here in the next iteration */}
          <div className="h-64 bg-white rounded-lg shadow-md animate-float"></div>
          <div className="h-64 bg-white rounded-lg shadow-md animate-float"></div>
          <div className="h-64 bg-white rounded-lg shadow-md animate-float"></div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
import { Navbar } from "@/components/layout/Navbar";

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">Profile editing coming soon...</p>
        </div>
      </main>
    </div>
  );
};

export default Profile;
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Profile, getProfiles, createMatch } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const Dashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const fetchedProfiles = await getProfiles();
        setProfiles(fetchedProfiles);
        console.log("Fetched profiles:", fetchedProfiles);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleMatch = async (profileId: number) => {
    try {
      // Current user ID is 1 for demo purposes
      await createMatch(1, profileId);
      toast({
        title: "Success",
        description: "Match created successfully!",
      });
      navigate(`/messages?matchId=${profileId}`);
    } catch (error) {
      console.error("Error creating match:", error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <h1 className="text-3xl font-bold mb-6">Loading...</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-6">Browse Matches</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={profile.image_url}
                alt={profile.name}
                className="w-full h-48 object-cover"
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>{profile.zodiac}</CardDescription>
                  </div>
                  {profile.bio_matches > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      Bio Match
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{profile.bio}</p>
                <p className="text-sm text-gray-500 mt-2">{profile.location}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  onClick={() => handleMatch(profile.id)}
                >
                  Connect
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
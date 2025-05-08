
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Profile, getProfiles, createMatch } from "@/lib/db";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Heart, Star, Shield, BookOpen, Briefcase } from "lucide-react";

const Dashboard = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, subscriptionTier } = useAuth();

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
      // Use current user ID instead of hardcoded 1
      await createMatch(user?.id || 1, profileId);
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

  const getZodiacEmoji = (zodiac: string): string => {
    const zodiacEmojis: Record<string, string> = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };
    
    return zodiacEmojis[zodiac] || '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-3xl font-bold mb-2">Browse Matches</h1>
        <p className="text-gray-600 mb-6">Discover your cosmic connections</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No profiles found! Check back later.</p>
            </div>
          ) : (
            profiles.map((profile) => (
              <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={profile.image_url}
                  alt={profile.name}
                  className="w-full h-48 object-cover"
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {profile.name}
                        {profile.verified && (
                          <Badge variant="outline" className="ml-2">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        {getZodiacEmoji(profile.zodiac)} {profile.zodiac}
                      </CardDescription>
                    </div>
                    {profile.bio_matches > 0 && (
                      <Badge variant="secondary" className="ml-2 flex items-center">
                        <Heart className="h-3 w-3 mr-1" />
                        Bio Match
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{profile.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.education_level && (
                      <Badge variant="outline" className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {profile.education_level}
                      </Badge>
                    )}
                    {profile.financial_status && (
                      <Badge variant="outline" className="flex items-center">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {profile.financial_status}
                      </Badge>
                    )}
                    {profile.personality_type && (
                      <Badge variant="outline" className="flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        {profile.personality_type}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500">{profile.location}</p>
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
            ))
          )}
        </div>
        
        {subscriptionTier === 'basic' && (
          <div className="mt-12 bg-primary/10 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Unlock More Matches!</h2>
            <p className="mb-4">Subscribe to Premium or Elite to access unlimited matches and advanced compatibility features.</p>
            <Button onClick={() => navigate('/subscription')}>
              Upgrade Your Plan
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Profile as ProfileType, Match, getMatches, updateProfile } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Map from "@/components/Map";

const Profile = () => {
  const [profile, setProfile] = useState<ProfileType>({
    id: 1, // For demo purposes, assuming logged in user is ID 1
    name: "Alice Johnson",
    bio: "Love hiking and photography",
    zodiac: "Libra",
    image_url: "/placeholder.svg",
    location: "New York, NY"
  });

  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Coffee Meetup",
      location: "Central Park Coffee",
      date: new Date(),
      distance: "0.5 miles",
      coordinates: [-73.968285, 40.785091]
    },
    {
      id: 2,
      title: "Photography Walk",
      location: "Brooklyn Bridge",
      date: new Date(),
      distance: "1.2 miles",
      coordinates: [-73.996705, 40.706186]
    }
  ]);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const fetchedMatches = await getMatches(profile.id);
        setMatches(fetchedMatches);
        console.log("Fetched matches:", fetchedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    loadMatches();
  }, [profile.id]);

  const handleProfileUpdate = (field: keyof ProfileType, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await updateProfile(profile.id, profile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      console.log("Profile updated:", profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Edit Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.image_url} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => handleProfileUpdate("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => handleProfileUpdate("bio", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zodiac">Zodiac Sign</Label>
                  <Input
                    id="zodiac"
                    value={profile.zodiac}
                    onChange={(e) => handleProfileUpdate("zodiac", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => handleProfileUpdate("location", e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
              </CardContent>
            </Card>
          </div>

          {/* Matches and Events Section */}
          <div className="space-y-6">
            {/* Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Your Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Match #{match.id}</p>
                        <p className="text-sm text-gray-500">{match.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Events Calendar and Map */}
            <Card>
              <CardHeader>
                <CardTitle>Nearby Events</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="mb-4"
                />
                <div className="h-[300px] mb-4">
                  <Map events={events} />
                </div>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location} ({event.distance})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
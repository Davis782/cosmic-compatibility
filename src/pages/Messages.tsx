
import { Navbar } from "@/components/layout/Navbar";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile, deleteMatch } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import * as db from "@/lib/db";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Heart, Shield } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  timestamp: string;
}

interface Match {
  id: number;
  profile1_id: number;
  profile2_id: number;
  status: string;
  name: string;
  image_url: string;
  location: string;
  verified?: boolean;
  zodiac?: string;
  compatibility_score?: number;
}

const Messages = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const { toast } = useToast();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Current user ID from auth context instead of hardcoded
  const currentUserId = user?.id || 1;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const fetchedMatches = await db.getMatches(currentUserId);
        console.log("Fetched matches:", fetchedMatches);
        setMatches(fetchedMatches);
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Error",
          description: "Failed to load matches",
          variant: "destructive"
        });
      }
    };

    fetchMatches();
  }, [toast, currentUserId]);

  useEffect(() => {
    const fetchMatchData = async () => {
      if (!matchId) return;
      
      try {
        // Fetch matched profile
        const profiles = await db.getProfiles();
        const profile = profiles.find(p => p.id === parseInt(matchId));
        
        if (profile) {
          setMatchedProfile(profile);
        }

        // Fetch messages
        const fetchedMessages = await db.getMessages(parseInt(matchId));
        console.log("Fetched messages:", fetchedMessages);
        setMessages(fetchedMessages);
        
        // Scroll to bottom of messages
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive"
        });
      }
    };

    fetchMatchData();
    // Set up polling for new messages
    const interval = setInterval(fetchMatchData, 5000);
    return () => clearInterval(interval);
  }, [matchId, toast]);

  const handleSendMessage = async () => {
    if (!message.trim() || !matchId) return;

    try {
      const newMessage = await db.sendMessage({
        matchId: parseInt(matchId),
        senderId: currentUserId,
        content: message.trim()
      });

      if (newMessage) {
        setMessages(prev => [newMessage, ...prev]);
        
        // Scroll to bottom after sending
        setTimeout(() => {
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
          }
        }, 100);
      }

      setMessage("");
      console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchId) return;
    
    try {
      const success = await deleteMatch(parseInt(matchId));
      if (success) {
        toast({
          title: "Success",
          description: "Match deleted successfully",
        });
        
        // Remove the match from the local state
        setMatches(prev => prev.filter(match => match.id !== parseInt(matchId)));
        setMatchedProfile(null);
        
        // Clear the matchId from URL
        window.history.pushState({}, '', '/messages');
      }
    } catch (error) {
      console.error("Error deleting match:", error);
      toast({
        title: "Error",
        description: "Failed to delete match",
        variant: "destructive"
      });
    }
    
    setIsAlertOpen(false);
  };

  if (!matchId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>
          <div className="grid gap-4 max-w-2xl mx-auto">
            {matches.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-gray-600">No matches yet</p>
                <Button onClick={() => window.location.href = '/dashboard'} className="mt-4">
                  Find Matches
                </Button>
              </Card>
            ) : (
              matches.map((match) => (
                <Link 
                  key={match.id} 
                  to={`/messages?matchId=${match.id}`}
                  className="block"
                >
                  <Card className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={match.image_url} alt={match.name} />
                        <AvatarFallback>{match.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h2 className="font-semibold">{match.name}</h2>
                          {match.verified && (
                            <Badge variant="outline" className="ml-2 h-5">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {match.is_bio_match && (
                            <Badge variant="secondary" className="ml-2 h-5">
                              <Heart className="h-3 w-3 mr-1" />
                              Match
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{match.location}</p>
                      </div>
                      {match.compatibility_score && (
                        <div className="bg-primary/10 text-primary font-medium rounded-full h-8 w-8 flex items-center justify-center" title="Compatibility Score">
                          {match.compatibility_score}%
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Card className="max-w-2xl mx-auto">
          {matchedProfile && (
            <div className="p-4 border-b flex items-center">
              <div className="flex items-center flex-1 gap-3">
                <Avatar>
                  <AvatarImage src={matchedProfile.image_url} alt={matchedProfile.name} />
                  <AvatarFallback>{matchedProfile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">{matchedProfile.name}</h2>
                  <p className="text-sm text-gray-500">{matchedProfile.location}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Match
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this match?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the match and all your conversations. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMatch} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div ref={messageContainerRef} className="h-[400px] overflow-y-auto p-4 border-b flex flex-col-reverse">
            {messages.length === 0 ? (
              <p className="text-gray-600 text-center">Start your conversation...</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-4 ${
                    msg.sender_id === currentUserId
                      ? "ml-auto text-right"
                      : "mr-auto"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      msg.sender_id === currentUserId
                        ? "bg-primary text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Messages;

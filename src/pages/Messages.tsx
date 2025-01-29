import { Navbar } from "@/components/layout/Navbar";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import * as db from "@/lib/db";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  timestamp: string;
}

const Messages = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Simulated current user ID (in a real app, this would come from auth)
  const currentUserId = 1;

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

  if (!matchId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <h1 className="text-3xl font-bold mb-6">No conversation selected</h1>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <Card className="max-w-2xl mx-auto">
          {matchedProfile && (
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={matchedProfile.image_url} alt={matchedProfile.name} />
                <AvatarFallback>{matchedProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{matchedProfile.name}</h2>
                <p className="text-sm text-gray-500">{matchedProfile.location}</p>
              </div>
            </div>
          )}
          <div className="h-[400px] overflow-y-auto p-4 border-b flex flex-col-reverse">
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
                        ? "bg-blue-500 text-white"
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
import { Navbar } from "@/components/layout/Navbar";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Messages = () => {
  const [searchParams] = useSearchParams();
  const matchId = searchParams.get("matchId");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>
        <Card className="max-w-2xl mx-auto">
          <div className="h-[400px] overflow-y-auto p-4 border-b">
            {/* Messages will be displayed here */}
            <p className="text-gray-600 text-center">Start your conversation...</p>
          </div>
          <div className="p-4 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage}>Send</Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Messages;
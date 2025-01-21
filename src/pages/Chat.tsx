import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationList } from "@/components/chat/ConversationList";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  content: string;
  type: "human" | "ai";
}

interface Conversation {
  sessionId: string;
  title: string;
}

export default function Chat() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { signOut } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConversations();
    const subscription = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new && payload.new.session_id === sessionId) {
            const message = payload.new.message as { content: string; type: string };
            setMessages((prev) => [
              ...prev,
              { content: message.content, type: message.type as "human" | "ai" },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sessionId]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("session_id, message")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const conversationsMap = new Map<string, string>();
      data.forEach((row) => {
        if (!conversationsMap.has(row.session_id) && row.message.type === "human") {
          conversationsMap.set(
            row.session_id,
            row.message.content.slice(0, 100) + (row.message.content.length > 100 ? "..." : "")
          );
        }
      });

      const conversationsList = Array.from(conversationsMap.entries()).map(
        ([sessionId, title]) => ({
          sessionId,
          title,
        })
      );

      setConversations(conversationsList);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch conversations",
        variant: "destructive",
      });
    }
  };

  const loadConversation = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("message")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(
        data.map((row) => ({
          content: row.message.content,
          type: row.message.type,
        }))
      );
      setSessionId(sessionId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation",
        variant: "destructive",
      });
    }
  };

  const startNewChat = () => {
    setSessionId(uuidv4());
    setMessages([]);
  };

  const sendMessage = async (content: string) => {
    if (!sessionId) {
      startNewChat();
      return;
    }

    setLoading(true);
    try {
      const requestId = uuidv4();
      const response = await fetch("http://localhost:8001/api/pydantic-github-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: content,
          user_id: "NA",
          request_id: requestId,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error("Request failed");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div
        className={cn(
          "w-80 border-r bg-card transition-all duration-300 ease-in-out",
          !sidebarOpen && "-ml-80"
        )}
      >
        <ConversationList
          conversations={conversations}
          activeSessionId={sessionId}
          onSelect={loadConversation}
          onNewChat={startNewChat}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="ghost" onClick={() => signOut()}>
            Sign Out
          </Button>
        </header>
        <ScrollArea className="flex-1 p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              type={message.type}
            />
          ))}
          <div ref={messagesEndRef} />
        </ScrollArea>
        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  );
}
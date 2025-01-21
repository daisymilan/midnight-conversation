import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface Conversation {
  sessionId: string;
  title: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export function ConversationList({
  conversations,
  activeSessionId,
  onSelect,
  onNewChat,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={onNewChat} className="w-full">
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.sessionId}
              onClick={() => onSelect(conversation.sessionId)}
              className={cn(
                "w-full px-4 py-2 rounded-lg text-left flex items-center gap-3 hover:bg-accent transition-colors",
                activeSessionId === conversation.sessionId && "bg-accent"
              )}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="text-sm truncate">{conversation.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  content: string;
  type: "human" | "ai";
}

export function ChatMessage({ content, type }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "px-4 py-2 rounded-lg max-w-[80%] animate-message-pop",
        type === "human"
          ? "ml-auto bg-chat-bubble-user text-white"
          : "bg-chat-bubble-ai"
      )}
    >
      {type === "human" ? (
        <p className="text-sm">{content}</p>
      ) : (
        <ReactMarkdown className="markdown">{content}</ReactMarkdown>
      )}
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export function Chat() {
  const routeName = useSearchParams().get("model") || "chat";
  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      api: `api/${routeName}`,
      onError: (e) => {
        console.log(e);
      },
    });
  const chatParent = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  });

  if (!isLoaded || !isSignedIn) {
    return (
      <p className="text-center mt-4">Sign in to interact with the chat bot.</p>
    );
  }

  // Function to clear chat messages
  const handleClearChat = () => {
    setMessages([]);
  };

  // Function to set the height of the textarea
  const handleInputChangeSize = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <main className="flex flex-col w-full h-[calc(100vh-65px)] max-h-dvh bg-background">
      <section className="container px-0 p-4 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
        <ul
          ref={chatParent}
          className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4"
        >
          {messages.map((m, index) => (
            <div key={index}>
              {m.role === "user" ? (
                <li key={m.id} className="flex flex-row-reverse">
                  <Avatar className="ml-1.5 mt-3 h-8 w-8">
                    <AvatarImage alt={`@${user?.username}`} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-xl p-4 bg-muted shadow-md flex">
                    <p className="text-primary">{m.content}</p>
                  </div>
                </li>
              ) : (
                <li key={m.id} className="flex flex-row">
                  <Avatar className="mr-1.5 mt-3 h-8 w-8">
                    <AvatarImage src="/IconImages/chatbot.png" alt="@AIGPT" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                    <p className="text-primary">{m.content}</p>
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul>
      </section>

      <section className="pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto items-center relative"
        >
          <Textarea
            ref={inputRef}
            placeholder="Type your question here..."
            value={input}
            onChange={(e) => {
              handleInputChange(e);
              handleInputChangeSize();
            }}
            onKeyDown={(e: any) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            tabIndex={0}
            className={`w-full max-h-64 resize-none bg-transparent pl-4 pr-32 py-[1.3rem] focus-within:outline-none sm:text-sm ${
              !inputRef.current
                ? "overflow-hidden"
                : inputRef.current.scrollHeight <= 64 * 4
                ? "overflow-hidden"
                : "overflow-auto"
            }`}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            name="message"
            rows={1}
          />
          <div className="absolute right-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="rounded-xl h-10 w-10 px-2" type="submit">
                    <ArrowUp size={22} strokeWidth={2.35} />
                    <span className="sr-only">Send chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Send chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleClearChat}
                    className="ml-3 rounded-xl h-10 w-10 px-2"
                  >
                    <Trash size={22} strokeWidth={2.35} />
                    <span className="sr-only">Clear current chat</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>Clear current chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </form>
      </section>
    </main>
  );
}

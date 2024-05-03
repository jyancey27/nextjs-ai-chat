"use client";

import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { ModeToggle } from "@/components/ModeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowUp, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function Chat() {
  const [routeName, setRouteName] = useState("chat");
  const { messages, setMessages, input, handleInputChange, handleSubmit } =
    useChat({
      api: `api/${routeName}`,
      onError: (e) => {
        console.log(e);
      },
    });
  const chatParent = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Function to clear chat messages
  const handleClearChat = () => {
    setMessages([]);
  };

  // Function to change api routes/models
  const handleChangeModel = (e: string) => {
    setMessages([]);
    setRouteName(e);
  };

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <main className="flex flex-col w-full h-screen max-h-dvh bg-background">
      <header className="p-3 border-b w-full max-w-3xl mx-auto flex items-center">
        <h1 className="text-2xl font-bold flex-1">LangChain Chat</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="information" size="circle" className="mr-2">
                ?
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="center">
              <p className="max-w-[220px]">
                Allows you to change the current selected model.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mr-4">
          <Select
            onValueChange={(e) => handleChangeModel(e)}
            defaultValue={routeName}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chat">Base</SelectItem>
              <SelectItem value="ex1">LangChain Base</SelectItem>
              <SelectItem value="ex2">Jokes</SelectItem>
              <SelectItem value="ex3">Pirate Jokes</SelectItem>
              <SelectItem value="ex4">RAG States</SelectItem>
              <SelectItem value="ex5">RAG Resume</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <ModeToggle />
        </div>
      </header>

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
                    <AvatarImage src="" alt="@jaydonyancey7" />
                    <AvatarFallback>JY</AvatarFallback>
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
            onChange={handleInputChange}
            tabIndex={0}
            className="min-h-[60px] w-full resize-none bg-transparent pl-4 pr-32 py-[1.3rem] focus-within:outline-none sm:text-sm"
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

"use client";

import { Input } from "@/components/ui/input";
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

  return (
    <main className="flex flex-col w-full h-screen max-h-dvh bg-background">
      <header className="p-4 border-b w-full max-w-3xl mx-auto flex items-center">
        <h1 className="text-2xl font-bold flex-1">LangChain Chat</h1>
        <p className="mr-2">Model:</p>
        <div className="mr-4">
          <Select
            onValueChange={(e) => handleChangeModel(e)}
            defaultValue={routeName}
          >
            <SelectTrigger className="w-[180px]">
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

      <section className="p-4">
        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-3xl mx-auto items-center"
        >
          <Input
            className="flex-1 min-h-[40px]"
            placeholder="Type your question here..."
            type="text"
            value={input}
            onChange={handleInputChange}
          />
          <Button className="ml-2" type="submit">
            Submit
          </Button>
          <Button onClick={handleClearChat} className="ml-2">
            Clear Chat
          </Button>
        </form>
      </section>

      <section className="container px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
        <ul
          ref={chatParent}
          className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4"
        >
          {messages.map((m, index) => (
            <div key={index}>
              {m.role === "user" ? (
                <li key={m.id} className="flex flex-row">
                  <div className="rounded-xl p-4 bg-background shadow-md flex">
                    <p className="text-primary">{m.content}</p>
                  </div>
                </li>
              ) : (
                <li key={m.id} className="flex flex-row-reverse">
                  <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                    <p className="text-primary">{m.content}</p>
                  </div>
                </li>
              )}
            </div>
          ))}
        </ul>
      </section>
    </main>
  );
}

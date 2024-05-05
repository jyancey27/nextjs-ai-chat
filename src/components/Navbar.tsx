"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@clerk/nextjs";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const routeName = useSearchParams().get("model") || "chat";
  const { isLoaded, isSignedIn } = useAuth();

  // Function to change api routes/models
  const handleChangeModel = (e: string) => {
    router.push(`/?model=${e}`);
  };

  return (
    <header className="p-3 border-b w-full max-w-3xl mx-auto flex items-center">
      <h1 className="text-2xl font-bold flex-1 cursor-pointer">
        <a href="/">LangChain Chat</a>
      </h1>
      {isLoaded && isSignedIn && (
        <>
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
        </>
      )}
      <div>
        <ModeToggle />
      </div>
    </header>
  );
}

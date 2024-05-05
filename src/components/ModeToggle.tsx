"use client";

import * as React from "react";
import { Moon, Sun, Check, Settings } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function ModeToggle() {
  const { setTheme, theme, systemTheme } = useTheme();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut, openSignIn, openUserProfile } = useClerk();
  const router = useRouter();

  return (
    <>
      {!isSignedIn ? (
        <p className="cursor-pointer" onClick={() => openSignIn()}>
          Sign in
        </p>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt={`@${user?.username}`} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openUserProfile()}>
              Manage Account
              <DropdownMenuShortcut>
                <Settings className="h-[1.2rem] w-[1.2rem]" />
              </DropdownMenuShortcut>
              <span className="sr-only">Manage account</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setTheme("light")}>
              {theme === "light" && (
                <Check className="h-[1.2rem] w-[1.2rem] mr-1" />
              )}
              Light
              <DropdownMenuShortcut>
                <Sun className="h-[1.2rem] w-[1.2rem]" />
              </DropdownMenuShortcut>
              <span className="sr-only">Toggle light theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              {theme === "dark" && (
                <Check className="h-[1.2rem] w-[1.2rem] mr-1" />
              )}
              Dark
              <DropdownMenuShortcut>
                <Moon className="h-[1.2rem] w-[1.2rem]" />
              </DropdownMenuShortcut>
              <span className="sr-only">Toggle dark theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              {theme === "system" && (
                <Check className="h-[1.2rem] w-[1.2rem] mr-1" />
              )}
              System
              <DropdownMenuShortcut>
                {systemTheme === "dark" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
              </DropdownMenuShortcut>
              <span className="sr-only">Toggle system theme</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut(() => router.push("/"))}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SairButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start md:w-auto md:justify-center"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}

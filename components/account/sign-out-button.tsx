"use client";

import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    const { error } = await authClient.signOut().catch(() => ({ error: true }));
    if (error) {
      setPending(false);
      toast.error("Couldn't sign you out. Please try again.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={signOut} disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <LogOut className="size-4" aria-hidden="true" />}
      Sign out
    </Button>
  );
}

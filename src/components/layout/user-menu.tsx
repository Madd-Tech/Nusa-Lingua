"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({
  username,
  fullName,
  avatarUrl,
}: {
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}) {
  const router = useRouter();

  const signOut = async () => {
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error("Gagal keluar. Coba lagi.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Buka menu akun"
      >
        <UserAvatar name={fullName ?? username} src={avatarUrl} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p className="font-extrabold">{fullName ?? username ?? "Pengguna"}</p>
          {username ? <p className="text-xs font-medium text-muted-foreground">@{username}</p> : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profil">
            <UserRound aria-hidden="true" /> Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profil/pengaturan">
            <Settings aria-hidden="true" /> Pengaturan
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className="text-danger-700 dark:text-danger">
          <LogOut aria-hidden="true" /> Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

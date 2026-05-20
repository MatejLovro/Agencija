"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Receipt,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/rezervacije", icon: CalendarDays, label: "Rezervacije" },
  { href: "/prijave", icon: ClipboardList, label: "Pregled prijava" },
  { href: "/racuni-prijave", icon: FileText, label: "Računi iz prijave" },
  { href: "/racuni", icon: Receipt, label: "Računi" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-20 flex-col items-center border-r bg-background py-4">
      <div className="mb-4 w-full border-b pb-4 text-center text-xs font-medium text-muted-foreground">
        AG
      </div>

      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex w-16 flex-col items-center gap-1 rounded-md px-2 py-2.5 text-center transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              pathname.startsWith(href) &&
                "bg-accent text-accent-foreground font-medium",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="text-[10px] leading-tight">{label}</span>
          </Link>
        ))}
      </nav>

      <button
        className="flex w-16 flex-col items-center gap-1 rounded-md px-2 py-2.5 text-center text-destructive transition-colors hover:bg-destructive/10"
        onClick={() => {
          /* signOut će doći ovdje */
        }}
      >
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="text-[10px] leading-tight">Izlaz</span>
      </button>
    </aside>
  );
}

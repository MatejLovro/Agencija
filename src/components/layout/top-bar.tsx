"use client";

import Link from "next/link";
import {
  Database,
  LayoutList,
  BarChart2,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    label: "Matični podaci",
    icon: Database,
    children: [
      { href: "/iznajmljivaci", label: "Iznajmljivači" },
      { href: "/apartmani", label: "Apartmani" },
      { href: "/gosti", label: "Gosti" },
    ],
  },
  {
    label: "Pregledi",
    icon: LayoutList,
    children: [
      { href: "/kalendar", label: "Kalendar" },
      { href: "/rezervacije", label: "Pregled rezervacija" },
    ],
  },
  {
    label: "Izvješća",
    icon: BarChart2,
    children: [
      { href: "/izvjesca/promet", label: "Promet po apartmanu" },
      { href: "/izvjesca/provizije", label: "Provizije" },
    ],
  },
  {
    label: "Servisne funkcije",
    icon: Settings,
    children: [
      { href: "/servis/korisnici", label: "Korisnici" },
      { href: "/servis/gradovi", label: "Gradovi" },
    ],
  },
];

export function TopBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header
      className="flex h-11 items-center border-b bg-background px-4"
      ref={ref}
    >
      {menuItems.map(({ label, icon: Icon, children }) => (
        <div key={label} className="relative">
          <button
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              openMenu === label && "bg-accent text-accent-foreground",
            )}
            onClick={() => setOpenMenu(openMenu === label ? null : label)}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label}
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </button>

          {openMenu === label && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-48 rounded-md border bg-background py-1 shadow-md">
              {children.map(({ href, label: childLabel }) => (
                <Link
                  key={href}
                  href={href}
                  className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpenMenu(null)}
                >
                  {childLabel}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </header>
  );
}

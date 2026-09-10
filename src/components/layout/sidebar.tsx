"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  CalendarRange,
  Table,
  Receipt,
  Database,
  ChevronRight,
  LogOut,
  PanelLeft,
  ClipboardList,
  FileText,
  Wallet,
  Users,
  Handshake,
  MapPin,
  Flag,
  Wrench,
  Percent,
  CreditCard,
  Ruler,
  Building2,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// ---------------------------------------------------------------------------
// Struktura navigacije — prema docs/sidebar-design.md
// ---------------------------------------------------------------------------

interface SubItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Group {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: { items: SubItem[] }[];
}

const pregledi: Group = {
  label: "Pregledi",
  icon: Table,
  sections: [
    {
      items: [
        { label: "Pregled prijava", icon: ClipboardList }, // ruta ne postoji
        { href: "/rezervacije", label: "Pregled rezervacija", icon: Table },
      ],
    },
  ],
};

const racuniIPonude: Group = {
  label: "Računi i ponude",
  icon: Receipt,
  sections: [
    {
      items: [
        { href: "/ponude", label: "Ponude", icon: FileText },
        { label: "Računi za gosta", icon: Receipt }, // ruta ne postoji
        { label: "Računi za iznajmljivača", icon: Wallet }, // ruta ne postoji
      ],
    },
  ],
};

const maticniPodaci: Group = {
  label: "Matični podaci",
  icon: Database,
  sections: [
    {
      items: [
        { href: "/iznajmljivaci", label: "Iznajmljivači", icon: Users },
        { label: "Gosti", icon: Users }, // ruta postoji ali je prazna
        { label: "Agencije / Partneri", icon: Handshake }, // ruta ne postoji
      ],
    },
    {
      items: [
        { label: "Gradovi", icon: MapPin }, // ruta ne postoji
        { label: "Državljanstva", icon: Flag }, // ruta ne postoji
      ],
    },
    {
      items: [
        { label: "Usluge", icon: Wrench }, // ruta ne postoji
        { label: "Porezne stope", icon: Percent }, // ruta ne postoji
        { label: "Sredstva plaćanja", icon: CreditCard }, // ruta ne postoji
        { label: "Jedinice mjere", icon: Ruler }, // ruta ne postoji
      ],
    },
    {
      items: [
        { label: "Poslovnice", icon: Building2 }, // ruta ne postoji
        { label: "Podešavanja", icon: Settings }, // ruta ne postoji
      ],
    },
  ],
};

const collapsibleGroups = [pregledi, racuniIPonude, maticniPodaci];

function groupContainsPath(group: Group, pathname: string) {
  return group.sections.some((section) =>
    section.items.some(
      (item) => item.href && pathname.startsWith(item.href),
    ),
  );
}

// ---------------------------------------------------------------------------
// Komponenta
// ---------------------------------------------------------------------------

export function Sidebar() {
  const pathname = usePathname();

  return (
    <SidebarPrimitive collapsible="icon">
      <SidebarHeader className="bg-sidebar-header">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-semibold tracking-wide text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            AGENCIJA
          </span>
          <SidebarHeaderTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/"}
                  tooltip="Početna"
                  className={cn(
                    "h-10 text-[15px]",
                    pathname === "/" &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  )}
                >
                  <Link href="/">
                    <House />
                    <span>Početna</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/kalendar")}
                  tooltip="Kalendar rezervacija"
                  className={cn(
                    "h-10 text-[15px]",
                    pathname.startsWith("/kalendar") &&
                      "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                  )}
                >
                  <Link href="/kalendar">
                    <CalendarRange />
                    <span>Kalendar rezervacija</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {collapsibleGroups.map((group) => (
                <NavGroup key={group.label} group={group} pathname={pathname} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Izlaz"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                /* signOut će doći ovdje */
              }}
            >
              <LogOut />
              <span>Izlaz</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

function SidebarHeaderTrigger() {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label="Sažmi/proširi izbornik"
      className="flex size-6 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <PanelLeft className="size-4" />
    </button>
  );
}

function NavGroup({ group, pathname }: { group: Group; pathname: string }) {
  const containsActive = groupContainsPath(group, pathname);
  const [open, setOpen] = useState(containsActive);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={group.label} className="h-10 text-[15px]">
            <group.icon />
            <span>{group.label}</span>
            <ChevronRight className="ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="gap-1 mt-1">
            {group.sections.map((section, sectionIndex) => (
              <SubSection
                key={sectionIndex}
                items={section.items}
                pathname={pathname}
                showSeparatorBefore={sectionIndex > 0}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function SubSection({
  items,
  pathname,
  showSeparatorBefore,
}: {
  items: SubItem[];
  pathname: string;
  showSeparatorBefore: boolean;
}) {
  return (
    <>
      {showSeparatorBefore && (
        <SidebarSeparator className="my-1 mx-2 w-auto bg-sidebar-border/60" />
      )}
      {items.map((item) => {
        const isActive = !!item.href && pathname.startsWith(item.href);
        const Icon = item.icon;

        if (!item.href) {
          return (
            <SidebarMenuSubItem key={item.label}>
              <span
                aria-disabled="true"
                className="flex h-9 min-w-0 -translate-x-px cursor-not-allowed items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground/40"
              >
                <Icon className="size-3.5 shrink-0 text-sidebar-foreground/40" />
                <span className="truncate">{item.label}</span>
              </span>
            </SidebarMenuSubItem>
          );
        }

        return (
          <SidebarMenuSubItem key={item.href}>
            <SidebarMenuSubButton
              asChild
              isActive={isActive}
              className={cn(
                "h-9 text-sm text-sidebar-foreground",
                isActive &&
                  "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
              )}
            >
              <Link href={item.href}>
                <Icon className="size-3.5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      })}
    </>
  );
}

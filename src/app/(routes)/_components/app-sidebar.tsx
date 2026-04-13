"use client";

import { LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { authClient } from "../../../lib/auth-client";

const menuItems = [
  { url: "/dashboard", icon: LayoutDashboard, label: "Projetos" },
];

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AppSidebar() {
  const session = authClient.useSession();
  const pathname = usePathname();

  return (
    <Sidebar variant="floating" collapsible="icon">
      <div className="flex flex-col h-full rounded-xl border border-transparent bg-card/60 shadow-md backdrop-blur shadow-card/75">
        <SidebarHeader className="bg-transparent flex items-center justify-center p-2 rounded-t-xl border-0">
          <span className="sr-only">Gestão de Leads</span>
        </SidebarHeader>

        <SidebarContent className="bg-transparent border-0 flex-1">
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="flex flex-col gap-2 mt-2">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.url === "/dashboard"
                          ? pathname === "/dashboard"
                          : pathname === item.url || pathname.startsWith(item.url + "/")
                      }
                      tooltip={item.label}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span className="truncate group-data-[collapsible=icon]:hidden">
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-card/60 rounded-b-xl border-0 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <div className="flex items-center justify-center rounded-full bg-primary size-8 shrink-0 text-primary-foreground text-sm font-medium">
                      {session.data?.user?.name ? (
                        getInitials(session.data.user.name)
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  <p className="font-medium">{session.data?.user?.name ?? "Usuário"}</p>
                  {session.data?.user?.email && (
                    <p className="text-xs text-primary-foreground/80">{session.data.user.email}</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}

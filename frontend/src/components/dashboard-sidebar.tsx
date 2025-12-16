import { FileText, LogOut, Plus, Star, Trash2, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Link, useRouter } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type DashboardSidebarProps = {
  user: SessionUser;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter();
  const userInitials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function createDocument() {
    return apiFetch<{ id: string }>("/api/documents", {
      method: "POST",
    });
  }

  const { mutate: handleNewDoc } = useMutation({
    mutationFn: createDocument,
    onSuccess: ({ id }) => {
      router.navigate({ to: `/document/${id}` });
    },
  });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar>
        <SidebarHeader>
          <div className="h-16 flex items-center gap-2 border-b border-border px-6">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">HyperDocs</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="p-4">
            <Button className="w-full gap-2" onClick={() => handleNewDoc()}>
              <Plus className="h-4 w-4" />
              New document
            </Button>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link to="/dashboard">
                  <FileText className="h-4 w-4" />
                  <span>All documents</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/dashboard/starred">
                  <Star className="h-4 w-4" />
                  <span>Starred</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/dashboard/shared">
                  <Users className="h-4 w-4" />
                  <span>Shared with me</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/dashboard/trash">
                  <Trash2 className="h-4 w-4" />
                  <span>Trash</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-auto py-2 cursor-pointer">
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-cyan-500 text-sm font-medium text-white">
                      {userInitials}
                    </div>
                    <div className="flex flex-1 flex-col items-start overflow-hidden">
                      <span className="truncate text-sm font-medium">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start cursor-pointer"
                      onClick={async () => {
                        await authClient.signOut();
                        router.navigate({ to: "/login" });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

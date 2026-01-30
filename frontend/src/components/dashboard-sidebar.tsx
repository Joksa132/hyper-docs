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
import { Link, useMatchRoute, useRouter } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

type DashboardSidebarProps = {
  user: SessionUser;
};

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter();
  const matchRoute = useMatchRoute();

  const userInitials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const queryClient = useQueryClient();

  function createDocument() {
    return apiFetch<{ id: string }>("/api/documents", {
      method: "POST",
    });
  }

  const { mutate: handleNewDoc } = useMutation({
    mutationFn: createDocument,
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.navigate({ to: `/document/${id}` });
    },
  });

  return (
    <Sidebar>
        <SidebarHeader className="border-b border-border/50">
          <Link to="/dashboard" className="h-16 flex items-center gap-3 px-6">
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary shadow-sm">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">HyperDocs</span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <div className="p-4">
            <Button
              className="w-full gap-2 shadow-sm"
              onClick={() => handleNewDoc()}
            >
              <Plus className="h-4 w-4" />
              New document
            </Button>
          </div>

          <div className="px-4 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Documents
            </span>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={!!matchRoute({ to: "/dashboard", fuzzy: false })}
              >
                <Link to="/dashboard">
                  <FileText className="h-4 w-4" />
                  <span>All documents</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  !!matchRoute({ to: "/dashboard/starred", fuzzy: true })
                }
              >
                <Link to="/dashboard/starred">
                  <Star className="h-4 w-4" />
                  <span>Starred</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={
                  !!matchRoute({ to: "/dashboard/shared", fuzzy: true })
                }
              >
                <Link to="/dashboard/shared">
                  <Users className="h-4 w-4" />
                  <span>Shared with me</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <div className="px-4 py-2 mt-4">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Other
            </span>
          </div>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={!!matchRoute({ to: "/dashboard/trash", fuzzy: true })}
              >
                <Link to="/dashboard/trash">
                  <Trash2 className="h-4 w-4" />
                  <span>Trash</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/50">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-auto py-3 cursor-pointer">
                    <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-sm">
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
  );
}

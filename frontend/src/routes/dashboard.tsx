import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Input } from "@/components/ui/input";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouteContext,
  useRouter,
} from "@tanstack/react-router";
import { useDebounce } from "@uidotdev/usehooks";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return {
      user: session.user,
    };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user } = useRouteContext({ from: "/dashboard" });

  const router = useRouter();

  const [searchValue, setSearchValue] = useState<string>("");
  const debounced = useDebounce(searchValue, 300);

  useEffect(() => {
    if (!debounced) return;

    router.navigate({
      to: "/dashboard/search",
      search: { query: debounced },
    });
  }, [debounced, router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar user={user} />

        <SidebarInset className="w-full">
          <header className="h-16 sticky top-0 z-30 border-b border-border bg-background/80 px-8 backdrop-blur-sm flex items-center">
            <div className="relative max-w-md flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-10"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </header>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

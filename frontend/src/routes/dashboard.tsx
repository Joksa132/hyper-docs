import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import {
  createFileRoute,
  Outlet,
  redirect,
  useRouteContext,
} from "@tanstack/react-router";

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar user={user} />

        <SidebarInset className="w-full">
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

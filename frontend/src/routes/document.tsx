import { authClient } from "@/lib/auth-client";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/document")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return {
      user: session.user,
    };
  },
  component: DocumentLayout,
});

function DocumentLayout() {
  return (
    <div className="h-screen bg-background">
      <Outlet />
    </div>
  );
}

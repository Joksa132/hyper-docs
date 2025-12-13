import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/shared")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Shared Documents</div>;
}

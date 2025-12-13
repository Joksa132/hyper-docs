import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/starred")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Starred Documents</div>;
}

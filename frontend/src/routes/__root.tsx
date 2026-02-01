import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { createPortal } from "react-dom";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {createPortal(<HeadContent />, document.head)}
      <div className="min-h-screen antialiased">
        <Outlet />
      </div>
    </>
  );
}

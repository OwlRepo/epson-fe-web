import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";

declare module "@tanstack/react-router" {
  interface Register {
    search: {
      q?: string;
      page?: string;
      pageSize?: string;
      [key: string]: string | undefined;
    };
  }
}

export const Route = createRootRoute({
  validateSearch: (search: Record<string, unknown>) => {
    const validated: Record<string, string | undefined> = {};
    if (search.q) validated.q = search.q as string;
    if (search.page) validated.page = search.page as string;
    if (search.pageSize) validated.pageSize = search.pageSize as string;

    // Add any filter params
    Object.entries(search)
      .filter(([key]) => key.startsWith("filter_"))
      .forEach(([key, value]) => {
        validated[key] = value as string;
      });

    return validated;
  },
  component: () => (
    <>
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
      <Toaster />
    </>
  ),
});

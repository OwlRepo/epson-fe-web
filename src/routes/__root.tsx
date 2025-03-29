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
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                search={{}}
                className="text-gray-800 hover:text-gray-600"
                activeOptions={{ exact: true }}
              >
                Home
              </Link>
              <Link
                to="/components"
                search={{}}
                className="text-gray-800 hover:text-gray-600"
                activeOptions={{ exact: true }}
              >
                Components
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
      <Toaster />
    </>
  ),
});

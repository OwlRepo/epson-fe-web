import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/404')({
  component: RouteComponent,
})

import { Button } from "@/components/ui/button"
function RouteComponent() {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="text-7xl font-extrabold text-primary mb-4 select-none">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Button asChild>
        <a href="/">Go Home</a>
      </Button>
    </div>
  );
}

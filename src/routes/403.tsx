import { Button } from '@/components/ui/button';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/403')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted px-4">
      <div className="text-7xl font-extrabold text-primary mb-4 select-none">403</div>
      <h1 className="text-2xl font-bold mb-2">Forbidden</h1>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        You do not have access to this module.
      </p>
      <Button onClick={() => {
        localStorage.clear(),
        router.navigate({
          to: "/",
        });
      }}>
        Go Home
      </Button>
    </div>
  );
}

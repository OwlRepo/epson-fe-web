import { useRouterState } from "@tanstack/react-router";

export function useCurrentPath(): string {
  const routerState = useRouterState();
  return routerState.location.pathname;
}
